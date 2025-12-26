/**
 * Habit Controller
 * Business logic for habit operations
 */

const Habit = require('../models/Habit');

/**
 * Get daily analytics across all habits
 */
exports.getDailyAnalytics = async (req, res) => {
    try {
        const userId = req.session.userId;
        const habits = await Habit.findActive(userId);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let completed = 0;
        let skipped = 0;
        let notDone = 0;
        
        const categoryStats = {};
        
        habits.forEach(habit => {
            const todayEntry = habit.completionHistory.find(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            
            if (todayEntry) {
                if (todayEntry.status === 'completed') completed++;
                else if (todayEntry.status === 'skipped') skipped++;
                else notDone++;
            } else {
                notDone++;
            }
            
            const category = habit.category || 'general';
            if (!categoryStats[category]) {
                categoryStats[category] = { completed: 0, total: 0 };
            }
            categoryStats[category].total++;
            if (todayEntry && (todayEntry.status === 'completed' || todayEntry.status === 'skipped')) {
                categoryStats[category].completed++;
            }
        });
        
        const total = habits.length;
        const effectiveCompleted = completed + skipped;
        
        res.json({
            success: true,
            data: {
                total,
                completed,
                skipped,
                notDone,
                completionRate: total > 0 ? Math.round((effectiveCompleted / total) * 100) : 0,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error fetching daily analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
};

/**
 * Get weekly analytics for all habits
 */
exports.getWeeklyAnalytics = async (req, res) => {
    try {
        const userId = req.session.userId;
        const habits = await Habit.findActive(userId);
        
        const weeklyData = habits.map(habit => {
            const weekStatus = habit.getWeeklyStatus();
            const completed = weekStatus.filter(d => d.status === 'completed').length;
            const skipped = weekStatus.filter(d => d.status === 'skipped').length;
            const total = 7;
            const effectiveCompleted = completed + skipped;
            const completionRate = Math.round((effectiveCompleted / total) * 100);
            
            return {
                habitId: habit._id,
                habitName: habit.name,
                category: habit.category,
                weekStatus,
                completed,
                skipped,
                completionRate,
                streak: habit.streak
            };
        });
        
        res.json({
            success: true,
            data: weeklyData
        });
    } catch (error) {
        console.error('Error fetching weekly analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly analytics',
            error: error.message
        });
    }
};

/**
 * Get all active habits for the current user
 */
exports.getAllHabits = async (req, res) => {
    try {
        const userId = req.session.userId;
        const habits = await Habit.findActive(userId);
        
        res.json({
            success: true,
            habits: habits,
            count: habits.length
        });
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habits',
            error: error.message
        });
    }
};

/**
 * Get a single habit by ID
 */
exports.getHabitById = async (req, res) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        res.json({
            success: true,
            habit: habit
        });
    } catch (error) {
        console.error('Error fetching habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habit',
            error: error.message
        });
    }
};

/**
 * Create a new habit
 */
exports.createHabit = async (req, res) => {
    try {
        const { name, description, category, daysPerWeek, skipDays, minimumDuration, accountabilityMode } = req.body;
        const userId = req.session.userId;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Habit name is required'
            });
        }
        
        // Validate minimumDuration if provided
        if (minimumDuration !== null && minimumDuration !== undefined) {
            const duration = parseInt(minimumDuration);
            if (isNaN(duration) || duration < 1 || duration > 480) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum duration must be between 1 and 480 minutes'
                });
            }
        }
        
        const habitData = {
            userId,
            name: name.trim(),
            description: description?.trim() || '',
            category: category || 'general',
            daysPerWeek: daysPerWeek || 7,
            skipDays: skipDays || [],
            minimumDuration: minimumDuration ? parseInt(minimumDuration) : null,
            accountabilityMode: accountabilityMode || false
        };
        
        const habit = new Habit(habitData);
        await habit.save();
        
        res.status(201).json({
            success: true,
            message: 'Habit created successfully!',
            habit: habit
        });
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create habit',
            error: error.message
        });
    }
};

/**
 * Update a habit
 */
exports.updateHabit = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        if (name !== undefined) habit.name = name.trim();
        if (description !== undefined) habit.description = description.trim();
        if (category !== undefined) habit.category = category;
        
        await habit.save();
        
        res.json({
            success: true,
            message: 'Habit updated successfully',
            habit: habit
        });
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update habit',
            error: error.message
        });
    }
};

/**
 * Delete a habit
 */
exports.deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Habit deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete habit',
            error: error.message
        });
    }
};

