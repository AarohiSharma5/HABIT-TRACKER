# AI Routine Assistant - Quick Start Guide

## Setup (5 minutes)

### 1. Get Gemini API Key
```
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
```

### 2. Add to .env file
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Restart Server
```bash
npm run dev
```

Done! The feature is now active.

---

## How to Use

### For Users:

1. **Create a Routine**
   - Go to "All Habits" page
   - Click "💡 Routine" button on any habit card
   - Enter your request (e.g., "Give me a morning routine")
   - Click "Generate Routine"
   - Wait 3-5 seconds for AI to generate

2. **View a Routine**
   - Click "💡 Routine" button
   - Routine appears automatically if it exists

3. **Update a Routine**
   - Open existing routine
   - Click "🔄 Regenerate"
   - Enter new request
   - Generate new routine

4. **Delete a Routine**
   - Open routine
   - Click "🗑️ Delete"
   - Confirm deletion

---

## Files Modified/Created

### New Files:
- `/models/Routine.js` - Database model
- `/controllers/routineController.js` - Business logic
- `/routes/routines.js` - API endpoints
- `/public/js/routine.js` - Frontend logic
- `/AI_ROUTINE_ASSISTANT.md` - Full documentation

### Modified Files:
- `/server.js` - Added routine routes and CSP
- `/views/index.ejs` - Added routine modal
- `/views/partials/footer.ejs` - Added routine.js script
- `/public/js/script.js` - Added routine button to habit cards
- `/public/css/styles.css` - Added routine styles

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routines/generate` | Generate new routine |
| GET | `/api/routines/:habitId` | Get routine for habit |
| DELETE | `/api/routines/:habitId` | Delete routine |
| GET | `/api/routines` | Get all user routines |

---

## Example Prompts

### General:
- "Give me a simple daily routine"
- "What's the best time to do this?"
- "Help me stay consistent"

### Specific:
- "Create a 30-day challenge"
- "Give me morning and evening steps"
- "How do I build this habit on busy days?"

### Advanced:
- "Design a progressive routine that gets harder"
- "Give me a routine that fits with my 9-5 job"
- "Help me combine this with my other habits"

---

## Troubleshooting

### Error: "Couldn't generate a routine"
**Fix:** Check `.env` file has `GEMINI_API_KEY` set

### Modal won't open
**Fix:** Clear browser cache, reload page

### Routine not saving
**Fix:** Check MongoDB connection

### Button not showing
**Fix:** Hard refresh page (Ctrl+Shift+R / Cmd+Shift+R)

---

## Technical Notes

- **Model:** Gemini Pro
- **Response Time:** 2-5 seconds
- **Storage:** MongoDB
- **Cache:** Yes (database)
- **Cost:** Free tier: 60 requests/minute
- **Security:** API key server-side only

---

## Mobile Experience

- Full-screen modal on phones
- Touch-optimized buttons
- Scrollable content area
- Works on all devices

---

**Questions?** Check `/AI_ROUTINE_ASSISTANT.md` for detailed docs.
