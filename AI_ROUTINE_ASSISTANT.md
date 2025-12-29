# AI Habit Routine Assistant - Feature Documentation

## Overview
The AI Habit Routine Assistant is a new feature that uses Google's Gemini API to generate personalized habit routines for users. This feature provides customized daily plans, weekly structures, and practical tips to help users succeed with their habits.

## Features

### 1. **AI-Powered Routine Generation**
- Users can request personalized routines for any habit
- Powered by Google Gemini Pro API
- Generates practical, actionable advice
- Friendly and encouraging tone

### 2. **Persistent Storage**
- Routines are saved to MongoDB
- Persist across page reloads
- One routine per habit per user
- Includes creation and update timestamps

### 3. **User-Friendly Interface**
- Clean modal design matching existing UI style
- Soft gradients and rounded corners
- Fully responsive (mobile, tablet, desktop)
- Full-screen modal on mobile devices

### 4. **Routine Management**
- View existing routines
- Regenerate routines with new prompts
- Delete routines
- Track when routine was created/updated

## Implementation Details

### Backend Components

#### Models
- **Location:** `/models/Routine.js`
- **Schema Fields:**
  - `userId` - Reference to user
  - `habitId` - Reference to habit (unique per user)
  - `habitName` - Name of the habit
  - `habitCategory` - Category of the habit
  - `userPrompt` - User's original request
  - `aiRoutineText` - Generated routine text
  - `createdAt` - Creation timestamp
  - `updatedAt` - Last update timestamp

#### Controllers
- **Location:** `/controllers/routineController.js`
- **Functions:**
  - `generateRoutine()` - Generate/update routine using Gemini API
  - `getRoutine()` - Get routine for a specific habit
  - `deleteRoutine()` - Delete routine for a habit
  - `getAllRoutines()` - Get all routines for current user

#### Routes
- **Location:** `/routes/routines.js`
- **Endpoints:**
  - `POST /api/routines/generate` - Generate new routine
  - `GET /api/routines/:habitId` - Get routine by habit ID
  - `DELETE /api/routines/:habitId` - Delete routine
  - `GET /api/routines` - Get all routines

### Frontend Components

#### HTML (Views)
- **Location:** `/views/index.ejs`
- **Modal:** `#routine-modal`
  - Request view (for creating routines)
  - Display view (for showing routines)
  - Responsive design with mobile optimization

#### JavaScript
- **Location:** `/public/js/routine.js`
- **Functions:**
  - `openRoutineModal()` - Open modal and check for existing routine
  - `closeRoutineModal()` - Close modal and reset state
  - `generateRoutine()` - Call API to generate routine
  - `displayRoutine()` - Format and display AI-generated text
  - `regenerateRoutine()` - Request new routine
  - `deleteRoutine()` - Remove routine from database

#### CSS
- **Location:** `/public/css/styles.css`
- **Styles:**
  - `.btn-routine` - Button in habit cards
  - `.routine-modal-content` - Modal container
  - `.routine-content` - Routine display area
  - `.routine-text` - Formatted routine content
  - Responsive breakpoints for mobile/tablet

### Integration Points

#### Habit Cards
- Added "💡 Routine" button to each habit card
- Button opens modal with habit context
- Non-intrusive placement with delete button

