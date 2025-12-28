/**
 * Auth Controller
 * Business logic for authentication operations
 */

const User = require('../models/User');
const { verifyIdToken } = require('../config/firebase');
const crypto = require('crypto');

/**
 * User signup
 */
exports.signup = async (req, res) => {
    try {
        const { userId, name, email, password } = req.body;
        
        if (!userId || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID, name, and password are required'
            });
        }
        
        const existingUser = await User.findOne({ userId: userId.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User ID already exists. Please choose a different one.'
            });
        }
        
        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists. Please use a different email.'
                });
            }
        }
        
        const passwordValidation = User.validatePasswordComplexity(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                passwordErrors: passwordValidation.errors
            });
        }
        
        const user = new User({
            userId: userId.toLowerCase(),
            name,
            email: email ? email.toLowerCase() : undefined,
            password
        });
        
        await user.save();
        
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
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User ID already exists. Please choose a different one.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An error occurred during signup. Please try again.'
        });
    }
};

/**
 * User login
 */
exports.login = async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        if (!userId || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and password are required'
            });
        }
        
        const user = await User.findOne({ userId: userId.toLowerCase() }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
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
            message: 'An error occurred during login. Please try again.'
        });
    }
};

/**
 * Google OAuth authentication
 */
exports.googleAuth = async (req, res) => {
    try {
        console.log('📝 Google auth request received from IP:', req.ip);
        
        const { idToken } = req.body;
        
        if (!idToken) {
            console.error('❌ No ID token provided');
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }
        
        console.log('🔐 Verifying Firebase ID token...');
        const decodedToken = await verifyIdToken(idToken);
        console.log('✅ Token verified successfully');
        
        const { uid, email, name, picture } = decodedToken;
        console.log('👤 Firebase user:', email, 'UID:', uid);
        
        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
            console.log('✅ Existing user found:', user.userId);
            
            if (!user.googleId) {
                console.log('⚠️ Updating googleId for existing Google user:', email);
                user.googleId = uid;
                user.photoURL = picture || user.photoURL;
                await user.save();
            }
        } else {
            console.log('➕ Creating new Google user:', email);
            
            const baseUserId = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let userId = baseUserId;
            let counter = 1;
            
            while (await User.findOne({ userId })) {
                userId = `${baseUserId}${counter}`;
                counter++;
            }
            
            user = new User({
                userId,
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                googleId: uid,
                photoURL: picture,
                authProvider: 'google'
            });
            
            await user.save();
            console.log('✅ New Google user created with userId:', userId);
        }
        
        req.session.userId = user._id;
        req.session.userName = user.name;
        
        console.log('✅ Google authentication successful for:', email);
        
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
    } catch (error) {
        console.error('❌ Google auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        const user = await User.findOne({ _id: req.session.userId });
        
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
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        console.log('Update profile request:', {
            userId: req.session.userId,
            body: req.body
        });
        
        const { name, about, photoURL } = req.body;
        
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            console.error('User not found for ID:', req.session.userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (name !== undefined) user.name = name;
        if (about !== undefined) user.about = about;
        if (photoURL !== undefined) user.photoURL = photoURL;
        
        // Use validateModifiedOnly to avoid validating unchanged fields (like password)
        await user.save({ validateModifiedOnly: true });
        req.session.userName = user.name;
        
        console.log('Profile updated successfully for user:', user.userId);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                userId: user.userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                about: user.about
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * User logout
 */
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
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
};

/**
 * Forgot password - Send reset email
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If that email exists, a password reset link has been sent'
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
        
        // Send email (non-blocking)
        sendPasswordResetEmail(user.email, user.name, resetToken, resetUrl).catch(err =>
            console.error('Failed to send reset email:', err)
        );
        
        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request'
        });
    }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
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
        
        // Hash token to compare with stored token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        // Update password
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password'
        });
    }
};

/**
 * Show reset password form
 */
exports.showResetForm = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify token is valid
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.render('reset-password', {
                validToken: false,
                message: 'Invalid or expired reset link'
            });
        }
        
        res.render('reset-password', {
            validToken: true,
            token: token
        });
    } catch (error) {
        console.error('Show reset form error:', error);
        res.render('reset-password', {
            validToken: false,
            message: 'An error occurred'
        });
    }
};
