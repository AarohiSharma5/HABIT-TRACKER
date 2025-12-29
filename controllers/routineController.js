/**
 * Routine Controller
 * Business logic for AI-generated habit routines using Gemini API
 */

const Routine = require('../models/Routine');
const Habit = require('../models/Habit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate a new routine using Gemini API
 */
exports.generateRoutine = async (req, res) => {
    try {
        // Validate user session
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Extract and validate request body
        const { habitId, habitName, habitCategory, userPrompt } = req.body;

        // Validate required fields
        if (!habitId) {
            return res.status(400).json({
                success: false,
                message: 'habitId is required'
            });
        }

        if (!habitName) {
            return res.status(400).json({
                success: false,
                message: 'habitName is required'
            });
        }

        if (!userPrompt || userPrompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'userPrompt is required and cannot be empty'
            });
        }

        console.log(`📝 Generating routine for habit: ${habitName} (${habitId})`);

        // Verify habit exists and belongs to user
        const habit = await Habit.findOne({ _id: habitId, userId: userId });
        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found or does not belong to user'
            });
        }

        // Call Gemini API
        const aiRoutineText = await callGeminiAPI(habitName, habitCategory || 'general', userPrompt);

        // Check if routine already exists for this habit
        let routine = await Routine.findOne({ userId, habitId });

        if (routine) {
            // Update existing routine
            console.log('📝 Updating existing routine');
            routine.habitName = habitName;
            routine.habitCategory = habitCategory || 'general';
            routine.userPrompt = userPrompt;
            routine.aiRoutineText = aiRoutineText;
            routine.updatedAt = Date.now();
            await routine.save();
        } else {
            // Create new routine
            console.log('✨ Creating new routine');
            routine = new Routine({
                userId,
                habitId,
                habitName,
                habitCategory: habitCategory || 'general',
                userPrompt,
                aiRoutineText
            });
            await routine.save();
        }

        console.log('✅ Routine saved to database');

        res.json({
            success: true,
            routine: {
                id: routine._id,
                habitId: routine.habitId,
                habitName: routine.habitName,
                habitCategory: routine.habitCategory,
                userPrompt: routine.userPrompt,
                aiRoutineText: routine.aiRoutineText,
                createdAt: routine.createdAt,
                updatedAt: routine.updatedAt
            }
        });

    } catch (error) {
        console.error('❌ Error generating routine:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Couldn\'t generate a routine right now. Please try again.'
        });
    }
};

/**
 * Get routine for a specific habit
 */
exports.getRoutine = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { habitId } = req.params;

        const routine = await Routine.findOne({ userId, habitId });

        if (!routine) {
            return res.json({
                success: false,
                routine: null,
                message: 'No routine found for this habit'
            });
        }

        res.json({
            success: true,
            routine: {
                id: routine._id,
                habitId: routine.habitId,
                habitName: routine.habitName,
                habitCategory: routine.habitCategory,
                userPrompt: routine.userPrompt,
                aiRoutineText: routine.aiRoutineText,
                createdAt: routine.createdAt,
                updatedAt: routine.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching routine:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching routine'
        });
    }
};

/**
 * Delete routine for a specific habit
 */
exports.deleteRoutine = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { habitId } = req.params;

        const routine = await Routine.findOneAndDelete({ userId, habitId });

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'No routine found for this habit'
            });
        }

        res.json({
            success: true,
            message: 'Routine deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting routine:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting routine'
        });
    }
};

/**
 * Get all routines for the current user
 */
exports.getAllRoutines = async (req, res) => {
    try {
        const userId = req.session.userId;

        const routines = await Routine.find({ userId }).sort({ updatedAt: -1 });

        res.json({
            success: true,
            routines: routines.map(routine => ({
                id: routine._id,
                habitId: routine.habitId,
                habitName: routine.habitName,
                habitCategory: routine.habitCategory,
                userPrompt: routine.userPrompt,
                aiRoutineText: routine.aiRoutineText,
                createdAt: routine.createdAt,
                updatedAt: routine.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching routines:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching routines'
        });
    }
};

/**
 * Call Gemini API to generate a routine
 * @private
 */
async function callGeminiAPI(habitName, habitCategory, userPrompt) {
    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        const error = new Error('GEMINI_API_KEY is not configured in environment variables');
        console.error('❌ Routine generation failed:', error.message);
        throw error;
    }

    try {
        // Initialize Gemini AI with API key
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct the prompt for Gemini
        const prompt = `You are a supportive habit formation assistant. Generate a clear, practical, and encouraging routine for building the habit: "${habitName}" (category: ${habitCategory}).

User's request: ${userPrompt}

Provide:
- A clear daily routine with specific, actionable steps
- Optional weekly structure if relevant
- Realistic and achievable goals
- Friendly, encouraging tone
- Concise and easy-to-read format (use bullet points or numbered lists)

Keep the response under 500 words and focus on practical, immediately actionable advice.`;

        console.log('🤖 Calling Gemini API...');
        
        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Routine generated successfully');
        
        if (!text || text.trim().length === 0) {
            throw new Error('Gemini returned empty response');
        }
        
        return text;

    } catch (error) {
        console.error('❌ Routine generation failed:', error.message);
        
        // Provide more specific error messages
        if (error.message.includes('API key')) {
            throw new Error('Invalid or missing Gemini API key');
        } else if (error.message.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please try again later.');
        } else if (error.message.includes('model')) {
            throw new Error('Gemini model not available. Please contact support.');
        } else {
            throw new Error('Failed to generate routine. Please try again.');
        }
    }
}
