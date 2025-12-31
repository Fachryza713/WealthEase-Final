const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

// Login with email and password
router.post('/login', authController.login);

// Google OAuth routes (updated for new flow)
router.post('/google/callback', authController.googleCallback);

// Legacy Google OAuth routes (for Passport.js - can be removed if not needed)
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/legacy-callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.googleCallback
);

// Logout
router.post('/logout', authController.logout);

// Check authentication status
router.get('/status', authController.getAuthStatus);

// Register new user (for future implementation)
router.post('/register', authController.register);

module.exports = router;
