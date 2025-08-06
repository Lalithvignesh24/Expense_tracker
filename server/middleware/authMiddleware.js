// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Path to your User model

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer TOKEN_STRING")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Move to the next middleware/controller
    } catch (error) {
      console.error(error);
      res.status(401);
      // Check if the error is due to token expiration
      if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized, token expired. Please log in again.');
      } else {
        throw new Error('Not authorized, token failed');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// CORRECTED: Export protect as a named export
module.exports = { protect };
