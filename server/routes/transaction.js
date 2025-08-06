// server/routes/transaction.js
const express = require('express');
// CORRECTED: Import protect as a named export
const { protect } = require('../middleware/authMiddleware');
// IMPORTANT: Ensure these functions are correctly exported from the controller
const { resetAllTransactions, deleteTransaction } = require('../controllers/transactionController');

const transactionRoutesFactory = (expressInstance) => {
  const router = expressInstance.Router(); // Create a new router instance

  // Route to reset ALL transactions for the authenticated user
  // DELETE /api/transactions/reset-all
  router.delete('/reset-all', protect, resetAllTransactions);

  // Route to delete a single transaction by ID
  // DELETE /api/transactions/:id
  // This route MUST come AFTER more specific routes like '/reset-all'
  router.delete('/:id', protect, deleteTransaction);

  // Add other transaction-related routes here if you have them, e.g.:
  // router.get('/', protect, getTransactions);
  // router.post('/', protect, addTransaction);
  // router.put('/:id', protect, updateTransaction);

  return router; // Return the configured router
};

module.exports = transactionRoutesFactory; // Export the factory function
