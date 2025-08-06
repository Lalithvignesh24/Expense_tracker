// server/controllers/expenseController.js
const Expense = require('../models/expense');
const Wallet = require('../models/Wallet'); // Assuming you have a Wallet model
const asyncHandler = require('express-async-handler');

const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
  res.json(expenses);
});

const addExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, date, notes, type, walletId } = req.body;

  if (!description || !amount || !category || !type || !walletId) {
    res.status(400);
    throw new Error('Please add all required fields: description, amount, category, type, walletId');
  }

  const wallet = await Wallet.findById(walletId);
  if (!wallet || wallet.userId.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Wallet not found or not authorized');
  }

  // Update wallet balance
  if (type === 'expense') {
    wallet.balance -= amount;
  } else if (type === 'income') {
    wallet.balance += amount;
  }
  await wallet.save();

  const expense = await Expense.create({
    userId: req.user._id,
    description,
    amount,
    category,
    date: date || Date.now(),
    notes,
    type,
    walletId: wallet._id // Store wallet ID
  });

  // Populate wallet details for the response
  const populatedExpense = await Expense.findById(expense._id).populate('walletId');

  res.status(201).json(populatedExpense);
});

const updateExpense = asyncHandler(async (req, res) => {
  const { description, amount, category, date, notes, type, walletId } = req.body;
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  if (expense.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this expense');
  }

  // Handle wallet balance changes if amount or type or wallet changes
  const oldAmount = expense.amount;
  const oldType = expense.type;
  const oldWalletId = expense.walletId;

  // Update fields if provided, otherwise keep existing
  expense.description = description !== undefined ? description : expense.description;
  expense.amount = amount !== undefined ? amount : expense.amount;
  expense.category = category !== undefined ? category : expense.category;
  expense.date = date !== undefined ? date : expense.date;
  expense.notes = notes !== undefined ? notes : expense.notes;
  expense.type = type !== undefined ? type : expense.type;
  expense.walletId = walletId !== undefined ? walletId : expense.walletId;

  // Revert old wallet balance
  if (oldWalletId) {
    const oldWallet = await Wallet.findById(oldWalletId);
    if (oldWallet) {
      if (oldType === 'expense') {
        oldWallet.balance += oldAmount;
      } else if (oldType === 'income') {
        oldWallet.balance -= oldAmount;
      }
      await oldWallet.save();
    }
  }

  // Apply new transaction to new/current wallet
  const newWallet = await Wallet.findById(expense.walletId);
  if (newWallet) {
    if (expense.type === 'expense') {
      newWallet.balance -= expense.amount;
    } else if (expense.type === 'income') {
      newWallet.balance += expense.amount;
    }
    await newWallet.save();
  } else {
    res.status(404);
    throw new Error('New wallet not found or not authorized');
  }

  const updatedExpense = await expense.save();
  // Populate wallet details for the response
  const populatedUpdatedExpense = await Expense.findById(updatedExpense._id).populate('walletId');
  res.json(populatedUpdatedExpense);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  if (expense.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this expense');
  }

  // Revert wallet balance
  const wallet = await Wallet.findById(expense.walletId);
  if (wallet) {
    if (expense.type === 'expense') {
      wallet.balance += expense.amount;
    } else if (expense.type === 'income') {
      wallet.balance -= expense.amount;
    }
    await wallet.save();
  }

  await expense.remove(); // or await expense.deleteOne(); for Mongoose 6+
  res.json({ message: 'Expense removed' });
});

// @desc    Reset (delete) all expense transactions for a user
// @route   DELETE /api/expenses/reset-expenses
// @access  Private
const resetExpenses = asyncHandler(async (req, res) => {
  // Find all expense transactions for the authenticated user
  const expensesToDelete = await Expense.find({ userId: req.user._id, type: 'expense' });

  // Revert balances for each deleted expense
  for (const expense of expensesToDelete) {
    const wallet = await Wallet.findById(expense.walletId);
    if (wallet) {
      wallet.balance += expense.amount; // Add back the expense amount
      await wallet.save();
    }
  }

  // Delete all expense transactions for the user
  await Expense.deleteMany({ userId: req.user._id, type: 'expense' });

  res.json({ message: 'All expense transactions reset successfully.' });
});

// @desc    Bulk import transactions
// @route   POST /api/expenses/import-bulk
// @access  Private
const importBulkTransactions = asyncHandler(async (req, res) => {
  const { transactions } = req.body;
  const userId = req.user._id;
  const importedTransactions = [];
  const failedTransactions = [];
  const errors = [];

  if (!transactions || !Array.isArray(transactions)) {
    res.status(400);
    throw new Error('Invalid request body: transactions array is required.');
  }

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    try {
      // Basic validation
      if (!t.description || !t.amount || !t.category || !t.date || !t.type || !t.walletId) {
        throw new Error('Missing required fields for transaction.');
      }
      if (!['income', 'expense'].includes(t.type.toLowerCase())) {
        throw new Error('Invalid transaction type. Must be "income" or "expense".');
      }
      if (isNaN(t.amount) || t.amount < 0) {
        throw new Error('Invalid amount. Must be a positive number.');
      }

      // Check if wallet exists and belongs to user
      const wallet = await Wallet.findById(t.walletId);
      if (!wallet || wallet.userId.toString() !== userId.toString()) {
        throw new Error('Wallet not found or not authorized for this transaction.');
      }

      // Update wallet balance
      if (t.type.toLowerCase() === 'expense') {
        wallet.balance -= t.amount;
      } else if (t.type.toLowerCase() === 'income') {
        wallet.balance += t.amount;
      }
      await wallet.save();

      const newTransaction = await Expense.create({
        userId,
        description: t.description,
        amount: t.amount,
        category: t.category,
        date: new Date(t.date),
        notes: t.notes,
        type: t.type.toLowerCase(),
        walletId: t.walletId,
      });
      importedTransactions.push(newTransaction);
    } catch (error) {
      failedTransactions.push(t);
      errors.push({ row: i + 1, message: error.message || 'Unknown error' });
      console.error(`Error importing transaction at row ${i + 1}:`, error.message);
    }
  }

  res.status(200).json({
    message: 'Bulk import processed.',
    importedCount: importedTransactions.length,
    failedCount: failedTransactions.length,
    transactions: importedTransactions, // Optionally send back successfully imported transactions
    errors: errors, // Send back specific errors for failed rows
  });
});


module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  resetExpenses, // Export new function
  importBulkTransactions, // Export new function
};
