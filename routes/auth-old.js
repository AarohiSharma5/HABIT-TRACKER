/**
 * Authentication Routes
 * Handle user signup, login, and logout
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyIdToken } = require('../config/firebase');
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
router.post('/signup', authLimiter, logSuspiciousActivity, async (req, res) => {
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
router.post('/login', authLimiter, logSuspiciousActivity, async (req, res) => {
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
        
        // Reset rate limit on successful login
        const identifier = req.ip || req.connection.remoteAddress;
        resetRateLimit(identifier, 'auth');
        
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
 * POST /auth/google
 * Authenticate with Google Firebase
 */
router.post('/google', 
    googleAuthLimiter, 
    logSuspiciousActivity, 
    validateOrigin([]), 
    preventDuplicateSignIn, 
    async (req, res) => {
    try {
        console.log('📝 Google auth request received from IP:', req.ip);
        const { idToken } = req.body;
        
        if (!idToken) {
            console.log('❌ No idToken provided');
            return res.status(400).json({
                success: false,
                message: 'Firebase ID token is required'
            });
        }
        
        console.log('🔐 Verifying Firebase ID token...');
        // Verify Firebase ID token with enhanced security
        const verificationResult = await verifyIdToken(idToken);
        
        if (!verificationResult.success) {
            console.log('❌ Token verification failed:', verificationResult.error, 'Code:', verificationResult.code);
            return res.status(401).json({
                success: false,
                message: verificationResult.error || 'Invalid Firebase token',
                code: verificationResult.code
            });
        }
        
        console.log('✅ Token verified successfully');
        const firebaseUser = verificationResult.user;
        console.log('👤 Firebase user:', firebaseUser.email, 'UID:', firebaseUser.uid);
        
        // Additional security: Verify email is present
        if (!firebaseUser.email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required for authentication',
                code: 'EMAIL_REQUIRED'
            });
        }
        
        // Security check: Verify the sign-in provider is Google
        if (firebaseUser.firebase?.sign_in_provider !== 'google.com') {
            return res.status(403).json({
                success: false,
                message: 'Only Google authentication is supported',
                code: 'INVALID_PROVIDER'
            });
        }
        
        // Check if user already exists by googleId
        let user = await User.findOne({ googleId: firebaseUser.uid });
        
        if (!user) {
            // Check if email is already registered (with any auth provider)
            if (firebaseUser.email) {
                const existingUser = await User.findOne({ email: firebaseUser.email });
                if (existingUser) {
                    // If user exists with Google auth but different googleId, update it
                    if (existingUser.authProvider === 'google') {
                        console.log('⚠️ Updating googleId for existing Google user:', existingUser.email);
                        existingUser.googleId = firebaseUser.uid;
                        await existingUser.save();
                        user = existingUser;
                    } else {
                        // User registered with password, not Google
                        return res.status(400).json({
                            success: false,
                            message: 'This email is already registered with password login. Please use traditional login.'
                        });
                    }
                }
            }
        }
        
        // If user still not found, create new account
        if (!user) {
            
            // Generate unique user ID for Google users
            let userId;
            let isUnique = false;
            let attempts = 0;
            const maxAttempts = 10;
            
            while (!isUnique && attempts < maxAttempts) {
                // Generate random 6-digit number
                const randomNum = Math.floor(100000 + Math.random() * 900000);
                userId = `guser_${randomNum}`;
                
                // Check if this userId already exists
                const existing = await User.findOne({ userId: userId.toLowerCase() });
                if (!existing) {
                    isUnique = true;
                }
                attempts++;
            }
            
            if (!isUnique) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate unique user ID. Please try again.'
                });
            }
            
            // Create new user with Google auth
            user = new User({
                userId: userId.toLowerCase(),
                name: firebaseUser.name || firebaseUser.email,
                email: firebaseUser.email,
                googleId: firebaseUser.uid,
                photoURL: firebaseUser.picture,
                authProvider: 'google'
            });
            
            await user.save();
            
            console.log(`✅ New Google user created: ${userId} (${firebaseUser.email})`);
        }
        
        // Set session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.authProvider = 'google';
        
        // Reset rate limit on successful authentication
        const identifier = req.ip || req.connection.remoteAddress;
        resetRateLimit(identifier, 'google');
        
        res.json({
            success: true,
            message: 'Google authentication successful',
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL
            }
        });
        console.log('✅ Google authentication successful for:', user.email);
    } catch (error) {
        console.error('❌ Google auth error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to authenticate with Google',
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

/**
 * GET /auth/profile
 * Get user profile information
 */
router.get('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        const user = await User.findById(req.session.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                about: user.about,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
});

/**
 * PUT /auth/profile
 * Update user profile information
 */
router.put('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        const { name, photoURL, about } = req.body;
        
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update fields if provided
        if (name && name.trim()) {
            user.name = name.trim();
            req.session.userName = name.trim(); // Update session
        }
        
        if (photoURL !== undefined) {
            user.photoURL = photoURL.trim();
        }
        
        if (about !== undefined) {
            user.about = about.trim();
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                about: user.about,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || 'Validation failed'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

module.exports = router;
