# 🎨 Skip Today - Visual Reference Guide

## UI Components

### 1. Habit Card - Idle State (Not Started Today)

```
┌─────────────────────────────────────────────────┐
│  📝 Exercise                           🔥 5      │
│  30 minutes of cardio                            │
│                                                  │
│  [Start]  [Skip Today]                      [×] │
└─────────────────────────────────────────────────┘
```

**Buttons Available:**
- **Start** - Begin tracking time
- **Skip Today** - Mark as skipped (maintains streak)
- **×** - Delete habit

---

### 2. Habit Card - Skipped State

```
┌─|───────────────────────────────────────────────┐
│ │ 📝 Exercise                          🔥 5      │
│ │ 30 minutes of cardio                           │
│ │                                                │
│ │ ⏸️ Skipped                                     │
│ │                                                │
│ │ [Undo Skip]                                [×] │
└─|───────────────────────────────────────────────┘
  ↑ Gray left border
```

**Visual Indicators:**
- Gray left border (`#94a3b8`)
- "⏸️ Skipped" status badge (gray background)
- Light gray card tint

**Buttons Available:**
- **Undo Skip** - Remove skip entry
- **×** - Delete habit

---

### 3. Habit Card - Completed State

```
┌─|───────────────────────────────────────────────┐
│ │ 📝 Exercise                          🔥 6      │
│ │ 30 minutes of cardio                           │
│ │                                                │
│ │ ✅ Completed                                   │
│ │ ⏱️ 28m 45s                                     │
│ │                                                │
│ │ [Undo]                                     [×] │
└─|───────────────────────────────────────────────┘
  ↑ Green left border
```

**Visual Indicators:**
- Green left border (`#22c55e`)
- "✅ Completed" status badge (green background)
- Duration display
- Light green card tint

---

## Weekly Progress View

### Visual Graph (7 Days)

```
┌────────────────────────────────────────────────────────────┐
│  📝 Exercise                           🔥 6 day streak      │
│                                                             │
│  Completion Rate: 71%                                       │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░                │
│                                                             │
│  ┌───┬───┬───┬───┬───┬───┬───┐                            │
│  │Sun│Mon│Tue│Wed│Thu│Fri│Sat│                            │
│  │12/│12/│12/│12/│12/│12/│12/│                            │
│  │22 │23 │24 │25 │26 │27 │28 │                            │
│  │ ● │ ● │ ● │ ● │ ● │ ● │   │                            │
│  │   │   │   │   │   │Today  │                            │
│  └───┴───┴───┴───┴───┴───┴───┘                            │
│   ✓   ✓   ✗   ✓   ⏸   ✓   -                              │
│                                                             │
│  ● Completed   ● Skipped   ○ Rest Day   ● Missed          │
│                                                             │
│  🔥 6 day streak                                            │
│  5 of 7 active days (completed + skipped)                  │
└────────────────────────────────────────────────────────────┘

Legend:
  ● = Green (#22c55e) - Completed
  ● = Gray (#94a3b8) - Skipped
  ○ = Light gray (#9ca3af) - Rest Day
  ● = Red (#ef4444) - Missed
```

**Day Breakdown:**
- **Sun**: ✓ Completed (green)
- **Mon**: ✓ Completed (green)
- **Tue**: ✗ Missed (red)
- **Wed**: ✓ Completed (green)
- **Thu**: ⏸ Skipped (gray)
- **Fri**: ✓ Completed (green)
- **Sat**: - Not done yet (empty)

**Metrics:**
- Completed: 4 days
- Skipped: 1 day
- Missed: 1 day
- Active days: 5 (4+1)
- Completion rate: 57% (4/7)
- Streak: 6 (continues through skip)

---

## Analytics Dashboard

### Daily Completion Chart

```
        ┌─────────────────────┐
        │  Today's Progress   │
        ├─────────────────────┤
        │                     │
        │      ╱────╲         │
        │    ╱   3   ╲        │  Green (Completed): 3
        │   │         │       │  Gray (Skipped): 2
        │   │    2    │       │  Red (Not Done): 2
        │    ╲   2   ╱        │
        │      ╲────╱         │  Total: 7 habits
        │                     │  Active: 5 (71%)
        └─────────────────────┘
```

### Status Cards

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  ✅ Completed    │  │  ⏸️ Skipped      │  │  ❌ Not Done     │
│                  │  │                  │  │                  │
│       3          │  │       2          │  │       2          │
│                  │  │                  │  │                  │
│      43%         │  │      29%         │  │      29%         │
└──────────────────┘  └──────────────────┘  └──────────────────┘
    Green bg              Gray bg              Red bg
```

---

## Color Palette

### Status Colors

| Status | Color Code | RGB | Visual |
|--------|-----------|-----|--------|
| **Completed** | `#22c55e` | rgb(34, 197, 94) | 🟢 Green |
| **Skipped** | `#94a3b8` | rgb(148, 163, 184) | ⚫ Muted Gray |
| **Missed** | `#ef4444` | rgb(239, 68, 68) | 🔴 Red |
| **Partial** | `#facc15` | rgb(250, 204, 21) | 🟡 Yellow |

### Background Gradients

