const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userController.updateProfile);

// Get user dashboard data
router.get('/dashboard', userController.getDashboardData);

// Get user transactions
router.get('/transactions', userController.getTransactions);

// Add new transaction
router.post('/transactions', userController.addTransaction);

// Update transaction
router.put('/transactions/:id', userController.updateTransaction);

// Delete transaction
router.delete('/transactions/:id', userController.deleteTransaction);

module.exports = router;
