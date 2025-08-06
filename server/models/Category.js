// server/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: false, // Not unique globally, but unique per user
  },
  type: { // 'expense' or 'income'
    type: String,
    enum: ['expense', 'income'],
    required: true,
  },
  isPredefined: { // To distinguish between app-defined and user-defined categories
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Add a unique compound index to ensure a user cannot have two categories with the same name and type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