#### Navigation Flow
1. User clicks "💡 Routine" on habit card
2. System checks if routine exists
3. If exists: Show routine with regenerate/delete options
4. If not: Show prompt form to create routine
5. User enters request and submits
6. Gemini API generates personalized routine
7. Routine is saved and displayed
8. User can close, regenerate, or delete

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Add to Environment Variables
Add to your `.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Server
```bash
npm run dev
```

## Usage Examples

### Example 1: Morning Routine for Exercise
**User Prompt:** "Give me a morning routine for exercising"
**Habit:** "Exercise 30 minutes"
**Category:** Health

**Generated Response:**
- Wake up time suggestions
- Pre-workout preparation steps
- Exercise routine structure
- Cool-down activities
- Motivation tips

### Example 2: Weekly Reading Plan
**User Prompt:** "Help me create a weekly reading schedule"
**Habit:** "Read for 30 minutes"
**Category:** Learning

**Generated Response:**
- Days to read and rest days
- Best times to read
- Environment setup tips
- Progress tracking suggestions
- Book selection advice

### Example 3: Mindfulness Practice
**User Prompt:** "How can I be consistent with meditation?"
**Habit:** "Meditate 10 minutes"
**Category:** Mindfulness

**Generated Response:**
- Morning vs evening meditation
- Creating a quiet space
- Breathing techniques
- Dealing with distractions
- Building consistency

## API Details

### Gemini API Configuration
- **Model:** `gemini-pro`
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 1024
- **Safety Settings:** Medium and above blocked
- **Response Format:** Plain text with markdown formatting

### Prompt Engineering
The system constructs prompts with:
1. System context (role as habit assistant)
2. Habit information (name, category)
3. User's specific request
4. Guidelines for response format
5. Word limit (500 words)

## Error Handling

### Backend Errors
- Missing API key: Returns 500 error
- Invalid habit ID: Returns 404 error
- Gemini API failure: Returns friendly error message
- Network issues: Caught and logged

### Frontend Errors
- API failures: Shows user-friendly message
- Network errors: "Couldn't generate a routine right now. Please try again."
- No blocking of habit flow - feature is fully optional

## Security Considerations

1. **API Key Security**
   - Never exposed to frontend
   - Stored in environment variables
   - Only accessed server-side

2. **User Authorization**
   - Routes protected with `requireAuth` middleware
   - Routines tied to user sessions
   - Users can only access their own routines

3. **Input Validation**
   - Required fields validated
   - Habit ownership verified
   - Text sanitization applied

4. **Content Security Policy**
   - Updated to allow Gemini API connections
   - `https://generativelanguage.googleapis.com` whitelisted

## Performance Optimization

1. **Lazy Loading**
   - Routine UI only loads when needed
   - Modal content loads on demand
   - Minimal impact on initial page load

2. **Caching**
   - Routines stored in database
   - No re-generation on page refresh
   - Only regenerates on explicit user request

3. **Responsive Design**
   - Mobile-optimized modal (full screen)
   - Efficient CSS with minimal repaints
   - Smooth animations without jank

## Testing Checklist

- [ ] Create routine for new habit
- [ ] View existing routine
- [ ] Regenerate routine with different prompt
- [ ] Delete routine
- [ ] Close modal without saving
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test with long routine text
- [ ] Test error handling (invalid API key)
- [ ] Test multiple routines for different habits
- [ ] Verify persistence after page reload
- [ ] Check responsive breakpoints

## Future Enhancements

### Potential Features
1. **Routine Templates**
   - Pre-built routines for common habits
   - Quick-start options

2. **Routine Sharing**
   - Share successful routines with other users
   - Community routine library

3. **Progress Integration**
   - Link routine adherence to habit completion
   - Routine effectiveness tracking

4. **Multi-language Support**
   - Generate routines in user's language
   - Localized advice

5. **Voice Input**
   - Voice-to-text for routine requests
   - Accessibility improvement

6. **Routine Reminders**
   - Integration with notification system
   - Daily routine steps as reminders

## Troubleshooting

### Issue: "Couldn't generate a routine right now"
**Causes:**
- Invalid or missing API key
- Gemini API rate limit exceeded
- Network connectivity issues
- Invalid API response format

**Solutions:**
- Verify API key in `.env` file
- Check API quota in Google Cloud Console
- Test network connection
- Check server logs for detailed error

### Issue: Routine not persisting
**Causes:**
- MongoDB connection issue
- Session timeout
- Browser cache issue

**Solutions:**
- Verify MongoDB connection
- Check session middleware configuration
- Clear browser cache and reload

### Issue: Modal not opening
**Causes:**
- JavaScript file not loaded
- Event listener not attached
- Modal element missing

**Solutions:**
- Check browser console for errors
- Verify `routine.js` is included in footer
- Inspect DOM for modal element

## Support & Maintenance

### Monitoring
- Check Gemini API usage in Google Cloud Console
- Monitor database size (routines collection)
- Track error rates in server logs

### Updates
- Gemini API may receive updates - test compatibility
- Keep dependencies updated (security patches)
- Monitor user feedback for improvements

## License & Credits

- **Gemini API:** Google AI/Vertex AI
- **Implementation:** Custom built for Habit Tracker
- **License:** Same as main application (ISC)

---

**Last Updated:** December 29, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
