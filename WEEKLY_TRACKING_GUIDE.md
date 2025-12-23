# 📅 Weekly Tracking Feature Guide

## Overview

The Habit Tracker now features a **weekly calendar view** that shows 7 days (Monday–Sunday) for each habit with enhanced tracking capabilities.

---

## 🎯 New Features

### 1. **Weekly Calendar View**
- Each habit displays 7 days (Mon–Sun) in a visual grid
- Current week shown by default
- Days are color-coded based on status

### 2. **Multiple Day States**
- ✅ **Completed** - Green background, checkmark
- ⊘ **Skipped** - Yellow/amber background, skip symbol
- ⬜ **Not Done** - Gray background, empty
- 📅 **Today** - Blue border, highlighted
- 🔒 **Future** - Dimmed, not clickable

### 3. **Skip Logic & Rules**
- ✅ **Maximum 1 skip per week** (Mon-Sun period)
- ❌ **Cannot skip 2 consecutive days**
- ℹ️ Skips break your streak (restart at 1)

---

## 🎨 Visual Design

### Calendar Grid
```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │
│  18 │  19 │  20 │  21 │  22 │  23 │  24 │
│  ✓  │  ✓  │  ⊘  │  ✓  │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
Green  Green Yellow Green Gray  Blue  Gray
                              (Today)
```

### Color Coding
- **Green gradient** - Completed day
- **Yellow gradient** - Skipped day
- **Light gray** - Not yet done
- **Blue border (3px)** - Today
- **Faded** - Future days (not interactive)

---

## 🖱️ How to Use

### Marking Days

#### **Click a Day** to open options:

**If Not Done:**
- Click OK → Mark as Complete ✓
- Click Cancel → Skip Day ⊘

**If Completed:**
- Confirms → Remove completion

**If Skipped:**
- Click OK → Mark as Complete ✓
- Click Cancel → Remove skip

### Interactive Actions

```javascript
// Each day is clickable (except future days)
Click → Dialog → Choose action → Updates immediately
```

---

## 🔒 Skip Validation Rules

### Rule 1: One Skip Per Week
```
Week: Mon Tue Wed Thu Fri Sat Sun
      ✓   ✓   ⊘   ✓   ?   ?   ?

✅ Can skip: Fri, Sat, or Sun
❌ Cannot skip: Already used 1 skip (Wed)
```

### Rule 2: No Consecutive Skips
```
Week: Mon Tue Wed Thu Fri Sat Sun
      ✓   ⊘   ?   ✓   ✓   ✓   ✓

❌ Cannot skip Wed (consecutive to Tue)
✅ Can skip Thu or later (not consecutive)
```

### Error Messages
- "You can only skip 1 day per week"
- "Cannot skip two consecutive days"
- "Day already has a status. Remove it first to skip."

---

## 📊 Streak Behavior

### Streaks with Completion
```
Mon Tue Wed Thu Fri → Streak = 5 days
 ✓   ✓   ✓   ✓   ✓
```

### Streaks with Skip
```
Mon Tue Wed Thu Fri → Streak = 2 days (Thu-Fri)
 ✓   ✓   ⊘   ✓   ✓
         ↑
    Skip breaks streak
```

### Skips Reset Streaks
- Completing after a skip starts new streak
- Skips are intentional breaks
- Maintains history for accountability

---

## 🔧 Technical Implementation

### Data Structure
```javascript
completionHistory: [
  {
    date: ISODate("2025-12-18"),
    status: "completed"  // ✓
  },
  {
    date: ISODate("2025-12-19"),
    status: "completed"  // ✓
  },
  {
    date: ISODate("2025-12-20"),
    status: "skipped"    // ⊘
  }
]
```

### Status Values
- `completed` - Habit done for the day
- `skipped` - Intentionally skipped
- `not-done` - No entry (default state)

---

## 🌐 API Endpoints

### Get Weekly Status
```http
GET /api/habits/:id/weekly
Response: {
  success: true,
  data: {
    habit: { _id, name, streak },
    week: [
      { date, dayName, status, isToday, isFuture },
      ...7 days
    ]
  }
}
```

### Mark Day
```http
PUT /api/habits/:id/day
Body: { date: "2025-12-23", status: "completed" | "skipped" }
```

### Skip Day
```http
POST /api/habits/:id/skip
Body: { date: "2025-12-23" }
```

---

## 🎮 User Flow Examples

### Example 1: Complete Monday
```
1. User clicks Monday box
2. Dialog: "What would you like to do?"
3. User clicks OK
4. Status: completed ✓
5. Green background appears
6. Streak updates
```

