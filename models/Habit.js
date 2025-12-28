/**
 * Habit Model
 * Mongoose schema and model for the Habit collection in MongoDB
 * 
 * ============================================================
 * HABIT TRACKING SYSTEM - COMPLETE RULES & STATE MANAGEMENT
 * ============================================================
 * 
 * THREE STATES PER DAY:
 * 1. COMPLETED - User marked habit as done (extends streak)
 * 2. SKIPPED - User intentionally skipped (maintains streak, limited)
 * 3. MISSED - No entry exists (breaks streak)
 * 
 * SKIP RULES (ENFORCED):
 * 1. Maximum 1 skip per week (Monday-Sunday)
 * 2. Cannot skip 2 consecutive days
 * 3. Skipped days DO NOT break streaks
 * 4. Skipped days count as "active" days (maintaining habit)
 * 
 * STREAK LOGIC:
 * - Completed days: +1 to streak
 * - Skipped days: Maintain streak (don't break it)
 * - Missed days: Break streak, reset to 0 or start new chain
 * - Streak = consecutive days with EITHER completed OR skipped status
 * 
 * WEEKLY PROGRESS VISUALIZATION:
 * - 7-day graph always rendered (Sunday to Saturday)
 * - Green dot (●) = completed
 * - Yellow dot (●) = skipped
 * - Red dot (●) = missed
 * - Active days = completed + skipped
 * - Graphs update automatically when state changes
 * 
 * DATA PERSISTENCE:
 * - completionHistory[] is the source of truth
 * - Each entry: { date, status: 'completed'|'skipped'|'incomplete' }
 * - Streak calculated from history on every save
 * - All data persists in MongoDB across page reloads
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
 * Returns all habits with their current state → UI renders with correct streaks and graphs
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
        },
        duration: {
            type: Number,
            default: null
            // Time spent in seconds (for accountability tracking)
        },
        reflection: {
            type: String,
            default: null
            // User's reflection on what they did (accountability feature)
            // Required before marking habit as complete
        },
        honestyStatus: {
            type: String,
            enum: ['yes', 'partially', 'not-really', null],
            default: null
            // User's honesty self-assessment from end-of-day review
            // 'yes' - completed honestly, 'partially' - somewhat, 'not-really' - removed but keeps streak
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
    
    // ========== SESSION TRACKING (New Fields) ==========
    
    // Timestamp when user started working on habit today
    // PERSISTENCE: Records when user began the habit activity
    // Null when habit is idle, set when habit status changes to 'in-progress'
    startedAt: {
        type: Date,
        default: null
    },
    
    // Timestamp when user completed habit today
    // PERSISTENCE: Records exact completion time
    // Set when habit status changes to 'completed'
    completedAt: {
        type: Date,
        default: null
    },
    
    // Accumulated duration from previous pause cycles (in seconds)
    // PERSISTENCE: Stores time already spent before pausing
    // When paused: stores elapsed time. When restarted: keeps this value
    // Final duration = pausedDuration + (completedAt - startedAt)
    pausedDuration: {
        type: Number,
        default: 0,
        min: [0, 'Duration cannot be negative']
    },
    
    // Minimum duration required for habit (in minutes)
    // PERSISTENCE: Optional field for time-based habits
    // Example: 30 minutes for "Exercise", 15 minutes for "Meditation"
    // Default null means no time requirement
    minimumDuration: {
        type: Number,
        default: null,
        min: [0, 'Duration cannot be negative']
    },
    
    // Current status of today's habit
    // PERSISTENCE: Tracks daily progress state
    // 'idle' - Not started today (default state)
    // 'in-progress' - User is currently working on it
    // 'completed' - Finished for the day
    // Resets to 'idle' at start of new day
    status: {
        type: String,
        enum: ['idle', 'in-progress', 'completed'],
        default: 'idle'
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
    },
    
    // ACCOUNTABILITY FEATURES
    
    // Last date when user completed end-of-day honesty review
    // Used to ensure review appears only once per day
    lastHonestyCheck: {
        type: Date,
        default: null
    },
    
    // Optional accountability mode (requires proof for completion)
    accountabilityMode: {
        type: Boolean,
        default: false
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
 * Start working on habit (change status to in-progress)
 * Sets startedAt timestamp and updates status
 * 
 * BACKWARD COMPATIBILITY: Safe to call on existing habits
 */
