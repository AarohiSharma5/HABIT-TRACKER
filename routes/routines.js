/**
 * Routine Routes
 * API endpoints for AI-generated habit routines
 */

const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

/**
 * POST /api/routines/generate
 * Generate a new routine using Gemini API
 */
router.post('/generate', routineController.generateRoutine);

/**
 * GET /api/routines
 * Get all routines for the current user
 */
router.get('/', routineController.getAllRoutines);

/**
 * GET /api/routines/:habitId
 * Get routine for a specific habit
 */
router.get('/:habitId', routineController.getRoutine);

/**
 * DELETE /api/routines/:habitId
 * Delete routine for a specific habit
 */
router.delete('/:habitId', routineController.deleteRoutine);

module.exports = router;
