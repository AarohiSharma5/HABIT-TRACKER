/**
 * Authentication Routes
 * Handle user signup, login, and logout
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', async (req, res) => {
    try {
        const { userId, name, password } = req.body;
        
        // Validate required fields
        if (!userId || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ userId: userId.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User ID already exists. Please choose a different one.'
            });
        }
        
        // Validate password complexity
        const passwordValidation = User.validatePasswordComplexity(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                passwordErrors: passwordValidation.errors
            });
        }
        
        // Create new user
        const user = new User({
            userId: userId.toLowerCase(),
            name,
            password
        });
        
        await user.save();
        
        // Set session
        req.session.userId = user._id;
        req.session.userName = user.name;
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: {
                userId: user.userId,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate key error (unique constraint)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User ID already exists. Please choose a different one.'
            });
        }
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || 'Validation failed',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create account. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        // Validate required fields
        if (!userId || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and password are required'
            });
        }
        
        // Find user
        const user = await User.findOne({ userId: userId.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user ID or password'
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user ID or password'
            });
        }
        
        // Set session
        req.session.userId = user._id;
        req.session.userName = user.name;
        
        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                userId: user.userId,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: error.message
        });
    }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

/**
 * GET /auth/check
 * Check if user is authenticated
 */
router.get('/check', (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                name: req.session.userName
            }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

module.exports = router;
