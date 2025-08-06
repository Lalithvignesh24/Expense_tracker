// server/models/expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletId: { // NEW FIELD: Link to the Wallet model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: { // This will now be a string name, but we can link to Category model later if needed
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
  },
  type: { // 'expense' or 'income'
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Expense', expenseSchema);
