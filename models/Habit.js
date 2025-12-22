/**
 * Habit Model
 * Mongoose schema and model for the Habit collection in MongoDB
 */

const mongoose = require('mongoose');

// Define the Habit schema
const habitSchema = new mongoose.Schema({
    // Name of the habit
    name: {
        type: String,
        required: [true, 'Habit name is required'],
        trim: true,
        maxlength: [100, 'Habit name cannot exceed 100 characters']
    },
    
    // Current streak count (consecutive days completed)
    streak: {
        type: Number,
        default: 0,
        min: [0, 'Streak cannot be negative']
    },
    
    // Last date the habit was completed
    lastCompleted: {
        type: Date,
        default: null
    },
    
    // Array to store completion history
    completionHistory: [{
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            default: true
        }
    }],
    
    // Optional description of the habit
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Category or tag for the habit (e.g., 'health', 'productivity', 'personal')
    category: {
        type: String,
        trim: true,
        default: 'general'
    },
    
    // Whether the habit is currently active or archived
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Target frequency (e.g., 'daily', 'weekly')
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily'
    }
}, {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
});

// ========== Instance Methods ==========

/**
 * Mark habit as completed for today
 * Updates streak and completion history
 */
habitSchema.methods.complete = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    
    const lastCompleted = this.lastCompleted ? new Date(this.lastCompleted) : null;
    
    // Check if already completed today
    if (lastCompleted && lastCompleted.toDateString() === today.toDateString()) {
        throw new Error('Habit already completed today');
    }
    
    // Check if completion is consecutive (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastCompleted && lastCompleted.toDateString() === yesterday.toDateString()) {
        // Consecutive day - increment streak
        this.streak += 1;
    } else if (!lastCompleted || lastCompleted.toDateString() !== today.toDateString()) {
        // Not consecutive or first completion - reset streak to 1
        this.streak = 1;
    }
    
    // Update last completed date
    this.lastCompleted = today;
    
    // Add to completion history
    this.completionHistory.push({
        date: today,
        completed: true
    });
    
    return this.save();
};

/**
 * Reset streak to 0
 */
habitSchema.methods.resetStreak = function() {
    this.streak = 0;
    return this.save();
};

/**
 * Un-complete habit for today
 * Removes today's completion and recomputes streak/lastCompleted
 */
habitSchema.methods.uncompleteToday = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find any completion entry for today
    const idx = this.completionHistory.findIndex(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    if (idx === -1) {
        throw new Error('Habit not completed today');
    }

    // Remove today's completion entry
    this.completionHistory.splice(idx, 1);

    // Recompute lastCompleted and streak based on history
    this._recomputeFromHistory();

    return this.save();
};

/**
 * Recompute `lastCompleted` and `streak` from `completionHistory`.
 * Assumes at most one entry per day.
 */
habitSchema.methods._recomputeFromHistory = function () {
    if (!this.completionHistory || this.completionHistory.length === 0) {
        this.lastCompleted = null;
        this.streak = 0;
        return;
    }

    // Sort by date ascending
    const history = [...this.completionHistory]
        .filter(h => h.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (history.length === 0) {
        this.lastCompleted = null;
        this.streak = 0;
        return;
    }

    // Set lastCompleted to the last entry's date
    const last = new Date(history[history.length - 1].date);
    last.setHours(0, 0, 0, 0);
    this.lastCompleted = last;

    // Count consecutive days ending at lastCompleted
    let streak = 1;
    let cursor = new Date(last);
    // iterate from the end backwards
    for (let i = history.length - 2; i >= 0; i--) {
        const d = new Date(history[i].date);
        d.setHours(0, 0, 0, 0);
        const prev = new Date(cursor);
        prev.setDate(prev.getDate() - 1);
        if (d.getTime() === prev.getTime()) {
            streak += 1;
            cursor = d;
        } else if (d.getTime() === cursor.getTime()) {
            // ignore duplicates for the same day just in case
            continue;
        } else {
            break;
        }
    }
    this.streak = streak;
};

// ========== Static Methods ==========

/**
 * Find all active habits
 */
habitSchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * Get habits by category
 */
habitSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// ========== Indexes ==========

// Index for faster queries on active habits
habitSchema.index({ isActive: 1, createdAt: -1 });

// Index for category-based queries
habitSchema.index({ category: 1 });

// Create and export the Habit model
const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
