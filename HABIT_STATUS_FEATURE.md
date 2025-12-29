# Habit Status & Duration Tracking Feature

## Overview
This document describes the new status tracking and duration features added to the habit tracker application, including backward compatibility measures.

## New Data Model Fields

The Habit model has been updated with four new fields:

### 1. `startedAt` (Date)
- **Type:** Date (timestamp)
- **Default:** `null`
- **Description:** Records when the user started working on the habit today
- **Usage:** Set when status changes to 'in-progress'

### 2. `completedAt` (Date)
- **Type:** Date (timestamp)
- **Default:** `null`
- **Description:** Records the exact time when the habit was completed
- **Usage:** Set when status changes to 'completed'

### 3. `minimumDuration` (Number)
- **Type:** Number (minutes)
- **Default:** `null`
- **Description:** Optional minimum time requirement for the habit
- **Usage:** For time-based habits like "Exercise for 30 minutes"
- **Validation:** Must be >= 0 if set

### 4. `status` (String)
- **Type:** String (enum)
- **Default:** `'idle'`
- **Allowed Values:**
  - `'idle'` - Not started today (default state)
  - `'in-progress'` - Currently working on the habit
  - `'completed'` - Finished for the day
- **Auto-reset:** Automatically resets to 'idle' at the start of a new day

## Model Methods

### New Methods

#### `startHabit()`
Starts working on a habit by setting status to 'in-progress' and recording startedAt timestamp.

```javascript
await habit.startHabit();
```

**Returns:** Promise that resolves when saved to database

**Throws:** Error if habit already completed today

#### `meetsMinimumDuration()`
Checks if the elapsed time meets the minimum duration requirement.

```javascript
const meets = habit.meetsMinimumDuration();
```

**Returns:** `true` if no duration requirement or time met, `false` otherwise

#### `getElapsedTime()`
Calculates elapsed time since starting the habit.

```javascript
const minutes = habit.getElapsedTime();
```

**Returns:** Number of elapsed minutes (0 if not started)

### Updated Methods

#### `complete()`
Now also sets `completedAt` timestamp and updates status to 'completed'.

```javascript
await habit.complete();
```

#### `uncompleteToday()`
Now also resets status fields (status, startedAt, completedAt) when uncompleting.

```javascript
await habit.uncompleteToday();
```

## Backend API

### New Endpoint

**POST** `/api/habits/:id/start`

Starts a habit (sets status to in-progress).

**Response:**
```json
{
  "success": true,
  "message": "Timer started! Good luck! ⏱️",
  "data": { /* habit object */ }
}
```

### Existing Endpoints (Enhanced)

**POST** `/api/habits/:id/complete`
- Now also sets `completedAt` and `status` fields

**POST** `/api/habits/:id/uncomplete`
- Now also resets status fields

## Frontend Changes

### New Form Field

Added optional "Minimum Duration" field to habit creation form:
- Input type: number
- Unit: minutes
- Range: 1-1440 minutes (24 hours max)
- Located below skip days selection

### New Utility Functions

#### `getStatusDisplay(habit)`
Returns formatted status text with emoji.

#### `formatElapsedTime(habit)`
Formats elapsed time as "X min" or "Xh Ym".

#### `meetsMinimumDuration(habit)`
Client-side check for duration requirement.

#### `getDurationProgress(habit)`
Calculates percentage progress toward minimum duration.

#### `startHabit(habitId)`
API call to start a habit.

### Updated Display

Habit cards now show:
- Status badge (⚪ Not Started / 🟡 In Progress / ✅ Completed)
- Elapsed time (if started)
- Duration requirement (if set)

Example:
```
🏃 Exercise
health | Daily
⚪ Not Started  ⏱️ 30 min required
```

## Backward Compatibility

### Database Level
- All new fields have default values (`null` for timestamps, `'idle'` for status)
- Existing habits will automatically receive these defaults
- No migration script needed

### Model Methods
- All new methods check for field existence before using them
- `meetsMinimumDuration()` returns `true` if no duration set
- `getElapsedTime()` returns `0` if not started
- `getStatusDisplay()` defaults to 'idle' if status missing

### Frontend Display
- Status badges show default state for old habits
- Duration info only appears if `minimumDuration` is set
- Elapsed time only shows if `startedAt` exists

### Pre-save Hook
- Automatically resets status fields for new day
- Only runs if fields exist (won't break old habits)
- Checks if last completion was yesterday

## Usage Examples

### Creating a Time-Based Habit

```javascript
const habit = new Habit({
  userId: user._id,
  name: "Meditation",
  category: "mindfulness",
  minimumDuration: 15, // 15 minutes required
  daysPerWeek: 7
});
await habit.save();
```

### Starting and Completing a Habit

```javascript
// Start the habit
await habit.startHabit();
// status: 'in-progress'
// startedAt: current timestamp

// Later, after minimum duration...
if (habit.meetsMinimumDuration()) {
  await habit.complete();
  // status: 'completed'
  // completedAt: current timestamp
}
```

### Frontend Usage

```javascript
// Display status
const statusText = getStatusDisplay(habit);
console.log(statusText); // "🟡 In Progress"

// Show elapsed time
const elapsed = formatElapsedTime(habit);
console.log(elapsed); // "12 min"

// Check progress
const progress = getDurationProgress(habit);
console.log(progress); // 80 (80% of required time)
```

## CSS Classes

New CSS classes added:
- `.habit-status-line` - Container for status badges
- `.status-badge` - Status indicator badge
- `.elapsed-time` - Elapsed time display
- `.duration-info` - Duration requirement display

## Testing Recommendations

1. **Create new habit with duration**: Verify duration field saves correctly
2. **Create new habit without duration**: Verify optional field works
3. **Load existing habits**: Verify old habits display correctly
4. **Start a habit**: Verify status changes and timer starts
5. **Complete a habit**: Verify all fields update properly
6. **Check next day**: Verify status resets to 'idle'
7. **Uncomplete habit**: Verify status fields reset

## Future Enhancements

Potential improvements:
1. Visual timer/progress bar for duration-based habits
2. Notifications when minimum duration reached
3. Pause/resume functionality for in-progress habits
4. Daily statistics on average completion times
5. Streak multipliers for consistently meeting duration goals

## Migration Notes

No database migration required. The schema changes are additive with sensible defaults, ensuring full backward compatibility with existing habit data.

All existing habits will:
- Have `status` = `'idle'`
- Have `startedAt` = `null`
- Have `completedAt` = `null`
- Have `minimumDuration` = `null`
- Continue to function exactly as before
