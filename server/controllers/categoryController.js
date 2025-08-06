// server/controllers/categoryController.js
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');

// Predefined categories (static for now, can be dynamically managed later)
const predefinedCategories = [
  { name: 'Food', type: 'expense', isPredefined: true },
  { name: 'Transport', type: 'expense', isPredefined: true },
  { name: 'Shopping', type: 'expense', isPredefined: true },
  { name: 'Utilities', type: 'expense', isPredefined: true },
  { name: 'Rent', type: 'expense', isPredefined: true },
  { name: 'Entertainment', type: 'expense', isPredefined: true },
  { name: 'Health', type: 'expense', isPredefined: true },
  { name: 'Education', type: 'expense', isPredefined: true },
  { name: 'Salary', type: 'income', isPredefined: true },
  { name: 'Freelance', type: 'income', isPredefined: true },
  { name: 'Investments', type: 'income', isPredefined: true },
  { name: 'Gifts', type: 'income', isPredefined: true },
  { name: 'Other Expense', type: 'expense', isPredefined: true },
  { name: 'Other Income', type: 'income', isPredefined: true },
];

// @desc    Get all categories (predefined + user-defined) for a user
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  // Fetch user-defined categories
  const userCategories = await Category.find({ userId: req.user._id }).sort({ name: 1 });

  // Combine predefined and user-defined categories
  // Filter out predefined categories that might have been overridden by user-defined ones (optional, for advanced logic)
  const allCategories = [...predefinedCategories, ...userCategories];

  res.json(allCategories);
});

// @desc    Add a new custom category for a user
// @route   POST /api/categories
// @access  Private
const addCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Please provide a name and type for the category');
  }

  if (!['expense', 'income'].includes(type)) {
    res.status(400);
    throw new Error('Category type must be "expense" or "income"');
  }

  // Check if a category with the same name and type already exists for this user
  const existingCategory = await Category.findOne({ userId: req.user._id, name, type });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category with this name and type already exists for your account.');
  }

  const category = await Category.create({
    userId: req.user._id,
    name,
    type,
    isPredefined: false, // User-defined category
  });

  res.status(201).json(category);
});

// @desc    Update a custom category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Prevent updating predefined categories via this route
  if (category.isPredefined) {
    res.status(400);
    throw new Error('Cannot update predefined categories.');
  }

  // Ensure the category belongs to the authenticated user
  if (category.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this category');
  }

  // Check for duplicate name/type if name/type is being changed
  if ((name && name !== category.name) || (type && type !== category.type)) {
    const existingCategory = await Category.findOne({ userId: req.user._id, name: name || category.name, type: type || category.type });
    if (existingCategory && existingCategory._id.toString() !== category._id.toString()) {
      res.status(400);
      throw new Error('Another category with this name and type already exists.');
    }
  }

  category.name = name !== undefined ? name : category.name;
  category.type = type !== undefined ? type : category.type;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Prevent deleting predefined categories
  if (category.isPredefined) {
    res.status(400);
    throw new Error('Cannot delete predefined categories.');
  }

  // Ensure the category belongs to the authenticated user
  if (category.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this category');
  }

  // Optional: Add logic to reassign expenses using this category or prevent deletion if in use
  await category.remove(); // or await category.deleteOne(); for Mongoose 6+
  res.json({ message: 'Category removed' });
});

module.exports = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