/**
 * Mark habit as completed for today
 * 
 * CRITICAL FLOW:
 * 1. Validates habit exists and belongs to user
 * 2. Requires reflection (minimum 5 characters) - enforces mindfulness
 * 3. Performs soft pattern detection (gentle accountability nudges)
 * 4. Calls habit.complete() which:
 *    - Checks if already completed today (prevents duplicates)
 *    - Validates streak continuation logic (completed/skipped maintain, missed breaks)
 *    - Adds entry to completionHistory[] (permanent database record)
 *    - Updates streak counter based on consecutive active days
 *    - Sets status to 'completed' and saves timestamps
 * 5. Returns success with encouraging message
 * 
 * STREAK LOGIC (IMPLEMENTED IN MODEL):
 * - Yesterday completed OR skipped → streak continues (+1)
 * - Yesterday missed (no entry) → streak resets to 1
 * - Skipped days DO NOT break streaks (as per specification)
 * 
 * PATTERN DETECTION (SOFT ACCOUNTABILITY):
 * - Detects fast completions, instant completions without timer
 * - Shows gentle reminders, never blocks or punishes
 * - Encourages meaningful engagement with habits
 * 
 * REFLECTION REQUIREMENT:
 * - Enforced before completion via modal (frontend)
 * - Stored in completionHistory entry for review
 * - Used in honesty check to promote self-awareness
 */
exports.completeHabit = async (req, res) => {
    try {
        const { duration, reflection } = req.body;
        
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        // REFLECTION VALIDATION: Enforce meaningful reflection (at least 5 characters)
        // This promotes self-awareness and mindfulness about the habit
        if (reflection !== undefined && reflection !== null && reflection.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a meaningful reflection (at least 5 characters)'
            });
        }
        
        // PATTERN DETECTION: Soft accountability checks (non-blocking)
        // These detect suspicious patterns and provide gentle nudges
        // IMPORTANT: Never blocks completion, only provides supportive reminders
        const patternWarnings = [];
        
        // Pattern 1: Fast completion (completed in less than 1 minute without being started)
        if (!habit.startedAt && duration && duration < 60) {
            patternWarnings.push('completed very quickly');
        }
        
        // Pattern 2: Habit completed without being started (instant completion)
        if (!habit.startedAt && habit.status === 'idle') {
            patternWarnings.push('completed without timer');
        }
        
        // Pattern 3: Check for duplicate completion attempts (should be caught by model)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCompletions = habit.completionHistory.filter(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime() && entry.status === 'completed';
        });
        
        if (todayCompletions.length > 0) {
            patternWarnings.push('duplicate completion attempt');
        }
        
        // COMPLETE THE HABIT: Calls model method which handles all streak logic
        await habit.complete(duration, reflection);
        
        // Prepare response message
        let message = `Great job! Your streak is now ${habit.streak} days! 🔥`;
        
        // Add gentle nudge if patterns detected (non-blocking, supportive)
        if (patternWarnings.length > 0 && patternWarnings[0] !== 'duplicate completion attempt') {
            message += '\n\n💡 Reminder: Taking time to be present with your habit makes it more meaningful. Keep up the great work!';
        }
        
        res.json({
            success: true,
            message: message,
            data: habit,
            patternFlags: patternWarnings // Include for analytics but don't block
        });
    } catch (error) {
        if (error.message === 'Habit already completed today') {
            return res.status(400).json({
                success: false,
                message: 'You already completed this habit today! 🎉'
            });
        }
        
        console.error('Error completing habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete habit',
            error: error.message
        });
    }
};

/**
 * Start working on a habit (set status to in-progress)
 */
exports.startHabit = async (req, res) => {
    try {
        // Check if user has any other habit in progress
        const inProgressHabit = await Habit.findOne({
            userId: req.session.userId,
            status: 'in-progress',
            _id: { $ne: req.params.id }
        });
        
        if (inProgressHabit) {
            return res.status(400).json({
                success: false,
                message: `Please complete or pause "${inProgressHabit.name}" first. Only one habit can be in progress at a time.`
            });
        }
        
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        await habit.startHabit();
        
        res.json({
            success: true,
            message: 'Timer started! Good luck! ⏱️',
            data: habit
        });
    } catch (error) {
        console.error('Error starting habit:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to start habit'
        });
    }
};

/**
 * Pause habit (accumulate time and reset to idle state)
 */
