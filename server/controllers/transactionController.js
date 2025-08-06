// server/controllers/transactionController.js
const asyncHandler = require('express-async-handler');
const Transaction = require('../models/expense'); // Assuming expense.js is your Transaction model
const Wallet = require('../models/Wallet'); // Assuming you have a Wallet model
const mongoose = require('mongoose'); // Import mongoose to check for valid ObjectId

// @desc    Reset ALL transactions for the authenticated user
// @route   DELETE /api/transactions/reset-all
// @access  Private
const resetAllTransactions = asyncHandler(async (req, res) => {
  // Ensure req.user is populated by the protect middleware
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('User not authenticated or ID missing.');
  }

  try {
    // 1. Delete all transactions for the authenticated user
    const deleteResult = await Transaction.deleteMany({ userId: req.user.id });

    // 2. IMPORTANT: Reset wallet balances for this user
    // This assumes wallet balances are derived from transactions or need to be zeroed out.
    // If your wallet balances are dynamically calculated based on transactions,
    // you might not need to explicitly set them to 0 here, but it's safer to ensure consistency.
    const walletUpdateResult = await Wallet.updateMany(
      { userId: req.user.id },
      { $set: { balance: 0 } } // Set all wallets for this user to 0 balance
    );

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({
        message: `Successfully deleted ${deleteResult.deletedCount} transactions and reset ${walletUpdateResult.modifiedCount} wallet balances for user ${req.user.id}.`
      });
    } else {
      res.status(200).json({ message: 'No transactions found to delete for this user.' });
    }
  } catch (error) {
    console.error('Error resetting all transactions:', error);
    res.status(500).json({ message: 'Failed to reset all transactions due to a server error.' });
  }
});

// @desc    Delete a single transaction by ID
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  // Ensure req.user is populated by the protect middleware
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('User not authenticated or ID missing.');
  }

  const transactionId = req.params.id;

  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    res.status(400);
    throw new Error('Invalid transaction ID.');
  }

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found.');
    }

    // Ensure the transaction belongs to the authenticated user
    if (transaction.userId.toString() !== req.user.id.toString()) {
      res.status(403); // Forbidden
      throw new Error('Not authorized to delete this transaction.');
    }

    // Get the associated wallet and update its balance
    const wallet = await Wallet.findById(transaction.walletId);
    if (wallet) {
      if (transaction.type === 'expense') {
        wallet.balance += transaction.amount; // Add back to balance if it was an expense
      } else if (transaction.type === 'income') {
        wallet.balance -= transaction.amount; // Subtract from balance if it was income
      }
      await wallet.save();
    } else {
      console.warn(`Wallet with ID ${transaction.walletId} not found for transaction ${transactionId}. Balance not updated.`);
    }

    await transaction.deleteOne(); // Use deleteOne() for Mongoose 6+

    res.status(200).json({ message: 'Transaction deleted successfully.' });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    if (error.name === 'CastError') { // Catch specific CastError for invalid IDs
      res.status(400).json({ message: 'Invalid transaction ID format.' });
    } else {
      res.status(500).json({ message: error.message || 'Failed to delete transaction due to a server error.' });
    }
  }
});

module.exports = {
  resetAllTransactions,
  deleteTransaction, // Export the new function
};