habitSchema.methods.startHabit = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCompleted = this.lastCompleted ? new Date(this.lastCompleted) : null;
    
    // Check if already completed today
    if (lastCompleted && lastCompleted.toDateString() === today.toDateString()) {
        throw new Error('Habit already completed today');
    }
    
    // Set status to in-progress and record start time
    this.status = 'in-progress';
    this.startedAt = new Date(); // Current timestamp with time
    
    return this.save();
};

/**
 * Check if habit meets minimum duration requirement
 * Returns true if no duration requirement or time met
 * 
 * BACKWARD COMPATIBILITY: Returns true for habits without minimumDuration
 */
habitSchema.methods.meetsMinimumDuration = function() {
    // No minimum duration set - always meets requirement
    if (!this.minimumDuration || this.minimumDuration === null) {
        return true;
    }
    
    // Not started yet
    if (!this.startedAt) {
        return false;
    }
    
    // Calculate elapsed time in minutes
    const now = new Date();
    const elapsedMs = now - new Date(this.startedAt);
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    
    return elapsedMinutes >= this.minimumDuration;
};

/**
 * Get elapsed time since starting habit (in minutes)
 * Returns 0 if not started
 * 
 * BACKWARD COMPATIBILITY: Returns 0 for habits without startedAt
 */
habitSchema.methods.getElapsedTime = function() {
    if (!this.startedAt) {
        return 0;
    }
    
    const now = new Date();
    const elapsedMs = now - new Date(this.startedAt);
    return Math.floor(elapsedMs / (1000 * 60));
};

/**
 * Mark habit as completed for today
 * Updates streak and completion history
 * 
 * STREAK RULES (IMPORTANT):
 * 1. Completed days extend the streak
 * 2. Skipped days DO NOT break the streak (treated as maintained)
 * 3. Missed days (no entry) DO break the streak
 * 4. Streak counts consecutive active days (completed or skipped)
 * 
 * PERSISTENCE LOGIC:
 * 1. Validates habit not already completed today
 * 2. Checks if completion is consecutive (yesterday completed OR skipped)
 * 3. Increments streak if consecutive, resets to 1 if gap exists
 * 4. Adds entry to completionHistory (permanent record)
 * 5. Updates lastCompleted to today
 * 6. Saves to MongoDB via this.save()
 * 
 * BACKWARD COMPATIBILITY:
 * - Works with existing habits that don't have new fields
 * - Sets completedAt timestamp and status to 'completed'
 * - Existing data remains intact
 * 
 * AFTER PAGE RELOAD:
 * - completionHistory persists in database
 * - streak is already calculated and stored
 * - lastCompleted allows quick "completed today?" check
 */
habitSchema.methods.complete = function(duration = null, reflection = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for consistent date comparison
    
    // Check if already completed or skipped today (prevent duplicate entries)
    const todayEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });
    
    if (todayEntry) {
        if (todayEntry.status === 'completed') {
            throw new Error('Habit already completed today');
        } else if (todayEntry.status === 'skipped') {
            throw new Error('Cannot complete a day already marked as skipped');
        }
    }
    
    // Check if streak is consecutive (yesterday was completed OR skipped)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
    });
    
    // Streak logic: skipped days don't break streak, only missed days do
    if (yesterdayEntry && (yesterdayEntry.status === 'completed' || yesterdayEntry.status === 'skipped')) {
        // Consecutive day (completed or skipped) - increment streak
        this.streak += 1;
    } else if (!this.lastCompleted) {
        // First completion ever - start at 1
        this.streak = 1;
    } else {
        // Check if there's a gap (missed day)
        const lastDate = new Date(this.lastCompleted);
        lastDate.setHours(0, 0, 0, 0);
        const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysSince === 1) {
            // Yesterday - continue streak
            this.streak += 1;
        } else {
            // Gap exists - check if all gap days were skipped
            let allSkipped = true;
            for (let i = 1; i < daysSince; i++) {
                const checkDate = new Date(lastDate);
                checkDate.setDate(lastDate.getDate() + i);
                const gapEntry = this.completionHistory.find(entry => {
                    const d = new Date(entry.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === checkDate.getTime();
                });
                if (!gapEntry || gapEntry.status !== 'skipped') {
                    allSkipped = false;
                    break;
                }
            }
            
            if (allSkipped) {
                // All gap days were skipped - maintain streak
                this.streak += 1;
            } else {
                // At least one day was missed - reset streak
                this.streak = 1;
            }
        }
    }
    
    // Update last completed date (for quick checks without scanning history)
    this.lastCompleted = today;
    
    // Update new status fields
    this.status = 'completed';
    this.completedAt = new Date(); // Current timestamp with time
    
    // Reset pausedDuration after completion (ready for next session)
    this.pausedDuration = 0;
    
    // Add to completion history (permanent audit trail in MongoDB)
    // This array is the source of truth - persists across all page reloads
    this.completionHistory.push({
        date: today,
        status: 'completed',
        duration: duration, // Store duration in seconds for accountability
        reflection: reflection // Store user's reflection for accountability
    });
    
    // Save all changes to MongoDB (persistence)
    return this.save();
};

