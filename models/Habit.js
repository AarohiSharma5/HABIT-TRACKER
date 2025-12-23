/**
 * Habit Model
 * Mongoose schema and model for the Habit collection in MongoDB
 * 
 * PERSISTENCE STRATEGY:
 * This model ensures all habit data persists across page reloads by:
 * 1. Storing all data in MongoDB (persistent database)
 * 2. Maintaining a complete completionHistory array (full audit trail)
 * 3. Calculating streak from history on every save (data integrity)
 * 4. Using lastCompleted to quickly check today's status
 * 
 * DATA FLOW:
 * Page Load → Frontend calls GET /api/habits → Mongoose fetches from MongoDB → 
 * Returns all habits with their current state → UI renders with correct streaks
 */

const mongoose = require('mongoose');

// Define the Habit schema with persistent data structure
const habitSchema = new mongoose.Schema({
    // ========== USER ASSOCIATION ==========
    
    // User who owns this habit
    // PERSISTENCE: Links habit to user account
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    
    // ========== CORE HABIT INFORMATION ==========
    
    // Name of the habit (e.g., "Drink 8 glasses of water")
    // PERSISTENCE: Stored in MongoDB, survives page reload
    name: {
        type: String,
        required: [true, 'Habit name is required'],
        trim: true,
        maxlength: [100, 'Habit name cannot exceed 100 characters']
    },
    
    // ========== STREAK TRACKING (Persistent) ==========
    
    // Current streak count (consecutive days completed)
    // PERSISTENCE: Automatically calculated and saved to MongoDB
    // Recomputed from completionHistory to ensure accuracy after reload
    streak: {
        type: Number,
        default: 0,
        min: [0, 'Streak cannot be negative']
    },
    
    // Last date the habit was completed (midnight UTC)
    // PERSISTENCE: Stored as Date object in MongoDB
    // Used to determine if habit was completed today without scanning history
    lastCompleted: {
        type: Date,
        default: null
    },
    
    // ========== COMPLETION HISTORY (Full Audit Trail) ==========
    
    // Array storing every completion event - THIS IS THE SOURCE OF TRUTH
    // PERSISTENCE: Complete history saved to MongoDB, never lost on reload
    // Each entry represents one day the habit was marked as complete or skipped
    // This array allows:
    //   - Reconstructing streaks after page reload
    //   - Viewing historical data/patterns
    //   - Tracking weekly completion across 7 days
    //   - Undoing today's completion while preserving history
    completionHistory: [{
        date: {
            type: Date,
            required: true
            // Stored at midnight (00:00:00) for consistent daily tracking
        },
        status: {
            type: String,
            enum: ['completed', 'skipped', 'incomplete'],
            default: 'completed'
            // 'completed' - User marked habit as done
            // 'skipped' - User intentionally skipped (allowed 1 per week)
            // 'incomplete' - Day passed without action (legacy entries)
        }
    }],
    
    // ========== OPTIONAL METADATA (Persistent) ==========
    
    // Optional description of the habit (e.g., "Helps with hydration")
    // PERSISTENCE: Stored as string in MongoDB
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Category or tag for organizing habits (e.g., 'health', 'productivity', 'personal')
    // PERSISTENCE: Allows filtering and grouping after page reload
    category: {
        type: String,
        trim: true,
        default: 'general'
    },
    
    // Whether the habit is currently active or archived
    // PERSISTENCE: Inactive habits remain in database but hidden from main view
    // Allows for habit history without deletion
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Target frequency (e.g., 'daily', 'weekly')
    // PERSISTENCE: Future feature for flexible scheduling
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily'
    },
    
    // Number of days per week the user wants to maintain this habit
    // PERSISTENCE: Used to calculate allowed skips and streak logic
    // Default is 7 (daily), can be 4, 5, 6, or 7
    daysPerWeek: {
        type: Number,
        default: 7,
        min: [1, 'Days per week must be at least 1'],
        max: [7, 'Days per week cannot exceed 7']
    },
    
    // Specific days of the week to skip (rest days)
    // PERSISTENCE: Array of day names that user wants to skip
    // Example: ['saturday', 'sunday'] for weekend rest
    skipDays: {
        type: [String],
        default: [],
        validate: {
            validator: function(days) {
                const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                return days.every(day => validDays.includes(day.toLowerCase()));
            },
            message: 'Invalid day name in skipDays array'
        }
    }
}, {
    // ========== AUTOMATIC TIMESTAMPS (MongoDB-managed) ==========
    // createdAt: Date - When habit was first created (never changes)
    // updatedAt: Date - Last time habit was modified (auto-updates on save)
    // PERSISTENCE: Mongoose automatically manages these fields
    timestamps: true
});

// ========== Instance Methods ==========

/**
 * Mark habit as completed for today
 * Updates streak and completion history
 * 
 * PERSISTENCE LOGIC:
 * 1. Validates habit not already completed today
 * 2. Checks if completion is consecutive (yesterday completed)
 * 3. Increments streak if consecutive, resets to 1 if not
 * 4. Adds entry to completionHistory (permanent record)
 * 5. Updates lastCompleted to today
 * 6. Saves to MongoDB via this.save()
 * 
 * AFTER PAGE RELOAD:
 * - completionHistory persists in database
 * - streak is already calculated and stored
 * - lastCompleted allows quick "completed today?" check
 */
