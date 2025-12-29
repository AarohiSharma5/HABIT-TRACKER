/**
 * Routine Model
 * Mongoose schema for AI-generated habit routines
 */

const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true,
        index: true
    },
    habitName: {
        type: String,
        required: true
    },
    habitCategory: {
        type: String,
        default: 'general'
    },
    userPrompt: {
        type: String,
        required: true,
        trim: true
    },
    aiRoutineText: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one routine per habit per user
routineSchema.index({ userId: 1, habitId: 1 }, { unique: true });

module.exports = mongoose.model('Routine', routineSchema);