/**
 * Mark a day as skipped (intentionally not done)
 * 
 * SKIP RULES (CRITICAL):
 * 1. Maximum 1 skip per week (Monday-Sunday)
 * 2. Cannot skip 2 consecutive days
 * 3. Skipped days DO NOT break streaks
 * 4. Skipped days count as "active" (not missed)
 * 
 * VALIDATION:
 * - Checks if day already has an entry (completed/skipped)
 * - Enforces weekly skip limit (max 1 per week)
 * - Prevents consecutive skips (yesterday or tomorrow can't be skipped)
 * 
 * STREAK IMPACT:
 * - Skips maintain the streak (don't break it)
 * - Only missed days (no entry) break streaks
 */
habitSchema.methods.skipDay = async function(date) {
    const skipDate = new Date(date || new Date());
    skipDate.setHours(0, 0, 0, 0);
    
    // Check if already has entry for this date
    const existingIdx = this.completionHistory.findIndex(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === skipDate.getTime();
    });
    
    if (existingIdx !== -1) {
        const status = this.completionHistory[existingIdx].status;
        throw new Error(`Day already marked as ${status}. Remove it first to change.`);
    }
    
    // RULE 1: Check weekly skip limit (max 1 skip per week)
    const weekSkips = this.getWeeklyStatus(skipDate).filter(day => day.status === 'skipped');
    if (weekSkips.length >= 1) {
        throw new Error('Maximum 1 skip per week allowed. This maintains consistency.');
    }
    
    // RULE 2: Check for consecutive skips (yesterday)
    const yesterday = new Date(skipDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime();
    });
    
    if (yesterdayEntry && yesterdayEntry.status === 'skipped') {
        throw new Error('Cannot skip consecutive days. Yesterday was already skipped.');
    }
    
    // RULE 2: Check for consecutive skips (tomorrow)
    const tomorrow = new Date(skipDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEntry = this.completionHistory.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === tomorrow.getTime();
    });
    
    if (tomorrowEntry && tomorrowEntry.status === 'skipped') {
        throw new Error('Cannot skip consecutive days. Tomorrow is already skipped.');
    }
    
    // Add skip entry to history
    this.completionHistory.push({
        date: skipDate,
        status: 'skipped'
    });
    
    // IMPORTANT: Skips do NOT break streaks
    // Streak only breaks if you miss a day entirely (no entry at all)
    // Update lastCompleted if this is the most recent activity
    if (!this.lastCompleted || skipDate > this.lastCompleted) {
        this.lastCompleted = skipDate;
    }
    
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

    // Reset status fields
    this.status = 'idle';
    this.startedAt = null;
    this.completedAt = null;

    // Recompute lastCompleted and streak based on remaining history
    // This ensures data integrity after reload
    this._recomputeFromHistory();

    return this.save();
};

/**
 * Recompute `lastCompleted` and `streak` from `completionHistory`.
 * 
 * STREAK CALCULATION RULES:
 * 1. Completed days increment streak
 * 2. Skipped days maintain streak (don't break it)
 * 3. Missed days (gaps with no entry) break streak
 * 4. Streak = consecutive days with EITHER completed OR skipped status
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
 * 2. Find the last activity date (completed or skipped)
 * 3. Count backwards including both completed and skipped days
 * 4. Stop when a true gap (missed day) is found
 * 5. Update streak and lastCompleted accordingly
 */
