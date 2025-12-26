/**
 * Habit Routes
 * API endpoints for habit CRUD operations
 * Refactored to use controllers following MVC pattern
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

// ========== POST Routes ==========

/**
 * POST /api/habits
 * Create a new habit
 */
router.post('/', habitController.createHabit);

/**
 * POST /api/habits/:id/complete
 * Mark a habit as completed for today
 */
router.post('/:id/complete', habitController.completeHabit);

/**
 * POST /api/habits/:id/start
 * Start working on a habit (set status to in-progress)
 */
router.post('/:id/start', habitController.startHabit);

/**
 * POST /api/habits/:id/pause
 * Pause a habit (reset startedAt, back to idle)
 */
router.post('/:id/pause', habitController.pauseHabit);

/**
 * POST /api/habits/:id/uncomplete
 * Remove today's completion for a habit (undo)
 */
router.post('/:id/uncomplete', habitController.uncompleteHabit);

/**
 * POST /api/habits/:id/uncomplete-today
 * Alias for uncomplete route (backward compatibility)
 */
router.post('/:id/uncomplete-today', habitController.uncompleteHabit);

/**
 * POST /api/habits/:id/skip
 * Mark a day as skipped (intentionally not done)
 */
router.post('/:id/skip', habitController.skipHabit);

/**
 * POST /api/habits/:id/reset-streak
 * Reset habit streak to 0
 */
router.post('/:id/reset-streak', habitController.resetStreak);

/**
 * POST /api/habits/honesty-review
 * Submit end-of-day honesty review for multiple habits
 */
router.post('/honesty-review', habitController.submitHonestyReview);

// ========== PUT Routes ==========

/**
 * PUT /api/habits/:id
 * Update a habit
 */
router.put('/:id', habitController.updateHabit);

// ========== DELETE Routes ==========

/**
 * DELETE /api/habits/:id
 * Delete a habit
 */
router.delete('/:id', habitController.deleteHabit);

module.exports = router;
