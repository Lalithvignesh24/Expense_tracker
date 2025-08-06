// server/controllers/walletController.js
const Wallet = require('../models/Wallet');
const asyncHandler = require('express-async-handler');

// @desc    Get all wallets for a user
// @route   GET /api/wallets
// @access  Private
const getWallets = asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({ userId: req.user._id }).sort({ createdAt: 1 });
  res.json(wallets);
});

// @desc    Add a new wallet
// @route   POST /api/wallets
// @access  Private
const addWallet = asyncHandler(async (req, res) => {
  const { name, balance, currency, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide a name for the wallet');
  }

  // Check if a wallet with the same name already exists for this user
  const existingWallet = await Wallet.findOne({ userId: req.user._id, name });
  if (existingWallet) {
    res.status(400);
    throw new Error('Wallet with this name already exists for your account.');
  }

  const wallet = await Wallet.create({
    userId: req.user._id,
    name,
    balance: balance !== undefined ? balance : 0, // Allow initial balance
    currency,
    description,
  });

  res.status(201).json(wallet);
});

// @desc    Update a wallet
// @route   PUT /api/wallets/:id
// @access  Private
const updateWallet = asyncHandler(async (req, res) => {
  const { name, balance, currency, description } = req.body;

  const wallet = await Wallet.findById(req.params.id);

  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Ensure the wallet belongs to the authenticated user
  if (wallet.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this wallet');
  }

  // Check for duplicate name if name is being changed
  if (name && name !== wallet.name) {
    const existingWallet = await Wallet.findOne({ userId: req.user._id, name });
    if (existingWallet && existingWallet._id.toString() !== wallet._id.toString()) {
      res.status(400);
      throw new Error('Another wallet with this name already exists.');
    }
  }

  wallet.name = name !== undefined ? name : wallet.name;
  wallet.balance = balance !== undefined ? balance : wallet.balance;
  wallet.currency = currency !== undefined ? currency : wallet.currency;
  wallet.description = description !== undefined ? description : wallet.description;

  const updatedWallet = await wallet.save();
  res.json(updatedWallet);
});

// @desc    Delete a wallet
// @route   DELETE /api/wallets/:id
// @access  Private
const deleteWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findById(req.params.id);

  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Ensure the wallet belongs to the authenticated user
  if (wallet.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this wallet');
  }

  // Optional: Add logic here to reassign or delete associated expenses
  // For simplicity, we'll just delete the wallet for now.
  await wallet.remove(); // or await wallet.deleteOne(); for Mongoose 6+
  res.json({ message: 'Wallet removed' });
});

module.exports = {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
};
