// server/routes/expense.js
const express = require('express');
const { getExpenses, addExpense, updateExpense, deleteExpense, resetExpenses, importBulkTransactions } = require('../controllers/expenseController');
// CORRECTED: Import protect as a named export
const { protect } = require('../middleware/authMiddleware');

module.exports = (expressInstance) => {
  const router = expressInstance.Router();

  // Define the more specific 'reset-expenses' route FIRST
  router.delete('/reset-expenses', protect, resetExpenses); // Moved this line up

  // Define the 'import-bulk' route (also specific)
  router.post('/import-bulk', protect, importBulkTransactions); // Keep this here or above reset-expenses

  // General routes for CRUD operations on individual expenses
  router.route('/')
    .get(protect, getExpenses)
    .post(protect, addExpense);

  router.route('/:id')
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

  return router;
};