**Completed Card:**
```css
background: linear-gradient(135deg, #fefffe 0%, #f0fdf7 100%);
border-color: #86efac;
```

**Skipped Card:**
```css
background: linear-gradient(135deg, #fefffe 0%, #f8fafc 100%);
border-color: #cbd5e1;
```

**Status Badges:**

```css
/* Completed */
.status-badge.status-completed {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}

/* Skipped */
.status-badge.status-skipped {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
}
```

---

## Button States

### Skip Today Button

**Default:**
```
┌──────────────┐
│  Skip Today  │  Background: #f1f5f9
└──────────────┘  Text: #64748b
                  Border: #cbd5e1
```

**Hover:**
```
┌──────────────┐
│  Skip Today  │  Background: #e2e8f0
└──────────────┘  Text: #475569
    ↑ Lifted      Border: #94a3b8
```

### Undo Skip Button

**Default:**
```
┌──────────────┐
│  Undo Skip   │  Background: #f1f5f9
└──────────────┘  Text: #475569
                  Border: #e2e8f0
```

**Hover:**
```
┌──────────────┐
│  Undo Skip   │  Background: #e2e8f0
└──────────────┘  Text: #334155
    ↑ Lifted      Border: #cbd5e1
```

---

## Logout Button (Fixed)

### Before Fix
```
┌────────┐
│ Logout │  Background: Gradient (hard to see)
└────────┘  Text: White (low contrast)
```

### After Fix
```
┌────────┐
│ Logout │  Background: #EF4444 (solid red)
└────────┘  Text: White (#FFFFFF)
            Border: 2px solid #EF4444
            ✅ High contrast, clearly visible
```

**Hover State:**
```
┌────────┐
│ Logout │  Background: #DC2626 (darker red)
└────────┘  Transform: translateY(-2px)
    ↑ Lifted  Shadow: Enhanced
```

---

## Message Notifications

### Skip Success
```
┌─────────────────────────────────────────────┐
│ ⏸️ Day marked as skipped. Streak maintained!│
└─────────────────────────────────────────────┘
  Background: Light blue (info)
  Position: Top-right corner
  Auto-dismiss: 3 seconds
```

### Skip Error (Weekly Limit)
```
┌──────────────────────────────────────────────────┐
│ ❌ Maximum 1 skip per week allowed. This maintains│
│    consistency.                                   │
└──────────────────────────────────────────────────┘
  Background: Light red (error)
  Position: Top-right corner
  Auto-dismiss: 5 seconds
```

### Skip Error (Consecutive Days)
```
┌──────────────────────────────────────────────────┐
│ ❌ Cannot skip consecutive days. Yesterday was   │
│    already skipped.                              │
└──────────────────────────────────────────────────┘
  Background: Light red (error)
  Position: Top-right corner
  Auto-dismiss: 5 seconds
```

---

## Responsive Behavior

### Mobile View (< 768px)

```
┌─────────────────────────┐
│ 📝 Exercise     🔥 5    │
│ 30 min cardio           │
│                         │
│ [Start]                 │
│ [Skip Today]        [×] │
└─────────────────────────┘
```

Buttons stack vertically on very small screens:
```
┌─────────────────────────┐
│ 📝 Exercise     🔥 5    │
│ 30 min cardio           │
│                         │
│ [      Start      ]     │
│ [   Skip Today    ]     │
│                     [×] │
└─────────────────────────┘
```

---

## Accessibility Features

1. **High Contrast Colors**
   - Completed: Green (#22c55e) - WCAG AA compliant
   - Skipped: Gray (#94a3b8) - Clear distinction from other states
   - Missed: Red (#ef4444) - High visibility

2. **Clear Labels**
   - All buttons have descriptive text
   - Status badges include emoji + text
   - Tooltips on icon-only elements

3. **Keyboard Navigation**
   - All buttons focusable via Tab key
   - Enter/Space to activate
   - Focus indicators visible (blue outline)

4. **Screen Reader Support**
   - Semantic HTML (button, span, div with roles)
   - ARIA labels where needed
   - Status changes announced

---

## Animation & Transitions

### Button Hover
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
transform: translateY(-1px);
```

### Card Update
```css
/* Smooth transition when status changes */
transition: background 0.3s ease, border-color 0.3s ease;
```

### Weekly Graph
```css
/* Day cells animate on load */
animation: slideInUp 0.5s ease-out;
```

---

## Testing Checklist

### Visual Testing
- [ ] Skip button appears on idle habits
- [ ] Skipped badge shows correct icon and color
- [ ] Habit card has gray left border when skipped
- [ ] Weekly graph shows gray dots for skipped days
- [ ] Analytics chart includes gray segment
- [ ] Logout button is clearly visible (red)

### Functional Testing
- [ ] Skip button calls skipHabitToday()
- [ ] Undo Skip button calls undoSkipToday()
- [ ] Streak number maintains on skip
- [ ] Active Today count includes skipped
- [ ] Weekly limit enforced (1 skip/week)
- [ ] Consecutive skip blocked

### Responsive Testing
- [ ] Mobile view (320px-768px)
- [ ] Tablet view (768px-1024px)
- [ ] Desktop view (1024px+)

---

*Visual Reference Guide v1.0*  
*Last Updated: December 28, 2025*
