/**
 * User Model
 * Mongoose schema for user authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
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
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function(password) {
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
    if (!this.isModified('password')) {
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
