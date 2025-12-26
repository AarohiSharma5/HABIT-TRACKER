# Habit Tracker - Quick Reference Guide

## 🎯 Core Features Overview

### Authentication
- **Method**: Google OAuth (Firebase)
- **Endpoint**: POST `/auth/google`
- **Session**: Express-session with MongoDB store
- **Isolation**: All habits filtered by `userId`

---

## 📋 Habit States (Three-State System)

| State | Description | Streak Impact | Color |
|-------|-------------|---------------|-------|
| **completed** | User finished habit | ✅ Extends streak | 🟢 Green |
| **skipped** | User intentionally skipped | ✅ Maintains streak | 🟡 Yellow |
| **missed** | No entry (forgotten) | ❌ Breaks streak | 🔴 Red |

---

## 🎯 Skip Rules (Strictly Enforced)

```javascript
// Rule 1: Maximum 1 skip per week (Monday-Sunday)
if (weekSkips.length >= 1) throw new Error('Max 1 skip per week');

// Rule 2: Cannot skip consecutive days
if (yesterdayWasSkipped || tomorrowIsSkipped) {
    throw new Error('Cannot skip consecutive days');
}

// Rule 3: Skipped days DO NOT break streaks
// ✅ Mon: completed, Tue: skipped, Wed: completed = 3-day streak
// ❌ Mon: completed, Tue: missed, Wed: completed = 1-day streak (reset)
```

---

## 🔥 Streak Calculation Logic

```javascript
// Streak continues through:
✅ Completed days (extends)
✅ Skipped days (maintains)

// Streak breaks on:
❌ Missed days (no entry in completionHistory)

// Example:
Day 1: completed → streak = 1
Day 2: skipped   → streak = 2 (maintains!)
Day 3: completed → streak = 3
Day 4: (missed)  → streak = 0 (reset)
Day 5: completed → streak = 1 (restart)
```

---

## 💭 Reflection System

### When Required:
- **Before every completion**
- Modal appears automatically
- Cannot complete without reflection

### Validation:
```javascript
if (reflection.trim().length < 5) {
    return error('Minimum 5 characters required');
}
```

### Storage:
```javascript
completionHistory: [{
    date: Date,
    status: 'completed',
    duration: Number,
    reflection: String,  // ← Stored here
    honestyStatus: String
}]
```

---

## 🌙 End-of-Day Honesty Review

### Trigger Conditions:
```javascript
1. Time check: hour >= 21 (after 9 PM)
2. Once per day: localStorage.lastHonestyCheck !== today
3. Has completions: completedToday.length > 0
```

### User Options & Effects:

| Option | Effect | Streak | Status |
|--------|--------|--------|--------|
| ✅ **Yes** | No change | ✅ Maintained | completed |
| ⚠️ **Partially** | Changed | ✅ Maintained | partially |
| ❌ **Not really** | Removed | ✅ **Maintained** | incomplete |

### Key Feature: No Punishment
```javascript
if (honestyStatus === 'not-really') {
    entry.status = 'incomplete';  // Remove completion
    // ✅ Streak PRESERVED - honesty rewarded, not punished
}
```

---

## 📊 Weekly Progress View

### 7-Day Array Structure:
```javascript
[
    { date: Date, dayName: 'Mon', status: 'completed', isToday: false },
    { date: Date, dayName: 'Tue', status: 'skipped',   isToday: false },
    { date: Date, dayName: 'Wed', status: 'not-done',  isToday: true },
    { date: Date, dayName: 'Thu', status: 'not-done',  isToday: false },
    { date: Date, dayName: 'Fri', status: 'not-done',  isToday: false },
    { date: Date, dayName: 'Sat', status: 'not-done',  isToday: false },
    { date: Date, dayName: 'Sun', status: 'not-done',  isToday: false }
]
```

### Active Days Calculation:
```javascript
activeDays = completed + skipped
// Example: 4 completed + 1 skipped = 5 active days
```

---

## 🏆 Badge System

### Milestones:
```javascript
const badges = [
    { level: 1, name: 'Week Warrior',    icon: '🥉', days: 7   },
    { level: 2, name: 'Habit Former',    icon: '🥈', days: 21  },
    { level: 3, name: 'Month Master',    icon: '🏅', days: 30  },
    { level: 4, name: 'Halfway Hero',    icon: '🎖️', days: 50  },
    { level: 5, name: 'Century Champion', icon: '🏆', days: 100 }
];
```