habitSchema.methods._recomputeFromHistory = function () {
    // If no history, reset everything to zero state
    if (!this.completionHistory || this.completionHistory.length === 0) {
        this.lastCompleted = null;
        this.streak = 0;
        return;
    }

    // Sort all entries by date ascending (completed AND skipped)
    const history = [...this.completionHistory]
        .filter(h => h.status === 'completed' || h.status === 'skipped')
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

    // Count consecutive days (completed OR skipped) ending at lastCompleted
    let streak = 1; // At least 1 day (the last day)
    let cursor = new Date(last);
    
    // Iterate from the end backwards through history
    for (let i = history.length - 2; i >= 0; i--) {
        const d = new Date(history[i].date);
        d.setHours(0, 0, 0, 0);
        
        // Expected previous day
        const prev = new Date(cursor);
        prev.setDate(prev.getDate() - 1);
        
        if (d.getTime() === prev.getTime()) {
            // Consecutive day found (either completed or skipped)
            // Both maintain the streak
            streak += 1;
            cursor = d;
        } else if (d.getTime() === cursor.getTime()) {
            // Duplicate entry for same day (shouldn't happen, but handle gracefully)
            continue;
        } else {
            // Gap found - check if all gap days are filled with entries
            let gapFilled = true;
            let checkDate = new Date(prev);
            
            while (checkDate.getTime() > d.getTime()) {
                const hasEntry = history.some(entry => {
                    const ed = new Date(entry.date);
                    ed.setHours(0, 0, 0, 0);
                    return ed.getTime() === checkDate.getTime();
                });
                
                if (!hasEntry) {
                    // True gap found (missed day with no entry)
                    gapFilled = false;
                    break;
                }
                
                checkDate.setDate(checkDate.getDate() - 1);
            }
            
            if (gapFilled && checkDate.getTime() === d.getTime()) {
                // All gap days had entries (completed or skipped)
                // Continue counting streak
                streak += 1;
                cursor = d;
            } else {
                // True gap exists (at least one missed day)
                // Streak is broken - stop counting
                break;
            }
        }
    }
    
    // Update streak with calculated value
    this.streak = streak;
};

/**
 * Calculate which badges should be unlocked based on current streak
 * 
 * BADGE MILESTONES:
 * - 7 days: "Week Warrior" 🥉
 * - 21 days: "Habit Former" 🥈
 * - 30 days: "Month Master" 🏅
 * - 50 days: "Halfway Hero" 🎖️
 * - 100 days: "Century Champion" 🏆
 * 
 * STREAK RULES FOR BADGES:
 * - Completed days count toward streak
 * - Skipped days maintain streak (don't break it)
 * - Only missed days (no entry) break the streak
 * 
 * RETURNS: Array of badge objects with:
 * - level: milestone number
 * - name: badge name
 * - icon: badge emoji
 * - days: days required
 * - unlocked: whether user has reached this milestone
 */
habitSchema.methods.getBadges = function() {
    const badges = [
        { level: 1, name: 'Day One', icon: '🌱', days: 1 },
        { level: 2, name: 'Week Warrior', icon: '🥉', days: 7 },
        { level: 3, name: 'Habit Former', icon: '🥈', days: 21 },
        { level: 4, name: 'Month Master', icon: '🏅', days: 30 },
        { level: 5, name: 'Halfway Hero', icon: '🎖️', days: 50 },
        { level: 6, name: 'Century Champion', icon: '🏆', days: 100 },
        { level: 7, name: 'Double Century', icon: '💎', days: 200 },
        { level: 8, name: 'Triple Century', icon: '👑', days: 300 },
        { level: 9, name: 'Year Master', icon: '🌟', days: 365 }
    ];
    
    return badges.map(badge => ({
        ...badge,
        unlocked: this.streak >= badge.days
    }));
};

/**
 * Get the highest badge level unlocked
 * Returns 0 if no badges unlocked yet
 */
habitSchema.methods.getHighestBadge = function() {
    const badges = this.getBadges();
    const unlocked = badges.filter(b => b.unlocked);
    return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
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
