/**
 * Habit Routes
 * API endpoints for habit CRUD operations
 */

const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

// ========== GET Routes ==========

/**
 * GET /api/habits/analytics/daily
 * Get daily analytics across all habits
 */
router.get('/analytics/daily', habitController.getDailyAnalytics);

/**
 * GET /api/habits/analytics/weekly
 * Get weekly analytics for all habits
 */
router.get('/analytics/weekly', habitController.getWeeklyAnalytics);
            
            return {
                _id: habit._id,
                name: habit.name,
                category: habit.category,
                streak: habit.streak,
                daysPerWeek: habit.daysPerWeek || 7,
                completed,
                skipped,
                total,
                completionRate,
                weekStatus
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
});

/**
 * GET /api/habits
 * Get all active habits
 */
router.get('/', habitController.getAllHabits);

/**
 * GET /api/habits/:id
 * Get a single habit by ID
 */
router.get('/:id', habitController.getHabitById);

/**
 * GET /api/habits/category/:category
 * Get habits by category
 */
router.get('/category/:category', async (req, res) => {
    try {
        const habits = await Habit.findByCategory(req.params.category);
        res.json({
            success: true,
            count: habits.length,
            data: habits
        });
    } catch (error) {
        console.error('Error fetching habits by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habits',
            error: error.message
        });
    }
});

// ========== POST Routes ==========

/**
 * POST /api/habits
 * Create a new habit
 */
router.post('/', habitController.createHabit);
    try {
        const userId = req.session.userId;
        const { name, description, category, frequency, daysPerWeek, skipDays, minimumDuration } = req.body;
        
        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Habit name is required'
            });
        }
        
        // Validate daysPerWeek if provided
        const validDaysPerWeek = daysPerWeek ? parseInt(daysPerWeek) : 7;
        if (validDaysPerWeek < 1 || validDaysPerWeek > 7) {
            return res.status(400).json({
                success: false,
                message: 'Days per week must be between 1 and 7'
            });
        }
        
        // Validate skipDays array if provided
        const validSkipDays = Array.isArray(skipDays) ? skipDays : [];
        const expectedSkipDays = 7 - validDaysPerWeek;
        
        // Only validate count if there are skip days expected
        if (expectedSkipDays > 0 && validSkipDays.length !== expectedSkipDays) {
            console.error('Skip days validation failed:', {
                validSkipDays,
                expectedSkipDays,
                validDaysPerWeek
            });
            return res.status(400).json({
                success: false,
                message: `Please select exactly ${expectedSkipDays} day(s) to skip. You selected ${validSkipDays.length}.`
            });
        }
        
        // Validate minimumDuration if provided
        let validMinimumDuration = null;
        if (minimumDuration !== undefined && minimumDuration !== null && minimumDuration !== '') {
            validMinimumDuration = parseInt(minimumDuration);
            if (isNaN(validMinimumDuration) || validMinimumDuration < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum duration must be a positive number'
                });
            }
        }
        
        console.log('Creating habit with:', {
            name: name.trim(),
            category: category?.trim() || 'general',
            daysPerWeek: validDaysPerWeek,
            skipDays: validSkipDays,
            minimumDuration: validMinimumDuration
        });
        
        // Create new habit
        const habitData = {
            userId,
            name: name.trim(),
            description: description?.trim() || '',
            category: category?.trim() || 'general',
            frequency: frequency || 'daily',
            daysPerWeek: validDaysPerWeek,
            skipDays: validSkipDays
        };
        
        // Add minimumDuration only if it's valid
        if (validMinimumDuration !== null) {
            habitData.minimumDuration = validMinimumDuration;
        }
        
        const habit = new Habit(habitData);
        
        await habit.save();
        
        res.status(201).json({
            success: true,
            message: 'Habit created successfully',
            data: habit
        });
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create habit',
            error: error.message
        });
    }
});

/**
 * POST /api/habits/:id/complete
 * Mark a habit as completed for today
 */
router.post('/:id/complete', habitController.completeHabit);
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        // Use the instance method to complete the habit
        await habit.complete();
        
        res.json({
            success: true,
            message: `Great job! Your streak is now ${habit.streak} days! 🔥`,
            data: habit
        });
    } catch (error) {
        // Handle specific error for already completed today
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
});

/**
 * POST /api/habits/:id/start
 * Start working on a habit (set status to in-progress)
 */
router.post('/:id/start', async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        // Use the instance method to start the habit
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
});

/**
 * POST /api/habits/:id/uncomplete
 * POST /api/habits/:id/uncomplete-today (alias)
 * Remove today's completion for a habit (undo)
 * Resets completedAt and status fields
 */
router.post('/:id/uncomplete', async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find and remove today's completion entry
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
        
        // Remove today's entry
        habit.completionHistory.splice(todayIndex, 1);
        
        // Reset status fields to allow re-completion
        habit.status = 'idle';
        habit.completedAt = null;
        
        // Recompute streak from history
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
});

// Alias route for backward compatibility
router.post('/:id/uncomplete-today', async (req, res) => {
    // Forward to uncomplete route
    req.url = req.url.replace('/uncomplete-today', '/uncomplete');
    return router.handle(req, res);
});

/**
 * PUT /api/habits/:id/today
 * Mark a habit as completed or incomplete for today
 * Body: { completed: boolean, date?: string }
 */
