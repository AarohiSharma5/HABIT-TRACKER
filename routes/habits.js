/**
 * Habit Routes
 * API endpoints for habit CRUD operations
 */

const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// ========== GET Routes ==========

/**
 * GET /api/habits
 * Get all active habits
 */
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.findActive();
        res.json({
            success: true,
            count: habits.length,
            data: habits
        });
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habits',
            error: error.message
        });
    }
});

/**
 * GET /api/habits/:id
 * Get a single habit by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found'
            });
        }
        
        res.json({
            success: true,
            data: habit
        });
    } catch (error) {
        console.error('Error fetching habit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch habit',
            error: error.message
        });
    }
});

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
router.post('/', async (req, res) => {
    try {
        const { name, description, category, frequency } = req.body;
        
        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Habit name is required'
            });
        }
        
        // Create new habit
        const habit = new Habit({
            name: name.trim(),
            description: description?.trim() || '',
            category: category?.trim() || 'general',
            frequency: frequency || 'daily'
        });
        
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
router.post('/:id/complete', async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        
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

// ========== PUT Routes ==========

/**
 * PUT /api/habits/:id
 * Update a habit
 */
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.post('/:id/reset-streak', async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        
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
