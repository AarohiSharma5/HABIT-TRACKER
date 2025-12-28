/**
 * Authentication Routes
 * Handle user signup, login, and logout
 * Refactored to use controllers following MVC pattern
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter, googleAuthLimiter, resetRateLimit } = require('../middleware/rateLimiter');
const { 
    logSuspiciousActivity, 
    validateOrigin, 
    preventDuplicateSignIn 
} = require('../middleware/security');

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', authLimiter, logSuspiciousActivity, authController.signup);

/**
 * POST /auth/login
 * Login an existing user
 */
router.post('/login', authLimiter, logSuspiciousActivity, authController.login);

/**
 * POST /auth/google
 * Authenticate with Google (Firebase)
 */
router.post('/google', googleAuthLimiter, logSuspiciousActivity, preventDuplicateSignIn, authController.googleAuth);

/**
 * GET /auth/profile
 * Get user profile
 */
router.get('/profile', requireAuth, authController.getProfile);

/**
 * PUT /auth/profile
 * Update user profile
 */
router.put('/profile', requireAuth, authController.updateProfile);

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', authController.logout);

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', authLimiter, authController.forgotPassword);

/**
 * POST /auth/reset-password/:token
 * Reset password with token
 */
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

/**
 * GET /auth/reset-password/:token
 * Show reset password form
 */
router.get('/reset-password/:token', authController.showResetForm);

module.exports = router;