exports.pauseHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        // Calculate elapsed time if habit is in progress
        if (habit.status === 'in-progress' && habit.startedAt) {
            const elapsedSeconds = Math.floor((Date.now() - new Date(habit.startedAt).getTime()) / 1000);
            // Add current session time to accumulated pausedDuration
            habit.pausedDuration = (habit.pausedDuration || 0) + elapsedSeconds;
        }
        
        // Reset status to idle but keep pausedDuration
        habit.status = 'idle';
        habit.startedAt = null;
        await habit.save();
        
        res.json({
            success: true,
            message: 'Timer paused',
            data: habit
        });
    } catch (error) {
        console.error('Error pausing habit:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to pause habit'
        });
    }
};

/**
 * Uncomplete habit for today
 */
exports.uncompleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayIndex = habit.completionHistory.findIndex(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
        
        if (todayIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Habit not completed today'
            });
        }
        
        habit.completionHistory.splice(todayIndex, 1);
        habit.status = 'idle';
        habit.completedAt = null;
        habit._recomputeFromHistory();
        
        await habit.save();
        
        res.json({
            success: true,
            message: 'Habit unmarked for today',
            data: habit
        });
    } catch (error) {
        console.error('Error uncompleting habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to uncomplete habit',
            error: error.message
        });
    }
};

/**
 * Skip a day for a habit (mark as intentionally not done)
 * 
 * SKIP RULES (ENFORCED IN MODEL):
 * 1. Maximum 1 skip per week (Monday-Sunday)
 * 2. Cannot skip 2 consecutive days
 * 3. Skipped days DO NOT break streaks (maintains consistency)
 * 4. Skipped days count as "active" days (habit maintained)
 * 
 * IMPLEMENTATION:
 * - Calls habit.skipDay() which validates all skip rules
 * - Adds 'skipped' entry to completionHistory
 * - Updates lastCompleted to maintain streak
 * - Does NOT reset or break the streak counter
 * 
 * STREAK IMPACT:
 * - Yesterday completed + today skipped → streak continues
 * - Yesterday skipped + today skipped → ERROR (consecutive skip rule)
 * - Skips are treated as active engagement, not missed days
 * 
 * WHY SKIPS DON'T BREAK STREAKS:
 * The specification states that skipped days maintain streaks because:
 * - Users are being intentional about their habit
 * - Rest days are planned, not failures
 * - Consistency is about engagement, not perfection
 * - Only missed days (no entry at all) indicate disengagement
 */
exports.skipHabit = async (req, res) => {
    try {
        const { date } = req.body;
        
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        const skipDate = date ? new Date(date) : new Date();
        await habit.skipDay(skipDate);
        
        res.json({
            success: true,
            message: 'Day marked as skipped',
            data: habit
        });
    } catch (error) {
        console.error('Error skipping habit:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to skip habit'
        });
    }
};

/**
 * Reset habit streak
 */
exports.resetStreak = async (req, res) => {
    try {
        const habit = await Habit.findOne({ 
            _id: req.params.id, 
            userId: req.session.userId 
        });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        habit.streak = 0;
        habit.lastCompleted = null;
        await habit.save();
        
        res.json({
            success: true,
            message: 'Streak reset successfully',
            data: habit
        });
    } catch (error) {
        console.error('Error resetting streak:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset streak',
            error: error.message
        });
    }
};

/**
 * Submit honesty review for completed habits
 * Updates honesty status without breaking streaks
 */
exports.submitHonestyReview = async (req, res) => {
    try {
        const { reviews } = req.body; // Array of { habitId, honestyStatus }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const results = [];
        
        for (const review of reviews) {
            const habit = await Habit.findOne({
                _id: review.habitId,
                userId: req.session.userId
            });
            
            if (!habit) continue;
            
            // Find today's entry
            const todayEntry = habit.completionHistory.find(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            
            if (todayEntry) {
                // Update honesty status
                todayEntry.honestyStatus = review.honestyStatus;
                
                // If "not really", change status to 'incomplete' but DO NOT break streak
                if (review.honestyStatus === 'not-really') {
                    todayEntry.status = 'incomplete';
                    // Keep streak intact - honesty is respected without punishment
                }
                
                // Update lastHonestyCheck
                habit.lastHonestyCheck = new Date();
                
                await habit.save();
                results.push({ habitId: review.habitId, success: true });
            }
        }
        
        res.json({
            success: true,
            message: 'Thank you for your honesty! 🙏',
            results
        });
    } catch (error) {
        console.error('Error submitting honesty review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit honesty review',
            error: error.message
        });
    }
};
