// server/routes/category.js
const express = require('express');
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
// CORRECTED: Import protect as a named export
const { protect } = require('../middleware/authMiddleware');

module.exports = (expressInstance) => {
  const router = expressInstance.Router();

  router.route('/')
    .get(protect, getCategories)
    .post(protect, addCategory);

  router.route('/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

  return router;
};
