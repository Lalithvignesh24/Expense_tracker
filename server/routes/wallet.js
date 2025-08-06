// server/routes/wallet.js
const express = require('express');
const { getWallets, addWallet, updateWallet, deleteWallet } = require('../controllers/walletController');
// CORRECTED: Import protect as a named export
const { protect } = require('../middleware/authMiddleware');

module.exports = (expressInstance) => {
  const router = expressInstance.Router();

  router.route('/')
    .get(protect, getWallets)
    .post(protect, addWallet);

  router.route('/:id')
    .put(protect, updateWallet)
    .delete(protect, deleteWallet);

  return router;
};