### Usage:
```javascript
const badges = habit.getBadges();         // All badges with unlock status
const highest = habit.getHighestBadge();  // Highest unlocked only
```

---

## 🛡️ Pattern Detection (Soft Accountability)

### Patterns Detected:
```javascript
// 1. Fast completion
if (!startedAt && duration < 60) {
    patternWarnings.push('completed very quickly');
}

// 2. Instant completion (no timer)
if (!startedAt && status === 'idle') {
    patternWarnings.push('completed without timer');
}

// 3. All habits at same timestamp
// (Detected via timestamp comparison across habits)
```

### Response Strategy:
```javascript
// ✅ Gentle nudge (never blocks):
message += '\n\n💡 Reminder: Taking time to be present with your habit makes it more meaningful. Keep up the great work!';

// ❌ Never blocks completion
// ❌ Never penalizes streak
// ❌ Never shames user
```

---

## 🎯 Optional Accountability Mode

### Per-Habit Setting:
```javascript
{
    accountabilityMode: Boolean  // Default: false
}
```

### When Enabled:
- Requires extra proof before completion
- Options:
  - Image upload OR
  - Detailed reflection (enforced)

### User Control:
- Toggle in habit creation form
- Can enable/disable anytime
- Not global - per habit basis

---

## 🔄 API Endpoints

### Habit Management:
```
GET    /api/habits                    # Get all active habits
POST   /api/habits                    # Create new habit
PUT    /api/habits/:id                # Update habit
DELETE /api/habits/:id                # Delete habit
GET    /api/habits/:id                # Get single habit
```

### Habit Actions:
```
POST   /api/habits/:id/start          # Start timer
POST   /api/habits/:id/pause          # Pause timer
POST   /api/habits/:id/complete       # Mark completed (requires reflection)
POST   /api/habits/:id/uncomplete     # Undo completion
POST   /api/habits/:id/skip           # Mark as skipped (validates rules)
```

### Analytics:
```
GET    /api/habits/analytics/daily    # Daily stats
GET    /api/habits/analytics/weekly   # Weekly progress
```

### Accountability:
```
POST   /api/habits/honesty-review     # Submit end-of-day review
```

---

## 📦 Request/Response Examples

### Create Habit:
```javascript
POST /api/habits
{
    "name": "Morning Meditation",
    "description": "10 minutes mindfulness",
    "category": "wellness",
    "minimumDuration": 10,
    "accountabilityMode": true,
    "daysPerWeek": 7,
    "skipDays": []
}

Response:
{
    "success": true,
    "message": "Habit created successfully!",
    "habit": { _id, name, streak, ... }
}
```

### Complete Habit:
```javascript
POST /api/habits/:id/complete
{
    "duration": 612,  // seconds
    "reflection": "Felt very focused today, practiced breathing exercises"
}

Response:
{
    "success": true,
    "message": "Great job! Your streak is now 15 days! 🔥",
    "data": { ...habit },
    "patternFlags": []  // Empty if no patterns detected
}
```

### Skip Habit:
```javascript
POST /api/habits/:id/skip
{
    "date": "2025-12-26"  // Optional, defaults to today
}

Response:
{
    "success": true,
    "message": "Day marked as skipped",
    "data": { ...habit }
}

Error (if rule violated):
{
    "success": false,
    "message": "Maximum 1 skip per week allowed"
}
```

### Honesty Review:
```javascript
POST /api/habits/honesty-review
{
    "reviews": [
        { "habitId": "abc123", "honestyStatus": "yes" },
        { "habitId": "def456", "honestyStatus": "partially" },
        { "habitId": "ghi789", "honestyStatus": "not-really" }
    ]
}

Response:
{
    "success": true,
    "message": "Thank you for your honesty! 🙏",
    "results": [ ... ]
}
```

---

## 🗃️ Database Schema

