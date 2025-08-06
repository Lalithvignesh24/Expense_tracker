// server/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors'); // Import cors middleware
const connectDB = require('./database/connect'); // Import database connection function
const authRoutes = require('./routes/auth'); // Import authentication routes
const expenseRoutesFactory = require('./routes/expense'); // Import expense routes factory
const walletRoutesFactory = require('./routes/wallet'); // Import wallet routes factory
const categoryRoutesFactory = require('./routes/category'); // Import category routes factory
const transactionRoutesFactory = require('./routes/transaction'); // NEW: Import transaction routes factory

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Initialize routes by passing the express instance
const expenseRoutes = expenseRoutesFactory(express);
const walletRoutes = walletRoutesFactory(express);
const categoryRoutes = categoryRoutesFactory(express);
const transactionRoutes = transactionRoutesFactory(express); // NEW: Initialize transaction routes

// Routes
// IMPORTANT: The order of app.use statements matters!
// Place more specific routes (like /api/transactions) before more general ones (like /api/expenses
// if /api/expenses has dynamic ID routes that could accidentally intercept).
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/transactions', transactionRoutes); // <--- CRITICAL: This line mounts your transaction routes
app.use('/api/expenses', expenseRoutes); // Existing expense-specific routes
app.use('/api/wallets', walletRoutes); // Wallet routes
app.use('/api/categories', categoryRoutes); // Category routes


// Basic route for testing server
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send('Something broke on the server!'); // Send a generic error response
});

const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Assuming process.env.MONGO_URI is available after dotenv.config()
  console.log(`MongoDB Connected: ${process.env.MONGO_URI ? process.env.MONGO_URI.split('@')[1].split('/')[0] : 'N/A'}`);
});
