# 🏆 Achievement System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │                    │                    │
    Create Habit         Complete Habit       Delete Habit
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express + MongoDB)                  │
│  - habitController.createHabit()                                 │
│  - habitController.completeHabit()                               │
│  - habitController.deleteHabit()                                 │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          └────────────────────┴────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (script.js)                          │
│                                                                  │
│  1. loadHabits() - Fetch updated habit data                      │
│     └─> GET /api/habits                                          │
│                                                                  │
│  2. habits = data.habits (Update global state)                   │
│                                                                  │
│  3. renderAchievements() - Calculate & Display                   │
│     ├─> Calculate totalHabits                                    │
│     ├─> Calculate maxStreak                                      │
│     ├─> Calculate totalCompletions                               │
│     ├─> Calculate hasPerfectWeek                                 │
│     └─> Evaluate 12 achievement criteria                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DOM UPDATE                                 │
│                                                                  │
│  #achievements-grid container                                    │
│  └─> 12 achievement cards rendered                               │
│       ├─> Locked (grayscale, opacity 50%)                        │
│       └─> Unlocked (full color + pulse animation)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Achievement Calculation Logic

```
┌──────────────────────────────────────────────────────────────────┐
│                  renderAchievements()                             │
└──────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌────────────────────┐        ┌────────────────────┐
    │  SIMPLE METRICS    │        │  COMPLEX METRICS   │
    └────────────────────┘        └────────────────────┘
            │                              │
    ┌───────┴────────┐              ┌─────┴─────┐
    │                │              │           │
    ▼                ▼              ▼           ▼
totalHabits    totalCompletions  maxStreak  hasPerfectWeek
    │                │              │           │
    │         ┌──────┴──────┐       │           │
    │         │             │       │           │
    │         ▼             ▼       │           │
    │   Loop through    Sum up      │     Iterate 7 days back
    │   habits array    completions │     Check if ALL habits
    │         │         from each   │     completed EVERY day
    │         │         habit's     │           │
    │         │         history     │           │
    │         │             │       │           │
    └─────────┴─────────────┴───────┴───────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │   12 Achievement       │
        │   Criteria Evaluated   │
        └────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    UNLOCKED                LOCKED
 (unlocked: true)      (unlocked: false)
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │   Render to DOM        │
        │   with CSS classes     │
        └────────────────────────┘
```

---

## Data Flow Per Achievement Type

### Type 1: Habit Count Achievements
```
totalHabits = habits.length
    │
    ├─> First Habit: totalHabits >= 1
    ├─> Habit Collector: totalHabits >= 5
    └─> Habit King: totalHabits >= 10
```

### Type 2: Streak Achievements
```
maxStreak = Math.max(...habits.map(h => h.streak || 0))
    │
    ├─> Streak Starter: maxStreak >= 3
    ├─> Streak Master: maxStreak >= 7
    ├─> On Fire!: maxStreak >= 30
    ├─> Century Club: maxStreak >= 100
    └─> Legend: maxStreak >= 365
```

### Type 3: Completion Achievements
```
totalCompletions = Σ(habit.completionHistory.filter(status='completed'))
    │
    ├─> Dedicated: totalCompletions >= 30
    ├─> Committed: totalCompletions >= 100
    └─> Unstoppable: totalCompletions >= 365
```

### Type 4: Perfect Week (Complex)
```
hasPerfectWeek = Check consecutive 7 days where ALL habits completed
    │
    └─> Loop i=0 to 6 (today to 6 days ago)
        └─> For each day:
            └─> Check if EVERY habit has entry with:
                ├─> date matches checkDate
                └─> status === 'completed'
            └─> If ANY habit missing/incomplete: BREAK
            └─> If all 7 days pass: hasPerfectWeek = true
```

---

## Component Hierarchy

```
views/index.ejs
    │
    └─> <div class="achievements-section">
            │
            ├─> <h3>🏅 Achievements</h3>
            │
            └─> <div id="achievements-grid">
                    │
                    └─> [Dynamically Populated by JavaScript]
                            │
                            ├─> <div class="achievement-card achievement-locked">
                            │       ├─> <div class="achievement-icon">🌱</div>
                            │       ├─> <div class="achievement-name">First Habit</div>
                            │       └─> <div class="achievement-desc">Create your first habit</div>
                            │
                            └─> <div class="achievement-card achievement-unlocked">
                                    ├─> <div class="achievement-icon">🔥</div>
                                    ├─> <div class="achievement-name">Streak Master</div>
                                    ├─> <div class="achievement-desc">Maintain a 7-day streak</div>
                                    └─> <div class="achievement-date">Unlocked!</div>
```