habitSchema.methods.complete = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for consistent date comparison
    
    const lastCompleted = this.lastCompleted ? new Date(this.lastCompleted) : null;
    
    // Check if already completed today (prevent duplicate entries)
    if (lastCompleted && lastCompleted.toDateString() === today.toDateString()) {
        throw new Error('Habit already completed today');
    }
    
    // Check if completion is consecutive (yesterday completed)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastCompleted && lastCompleted.toDateString() === yesterday.toDateString()) {
        // Consecutive day - increment streak (maintaining the chain)
        this.streak += 1;
    } else if (!lastCompleted || lastCompleted.toDateString() !== today.toDateString()) {
        // Not consecutive or first completion - reset streak to 1 (start new chain)
        this.streak = 1;
    }
    
    // Update last completed date (for quick checks without scanning history)
    this.lastCompleted = today;
    
    // Add to completion history (permanent audit trail in MongoDB)
    // This array is the source of truth - persists across all page reloads
    this.completionHistory.push({
        date: today,
        status: 'completed'
    });
    
    // Save all changes to MongoDB (persistence)
    return this.save();
};

/**
 * Mark a day as skipped (intentionally not done)
 * Validates against consecutive skip rule
 * 
 * SKIP RULES:
 * - Maximum 1 skip per week (Mon-Sun)
 * - Cannot skip 2 consecutive days
 * - Updates lastCompleted if needed
 */
habitSchema.methods.skipDay = async function(date) {
    const skipDate = new Date(date);
    skipDate.setHours(0, 0, 0, 0);
    
    // Check if already has entry for this date
    const existingIdx = this.completionHistory.findIndex(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === skipDate.getTime();
    });
    
    if (existingIdx !== -1) {
        throw new Error('Day already has a status. Remove it first to skip.');
    }
    
    // Check weekly skip limit based on daysPerWeek
    // If user chose 5 days/week, they can skip 2 days (7-5=2)
    const allowedSkips = 7 - this.daysPerWeek;
    const weekSkips = this.getWeeklyStatus(skipDate).filter(day => day.status === 'skipped');
    if (weekSkips.length >= allowedSkips) {
        throw new Error(`You can only skip ${allowedSkips} day${allowedSkips !== 1 ? 's' : ''} per week based on your ${this.daysPerWeek}-day frequency`);
    }
    
    // Check for consecutive skips
    const yesterday = new Date(skipDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
    });
    
    if (yesterdayEntry && yesterdayEntry.status === 'skipped') {
        throw new Error('Cannot skip two consecutive days');
    }
    
    const tomorrow = new Date(skipDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === tomorrow.getTime();
    });
    
    if (tomorrowEntry && tomorrowEntry.status === 'skipped') {
        throw new Error('Cannot skip two consecutive days');
    }
    
    // Add skip entry
    this.completionHistory.push({
        date: skipDate,
        status: 'skipped'
    });
    
    // Note: Skips do NOT break streaks anymore
    // Streak only breaks if you miss a day entirely (no completion, no skip)
    
    return this.save();
};

/**
 * Get weekly status for a given date
 * Returns array of 7 days (Mon-Sun) with their status
 */
habitSchema.methods.getWeeklyStatus = function(referenceDate = new Date()) {
    const date = new Date(referenceDate);
    date.setHours(0, 0, 0, 0);
    
    // Find Monday of the week
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(date);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday being 0
    monday.setDate(date.getDate() + diff);
    
    // Generate 7 days starting from Monday
    const week = [];
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        
        // Find entry for this day
        const entry = this.completionHistory.find(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === currentDay.getTime();
        });
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        week.push({
            date: new Date(currentDay),
            dayName: dayNames[currentDay.getDay()],
            status: entry ? entry.status : 'not-done',
            isToday: currentDay.getTime() === today.getTime(),
            isFuture: currentDay.getTime() > today.getTime()
        });
    }
    
    return week;
};

/**
 * Reset streak to 0
 * PERSISTENCE: Saves directly to MongoDB
 */
habitSchema.methods.resetStreak = function() {
    this.streak = 0;
    return this.save();
};

/**
 * Un-complete habit for today
 * Removes today's completion and recomputes streak/lastCompleted
 * 
 * PERSISTENCE LOGIC:
 * 1. Finds and removes today's entry from completionHistory
 * 2. Calls _recomputeFromHistory() to rebuild streak from remaining history
 * 3. Saves updated state to MongoDB
 * 
 * WHY THIS MATTERS FOR PERSISTENCE:
 * - Even after page reload, the history is accurate
 * - Streak is recalculated based on what's actually in the database
 * - No risk of inconsistent state between sessions
 */
habitSchema.methods.uncompleteToday = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find any completion entry for today in the history array
    const idx = this.completionHistory.findIndex(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    if (idx === -1) {
        throw new Error('Habit not completed today');
    }

    // Remove today's completion entry from persistent history
    this.completionHistory.splice(idx, 1);

    // Recompute lastCompleted and streak based on remaining history
    // This ensures data integrity after reload
    this._recomputeFromHistory();

    return this.save();
};

