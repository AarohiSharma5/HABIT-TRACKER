/**
 * User Model
 * Mongoose schema for user authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: function() {
            // userId is auto-generated for Google users, required for local users
            return !this.googleId;
        },
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'User ID must be at least 3 characters'],
        maxlength: [30, 'User ID cannot exceed 30 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true, // Allows multiple null values but unique non-null values
        validate: {
            validator: function(email) {
                if (!email) return true; // Email is optional
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: function() {
            // Password is only required if not using Google auth
            return !this.googleId;
        },
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(password) {
                // Skip validation if using Google auth
                if (this.googleId) return true;
                if (!password) return false;
                
                // Password must contain:
                // - At least 8 characters
                // - At least one uppercase letter
                // - At least one lowercase letter
                // - At least one number
                // - At least one special character
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
                return passwordRegex.test(password);
            },
            message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)'
        }
    },
    // Google authentication fields
    googleId: {
        type: String,
        sparse: true, // Allows null but unique non-null values
        unique: true
    },
    photoURL: {
        type: String,
        trim: true
    },
    about: {
        type: String,
        trim: true,
        maxlength: [500, 'About section cannot exceed 500 characters'],
        default: ''
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
    
});

/**
 * Static method to validate password complexity before hashing
 */
userSchema.statics.validatePasswordComplexity = function(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('One uppercase letter (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('One lowercase letter (a-z)');
    }
    if (!/\d/.test(password)) {
        errors.push('One number (0-9)');
    }
    if (!/[@$!%*?&#]/.test(password)) {
        errors.push('One special character (@$!%*?&#)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Hash password before saving
 */
userSchema.pre('save', async function() {
    // Skip hashing if using Google auth or password unchanged
    if (!this.isModified('password') || this.googleId) {
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare password for login
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

/**
 * Remove password from JSON output
 */
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