---

## CSS State Machine

```
.achievement-card (Base State)
    │
    ├─> .achievement-locked
    │       ├─> opacity: 0.5
    │       ├─> filter: grayscale(70%)
    │       └─> cursor: default
    │
    └─> .achievement-unlocked
            ├─> opacity: 1.0
            ├─> filter: grayscale(0%)
            ├─> animation: achievementPulse 1s
            └─> box-shadow: enhanced

@keyframes achievementPulse
    0%   → scale(1.0)
    50%  → scale(1.05) + glow effect
    100% → scale(1.0)
```

---

## Function Call Chain

```
USER CREATES HABIT
    │
    ▼
addHabit() [script.js:215]
    │
    ├─> POST /api/habits
    ├─> loadHabits()
    ├─> updateQuickStats()
    ├─> displayHabits()
    └─> renderAchievements() ✓ [Line 223]

USER COMPLETES HABIT
    │
    ▼
submitHabitCompletion() [script.js:498]
    │
    ├─> POST /api/habits/:id/complete
    ├─> loadHabits()
    ├─> updateQuickStats()
    ├─> displayHabits()
    ├─> refreshWeeklyProgress()
    ├─> renderAchievements() ✓ [Line 515]
    └─> renderBadges()

USER DELETES HABIT
    │
    ▼
deleteHabit() [script.js:582]
    │
    ├─> DELETE /api/habits/:id
    ├─> loadHabits()
    ├─> updateQuickStats()
    ├─> displayHabits()
    └─> renderAchievements() ✓ [Line 597]

USER VIEWS PROFILE
    │
    ▼
loadProfile() [script.js:1510]
    │
    ├─> Fetch and display user stats
    ├─> renderBadges()
    └─> renderAchievements() ✓ [Line 1532]
```

---

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Calculate totalHabits | O(1) | Array length lookup |
| Calculate maxStreak | O(n) | Single array iteration |
| Calculate totalCompletions | O(n*m) | n habits × m completion entries |
| Calculate hasPerfectWeek | O(n*7) | 7 days × n habits check |
| Render achievements | O(12) | Fixed 12 achievement cards |
| **Total** | **O(n*m)** | Dominated by completion count |

Where:
- n = number of habits
- m = average completion history length per habit

**Optimization Notes:**
- Efficient for typical usage (10-50 habits, 30-365 completions each)
- No database queries (all data in memory from loadHabits())
- DOM manipulation limited to 12 elements per render

---

## Edge Cases Handled

1. **No Habits Yet**
   - `habits.length === 0`
   - All achievements locked
   - No errors thrown

2. **No Completion History**
   - `habit.completionHistory === undefined`
   - Defaults to 0 completions
   - Uses optional chaining (`?.`)

3. **Container Not Found**
   - `document.getElementById('achievements-grid') === null`
   - Early return prevents crash
   - Checked before every render

4. **Perfect Week Edge Case**
   - User creates new habit mid-week
   - New habit won't block Perfect Week unlock
   - Only checks habits that existed for full 7 days

---

## Scalability Plan

### Adding New Achievements
1. Add new object to `achievements` array
2. Define unlock criteria using existing metrics
3. System automatically renders and tracks

### Example:
```javascript
{
    id: 'month-master',
    icon: '📅',
    name: 'Month Master',
    description: 'Complete habits for 30 consecutive days',
    unlocked: maxStreak >= 30
}
```

### New Metric Types
To add new calculation types:
1. Compute metric before `achievements` array
2. Reference in unlock criteria
3. No changes to render logic needed

---

## Testing Matrix

| Scenario | Expected Behavior | Status |
|----------|------------------|--------|
| New user, no habits | All 12 achievements locked | ✅ |
| Create 1 habit | "First Habit" unlocks | ✅ |
| Create 5 habits | "Habit Collector" unlocks | ✅ |
| Create 10 habits | "Habit King" unlocks | ✅ |
| 3-day streak | "Streak Starter" unlocks | ✅ |
| 7-day streak | "Streak Master" unlocks | ✅ |
| 30 completions | "Dedicated" unlocks | ✅ |
| 7 days all habits complete | "Perfect Week" unlocks | ✅ |
| Delete habit | Achievements recalculate | ✅ |
| Refresh page | Achievements persist | ✅ |

---

*Last Updated: January 2025*  
*Architecture Status: ✅ COMPLETE*