/**
 * Recompute `lastCompleted` and `streak` from `completionHistory`.
 * 
 * PERSISTENCE STRATEGY:
 * This method rebuilds streak data from the source of truth (completionHistory)
 * Called when:
 * - Uncompleting today (to recalculate after removal)
 * - Data migration or repair operations
 * 
 * WHY THIS ENSURES PERSISTENCE:
 * - completionHistory is the permanent record in MongoDB
 * - streak and lastCompleted are derived/cached values
 * - If derived values ever get corrupted, history can rebuild them
 * - After page reload, all data comes from MongoDB in correct state
 * 
 * ALGORITHM:
 * 1. Sort history by date (oldest to newest)
 * 2. Find the last completion date
 * 3. Count backwards to find consecutive days
 * 4. Update streak and lastCompleted accordingly
 */
habitSchema.methods._recomputeFromHistory = function () {
    // If no history, reset everything to zero state
    if (!this.completionHistory || this.completionHistory.length === 0) {
        this.lastCompleted = null;
        this.streak = 0;
        return;
    }

    // Sort by date ascending, filter for completed entries only
    const history = [...this.completionHistory]
        .filter(h => h.status === 'completed' || h.completed === true) // Support both old and new format
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (history.length === 0) {
        this.lastCompleted = null;
        this.streak = 0;
        return;
    }

    // Set lastCompleted to the most recent entry's date
    const last = new Date(history[history.length - 1].date);
    last.setHours(0, 0, 0, 0);
    this.lastCompleted = last;

    // Count consecutive days ending at lastCompleted
    let streak = 1; // At least 1 day (the last day)
    let cursor = new Date(last);
    
    // Get all history (including skips) for checking gaps
    const allHistory = [...this.completionHistory]
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Iterate from the end backwards through completed history
    for (let i = history.length - 2; i >= 0; i--) {
        const d = new Date(history[i].date);
        d.setHours(0, 0, 0, 0);
        
        // Expected previous day
        const prev = new Date(cursor);
        prev.setDate(prev.getDate() - 1);
        
        if (d.getTime() === prev.getTime()) {
            // Consecutive day found, increment streak and move cursor back
            streak += 1;
            cursor = d;
        } else if (d.getTime() === cursor.getTime()) {
            // Duplicate entry for same day (shouldn't happen, but handle gracefully)
            continue;
        } else {
            // Check if the gap day(s) were skipped - if so, continue streak
            let gapFilled = true;
            let checkDate = new Date(prev);
            
            while (checkDate.getTime() > d.getTime()) {
                const hasSkip = allHistory.some(entry => {
                    const ed = new Date(entry.date);
                    ed.setHours(0, 0, 0, 0);
                    return ed.getTime() === checkDate.getTime() && entry.status === 'skipped';
                });
                
                if (!hasSkip) {
                    gapFilled = false;
                    break;
                }
                
                checkDate.setDate(checkDate.getDate() - 1);
            }
            
            if (gapFilled && checkDate.getTime() === d.getTime()) {
                // Gap was filled with skips, continue counting
                streak += 1;
                cursor = d;
            } else {
                // True gap in consecutive days found, stop counting
                break;
            }
        }
    }
    
    // Update streak with calculated value
    this.streak = streak;
};

// ========== Static Methods (Class-level queries) ==========

/**
 * Find all active habits for a specific user
 * 
 * PERSISTENCE: Queries MongoDB for all habits where isActive = true and belongs to user
 * Returns habits sorted by creation date (newest first)
 * Called on every page load to populate the UI
 */
habitSchema.statics.findActive = function(userId) {
    return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

/**
 * Get habits by category for a specific user
 * 
 * PERSISTENCE: Queries MongoDB for habits matching category and user
 * Allows filtering after page reload
 */
habitSchema.statics.findByCategory = function(userId, category) {
    return this.find({ userId, category, isActive: true }).sort({ createdAt: -1 });
};

// ========== Database Indexes (Performance Optimization) ==========

// Index for faster queries on active habits
// Speeds up findActive() method after page reload
habitSchema.index({ isActive: 1, createdAt: -1 });

// Index for category-based queries
// Speeds up findByCategory() method
habitSchema.index({ category: 1 });

// ========== MODEL CREATION & EXPORT ==========

/**
 * Create and export the Habit model
 * 
 * MONGODB PERSISTENCE:
 * - Model name: 'Habit' → Collection name in MongoDB: 'habits' (lowercase, plural)
 * - All documents in 'habits' collection follow this schema
 * - Mongoose automatically creates the collection on first save
 * - Data persists permanently in MongoDB until explicitly deleted
 * 
 * USAGE IN APPLICATION:
 * - Import this model: const Habit = require('./models/Habit');
 * - Create: const habit = new Habit({...}); await habit.save();
 * - Read: const habits = await Habit.find();
 * - Update: await habit.save() or Habit.findByIdAndUpdate(...)
 * - Delete: await Habit.findByIdAndDelete(...)
 */
const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