router.put('/:id/today', async (req, res) => {
    try {
        const { completed, date } = req.body;
        if (typeof completed !== 'boolean') {
            return res.status(400).json({ success: false, message: 'Field "completed" must be boolean' });
        }

        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        if (!habit) {
            return res.status(404).json({ success: false, message: 'Habit not found' });
        }

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const hasEntry = habit.completionHistory.some(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === targetDate.getTime();
        });

        if (completed) {
            if (hasEntry) {
                return res.json({ success: true, message: 'Already has entry for this day', data: habit });
            }
            // For backdated completions, add directly instead of using complete()
            if (date) {
                habit.completionHistory.push({
                    date: targetDate,
                    status: 'completed'
                });
                habit._recomputeFromHistory();
                await habit.save();
            } else {
                await habit.complete();
            }
            return res.json({ success: true, message: `Marked complete. Streak: ${habit.streak}`, data: habit });
        } else {
            if (!hasEntry) {
                return res.json({ success: true, message: 'Already incomplete for this day', data: habit });
            }
            // Remove entry for this date
            const idx = habit.completionHistory.findIndex(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === targetDate.getTime();
            });
            if (idx !== -1) {
                habit.completionHistory.splice(idx, 1);
                habit._recomputeFromHistory();
                await habit.save();
            }
            return res.json({ success: true, message: 'Removed entry for this day', data: habit });
        }
    } catch (error) {
        console.error('Error toggling today status:', error);
        const status = error.message === 'Habit not completed today' ? 400 : 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to toggle today status' });
    }
});

/**
 * GET /api/habits/:id/weekly
 * Get weekly status for a habit (7 days Mon-Sun)
 */
router.get('/:id/weekly', async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        // Get reference date from query param or use today
        const referenceDate = req.query.date ? new Date(req.query.date) : new Date();
        const weeklyStatus = habit.getWeeklyStatus(referenceDate);
        
        res.json({
            success: true,
            data: {
                habit: {
                    _id: habit._id,
                    name: habit.name,
                    streak: habit.streak
                },
                week: weeklyStatus
            }
        });
    } catch (error) {
        console.error('Error fetching weekly status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly status',
            error: error.message
        });
    }
});

/**
 * POST /api/habits/:id/skip
 * Mark a day as skipped (intentionally not done)
 * Body: { date: "2025-12-23" }
 */
router.post('/:id/skip', async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        const skipDate = req.body.date ? new Date(req.body.date) : new Date();
        await habit.skipDay(skipDate);
        
        res.json({
            success: true,
            message: 'Day marked as skipped',
            data: habit
        });
    } catch (error) {
        console.error('Error skipping day:', error);
        const status = error.message.includes('cannot') || error.message.includes('only') || error.message.includes('already') ? 400 : 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to skip day'
        });
    }
});

/**
 * PUT /api/habits/:id/day
 * Mark a specific day as completed or skipped
 * Body: { date: "2025-12-23", status: "completed" | "skipped" }
 */
router.put('/:id/day', async (req, res) => {
    try {
        const { date, status } = req.body;
        
        if (!date || !status) {
            return res.status(400).json({
                success: false,
                message: 'Date and status are required'
            });
        }
        
        if (!['completed', 'skipped'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "completed" or "skipped"'
            });
        }
        
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        // Remove existing entry for this date if any
        const existingIdx = habit.completionHistory.findIndex(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === targetDate.getTime();
        });
        
        if (existingIdx !== -1) {
            habit.completionHistory.splice(existingIdx, 1);
        }
        
        if (status === 'completed') {
            // Use the complete method for completed status
            await habit.complete();
        } else if (status === 'skipped') {
            // Use the skipDay method for skipped status
            await habit.skipDay(targetDate);
        }
        
        res.json({
            success: true,
            message: `Day marked as ${status}`,
            data: habit
        });
    } catch (error) {
        console.error('Error updating day status:', error);
        const status = error.message.includes('cannot') || error.message.includes('only') || error.message.includes('already') ? 400 : 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Failed to update day status'
        });
    }
});

// ========== PUT Routes ==========

/**
 * PUT /api/habits/:id
 * Update a habit
 */
router.put('/:id', habitController.updateHabit);
    try {
        const { name, description, category, frequency, isActive } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category) updateData.category = category.trim();
        if (frequency) updateData.frequency = frequency;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const habit = await Habit.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Habit updated successfully',
            data: habit
        });
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update habit',
            error: error.message
        });
    }
});

// ========== DELETE Routes ==========

/**
 * DELETE /api/habits/:id
 * Delete a habit
 */
router.delete('/:id', habitController.deleteHabit);
    try {
        const habit = await Habit.findByIdAndDelete(req.params.id);
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Habit deleted successfully',
            data: habit
        });
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete habit',
            error: error.message
        });
    }
});

/**
 * POST /api/habits/:id/reset-streak
 * Reset habit streak to 0
 */
router.post('/:id/reset-streak', habitController.resetStreak);
    try {
        const habit = await Habit.findOne({ _id: req.params.id, userId: req.session.userId });
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        await habit.resetStreak();
        
        res.json({
            success: true,
            message: 'Habit streak reset successfully',
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
});

module.exports = router;