### Example 2: Skip Wednesday (Valid)
```
Week: Mon✓ Tue✓ Wed? Thu... Fri... Sat... Sun...

1. User clicks Wednesday
2. Dialog appears
3. User clicks Cancel (skip)
4. Status: skipped ⊘
5. Yellow background appears
6. Streak resets to 0 or next completion
```

### Example 3: Try Skip Thursday (Invalid - Consecutive)
```
Week: Mon✓ Tue✓ Wed⊘ Thu? Fri... Sat... Sun...

1. User clicks Thursday
2. Clicks Cancel to skip
3. ❌ Error: "Cannot skip two consecutive days"
4. Thursday remains not-done
```

### Example 4: Try Second Skip (Invalid - Weekly Limit)
```
Week: Mon✓ Tue✓ Wed⊘ Thu✓ Fri? Sat... Sun...

1. User clicks Friday
2. Clicks Cancel to skip
3. ❌ Error: "You can only skip 1 day per week"
4. Friday remains not-done
```

---

## 📱 Mobile Responsive

- Calendar grid adapts to screen size
- 7 columns maintained on mobile
- Smaller padding and fonts
- Touch-friendly tap targets
- Scrollable if needed

---

## 🎯 Benefits

### For Users
- ✅ Visual weekly progress at a glance
- ✅ Flexibility with 1 skip per week
- ✅ Accountability (skips tracked)
- ✅ No punishment for legitimate breaks
- ✅ Prevents gaming the system (no consecutive skips)

### For Habits
- ✅ Realistic tracking (life happens)
- ✅ Maintains streak integrity
- ✅ Encourages consistency
- ✅ Clear visual feedback
- ✅ Historical accuracy

---

## 🧪 Testing the Feature

### Test 1: Complete a Week
```
1. Create a habit
2. Click each day Mon-Sun
3. Mark all as complete
4. Check: 7 green boxes, streak = 7
```

### Test 2: Use One Skip
```
1. Create a habit
2. Complete Mon, Tue
3. Skip Wed (yellow)
4. Complete Thu, Fri
5. Check: 1 skip used, streak = 2
```

### Test 3: Try Consecutive Skips
```
1. Skip Monday
2. Try to skip Tuesday
3. Check: Error message appears
4. Tuesday remains not-done
```

### Test 4: Try Second Skip
```
1. Skip Monday
2. Try to skip Friday
3. Check: Error message appears
4. Can only skip once per week
```

### Test 5: Page Reload
```
1. Mark several days
2. Refresh page (F5)
3. Check: All statuses persist
4. Week view shows correct states
```

---

## 💡 Tips & Best Practices

### For Users
- ✅ Use skips wisely (only when necessary)
- ✅ Plan rest days on specific days
- ✅ Don't skip consecutively
- ✅ Complete today before tomorrow arrives
- ✅ Review weekly progress regularly

### For Developers
- ✅ Validate skip rules on backend
- ✅ Show clear error messages
- ✅ Make days interactive and obvious
- ✅ Use color coding consistently
- ✅ Test edge cases thoroughly

---

## 🔮 Future Enhancements

Potential additions:
- [ ] View previous weeks
- [ ] Week navigation (prev/next)
- [ ] Monthly calendar view
- [ ] Custom skip rules per habit
- [ ] Analytics on skip patterns
- [ ] Export weekly reports
- [ ] Habit notes per day
- [ ] Team/shared habits

---

## 🆘 Troubleshooting

### Days not clickable?
- Check if they're future days (dimmed)
- Refresh page to reload

### Skip not working?
- Check if already used 1 skip this week
- Check if adjacent day is also skipped
- Check console for error messages

### Week not showing?
- Check MongoDB connection
- Check habit ID is valid
- Open browser console for errors

### Styles look wrong?
- Clear browser cache (Ctrl+Shift+R)
- Check CSS file loaded
- Check for CSS conflicts

---

## 📞 Need Help?

Check the browser console (F12) for:
- Network requests to `/api/habits/:id/weekly`
- Error messages from API
- JavaScript errors

Common fixes:
1. Refresh the page
2. Clear browser cache
3. Check MongoDB is running
4. Check server logs

---

## 🎉 Summary

The weekly tracking feature provides:
- 📅 **Visual weekly calendar** (Mon-Sun)
- ✅ **Multiple states** (completed, skipped, not-done)
- 🎯 **Smart rules** (1 skip/week, no consecutive)
- 🎨 **Color coding** (green/yellow/gray)
- 💾 **Full persistence** (MongoDB)
- 📱 **Mobile responsive**

**Happy habit tracking with weekly views!** 🚀
