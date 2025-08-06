// server/models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR', // Default currency
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);