### Habit Document:
```javascript
{
    _id: ObjectId,
    userId: ObjectId,                    // Owner
    name: String,                        // Required
    description: String,                 // Optional
    category: String,                    // Default: 'general'
    
    // Session tracking
    status: 'idle'|'in-progress'|'completed',
    startedAt: Date,
    completedAt: Date,
    pausedDuration: Number,              // Seconds
    
    // Configuration
    minimumDuration: Number,             // Minutes, optional
    daysPerWeek: Number,                 // 1-7, default 7
    skipDays: [String],                  // ['monday', 'wednesday']
    accountabilityMode: Boolean,         // Default: false
    
    // Tracking
    streak: Number,                      // Current streak
    lastCompleted: Date,                 // Last activity
    lastHonestyCheck: Date,              // Last review
    
    // History (source of truth)
    completionHistory: [{
        date: Date,
        status: 'completed'|'skipped'|'incomplete',
        duration: Number,
        reflection: String,
        honestyStatus: 'yes'|'partially'|'not-really'|null
    }],
    
    // Metadata
    isActive: Boolean,                   // Default: true
    createdAt: Date,                     // Auto
    updatedAt: Date                      // Auto
}
```

---

## 🎨 UI Language Guidelines

### ✅ DO Use:
- "Great job!"
- "Keep up the great work!"
- "Thank you for your honesty!"
- "💡 Reminder: Taking time makes it meaningful"
- "Your streak is now X days! 🔥"

### ❌ DON'T Use:
- "You failed"
- "You should have..."
- "Shame on you"
- "You're not trying hard enough"
- Any guilt-inducing language

### Principle:
**Encourage growth, never punish honesty.**

---

## 🔧 Common Operations

### Get Today's Status:
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const todayEntry = habit.completionHistory.find(entry => {
    const d = new Date(entry.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
});

const status = todayEntry ? todayEntry.status : 'not-done';
```

### Check if Can Skip:
```javascript
// 1. Check weekly limit
const weekSkips = habit.getWeeklyStatus().filter(d => d.status === 'skipped');
if (weekSkips.length >= 1) return false;

// 2. Check consecutive days
const yesterday = todayEntry.status === 'skipped';
if (yesterday) return false;

// 3. All checks passed
return true;
```

### Calculate Active Days:
```javascript
const weekStatus = habit.getWeeklyStatus();
const completed = weekStatus.filter(d => d.status === 'completed').length;
const skipped = weekStatus.filter(d => d.status === 'skipped').length;
const activeDays = completed + skipped;
```

---

## 🚨 Error Handling

### Common Errors:
```javascript
// Already completed
"Habit already completed today"

// Skip rule violations
"Maximum 1 skip per week allowed"
"Cannot skip consecutive days"

// Duration not met
"Please continue for X more minutes"

// Missing reflection
"Please provide a meaningful reflection (at least 5 characters)"
```

### Error Response Format:
```javascript
{
    "success": false,
    "message": "Human-readable error message"
}
```

---

## 📱 Frontend Functions

### Key Functions:
```javascript
// Habit Management
loadHabits()                         // Load from API
displayHabits()                      // Render to DOM
addHabit(e)                          // Create new habit

// Habit Actions
startHabit(habitId)                  // Start timer
pauseHabit(habitId)                  // Pause timer
completeHabitWithTime(habitId)       // Show reflection modal
submitHabitCompletion(id, dur, ref)  // Send to API
skipDay(habitId)                     // Skip today
uncompleteHabit(habitId)             // Undo completion

// Modals
showReflectionModal(id, duration)    // Before completion
showHonestyCheckModal(habits)        // After 9 PM
closeReflectionModal()               // Close modal

// Reviews
checkForHonestyReview()              // Check if should show
submitHonestyReview()                // Send reviews to API

// Analytics
loadAnalytics()                      // Load charts
loadWeeklyProgress()                 // Load weekly view
updateQuickStats()                   // Update stat cards
```

---

## 🎯 Testing Scenarios

### Test Streak Logic:
```
Day 1: Complete habit → streak = 1
Day 2: Complete habit → streak = 2
Day 3: Skip habit    → streak = 3 ✅ (maintains!)
Day 4: Complete habit → streak = 4
Day 5: (miss)        → streak = 0 ❌ (breaks!)
Day 6: Complete habit → streak = 1 (restart)
```

### Test Skip Rules:
```
Week 1, Mon: Skip → ✅ Allowed (first skip)
Week 1, Tue: Skip → ❌ Blocked (consecutive)
Week 1, Wed: Skip → ❌ Blocked (max 1/week)
Week 2, Mon: Skip → ✅ Allowed (new week)
```

### Test Honesty Review:
```
Complete 3 habits today
Wait until after 9 PM
Modal appears with 3 habits
Select "Not really" for habit 1
→ Habit 1: completion removed, streak maintained ✅
→ Other habits: unchanged
```

---

**Quick Reference Complete ✅**
**For detailed implementation, see:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
