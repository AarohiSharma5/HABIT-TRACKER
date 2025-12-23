# 🎨 Weekly Tracking UI Reference

## Visual Components Overview

### Complete Habit Card Layout
```
╔═══════════════════════════════════════════════════════════════════╗
║                        HABIT CARD                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  📋 Exercise Daily                              🔥 5              ║
║  30 minutes of cardio                                             ║
║                                                                   ║
╟───────────────────────────────────────────────────────────────────╢
║                    WEEKLY CALENDAR                                ║
║  ┏━━━━┳━━━━┳━━━━┳━━━━┳━━━━┳━━━━┳━━━━┓                          ║
║  ┃Mon ┃Tue ┃Wed ┃Thu ┃Fri ┃Sat ┃Sun ┃                          ║
║  ┃ 18 ┃ 19 ┃ 20 ┃ 21 ┃ 22 ┃ 23 ┃ 24 ┃                          ║
║  ┃ ✓  ┃ ✓  ┃ ⊘  ┃ ✓  ┃    ┃    ┃    ┃                          ║
║  ┗━━━━┻━━━━┻━━━━┻━━━━┻━━━━┻━━━━┻━━━━┛                          ║
║  [🟢] [🟢] [🟡] [🟢] [⬜] [🔵] [⬜]                               ║
║  Done  Done Skip  Done Empty Today Empty                          ║
║                                                                   ║
╟───────────────────────────────────────────────────────────────────╢
║                                              [Delete Habit]       ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Day States Visual Guide

### 1. Completed Day ✅
```
┌──────────┐
│   MON    │  ← Day name (uppercase, gray)
│    18    │  ← Date number
│    ✓     │  ← Checkmark symbol
└──────────┘
Background: Linear gradient #d1fae5 → #a7f3d0 (green)
Border: #6ee7b7 (green)
Checkmark: #059669 (dark green)
```

### 2. Skipped Day ⊘
```
┌──────────┐
│   WED    │
│    20    │
│    ⊘     │  ← Skip symbol
└──────────┘
Background: Linear gradient #fef3c7 → #fde68a (yellow)
Border: #fcd34d (amber)
Symbol: #d97706 (orange)
```

### 3. Not Done Day ⬜
```
┌──────────┐
│   FRI    │
│    22    │
│          │  ← Empty
└──────────┘
Background: #f8fafc (light gray)
Border: #e2e8f0 (gray)
Text: #334155 (dark gray)
```

### 4. Today 📅
```
┌──────────┐
│   SAT    │
│    23    │  ← Bold border indicates today
│          │
└══════════┘
Background: #eff6ff (light blue)
Border: #3b82f6 3px (blue, thicker)
Text: #334155
```

### 5. Future Day 🔒
```
┌──────────┐
│   SUN    │  ← Dimmed appearance
│    24    │
│          │
└──────────┘
Background: #f8fafc (faded)
Border: #e2e8f0 (gray)
Text: #94a3b8 (lighter gray)
Opacity: 0.5
Cursor: not-allowed
```

---

## Interactive States

### Hover Effect (Non-Future Days)
```
Before hover:       After hover:
┌──────────┐       ┌──────────┐
│   MON    │  -->  │   MON    │  ← Slightly larger
│    18    │       │    18    │  ← Lifted appearance
│    ✓     │       │    ✓     │  ← Shadow appears
└──────────┘       └──────────┘
                   
Transform: scale(1.05)
Box-shadow: 0 2px 8px rgba(0,0,0,0.1)
```

---

## Click Interaction Flow

### Scenario 1: Clicking an Empty Day
```
┌──────────┐
│   THU    │  ← User clicks
│    21    │
│          │
└──────────┘
        ↓
  ┌─────────────────────────────┐
  │ What would you like to do?  │
  │                              │
  │  [  OK  ]    [ Cancel ]      │
  │  Complete      Skip          │
  └─────────────────────────────┘
        ↓
   OK clicked          Cancel clicked
        ↓                    ↓
┌──────────┐          ┌──────────┐
│   THU    │          │   THU    │
│    21    │          │    21    │
│    ✓     │  🟢      │    ⊘     │  🟡
└──────────┘          └──────────┘
  Completed             Skipped
```

### Scenario 2: Clicking a Completed Day
```
┌──────────┐
│   TUE    │  ← User clicks (already completed)
│    19    │
│    ✓     │
└──────────┘
        ↓
  ┌─────────────────────────────┐
  │ Remove completion for this  │
  │ day?                         │
  │                              │
  │  [  OK  ]    [ Cancel ]      │
  │  Remove        Keep          │
  └─────────────────────────────┘
        ↓
   OK clicked          Cancel clicked
        ↓                    ↓
┌──────────┐          ┌──────────┐
│   TUE    │          │   TUE    │
│    19    │          │    19    │
│          │  ⬜      │    ✓     │  🟢
└──────────┘          └──────────┘
  Removed              Unchanged
```

### Scenario 3: Clicking a Skipped Day
```
┌──────────┐
│   WED    │  ← User clicks (already skipped)
│    20    │
│    ⊘     │
└──────────┘
        ↓
  ┌─────────────────────────────┐
  │ Mark as completed?           │
  │                              │
  │  [  OK  ]    [ Cancel ]      │
  │  Complete   Remove Skip      │
  └─────────────────────────────┘
        ↓
   OK clicked          Cancel clicked
        ↓                    ↓
┌──────────┐          ┌──────────┐
│   WED    │          │   WED    │
│    20    │          │    20    │
│    ✓     │  🟢      │          │  ⬜
└──────────┘          └──────────┘
  Completed             Removed
```

---

## Error State Examples

### Error 1: Consecutive Skip Attempt
```
Week status:
[MON✓] [TUE⊘] [WED?] [THU✓] [FRI ] [SAT ] [SUN ]

User tries to skip WED:
        ↓
  ┌─────────────────────────────────┐
  │  ❌ Cannot skip two consecutive │
  │     days                         │
  │                                  │
  │         [  OK  ]                 │
  └─────────────────────────────────┘

WED remains empty
```

### Error 2: Weekly Skip Limit
```
Week status:
[MON✓] [TUE✓] [WED⊘] [THU✓] [FRI?] [SAT ] [SUN ]

User tries to skip FRI (already used 1 skip):
        ↓
  ┌─────────────────────────────────┐
  │  ❌ You can only skip 1 day per │
  │     week                         │
  │                                  │
  │         [  OK  ]                 │
  └─────────────────────────────────┘

FRI remains empty
```

---

## Layout Variations

### Desktop View (800px+)
```
╔══════════════════════════════════════════════════════════════╗
║  Exercise Daily                            🔥 5               ║
║  ──────────────────────────────────────────────────────────  ║
║  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                ║
║  │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │                ║
║  │  18 │  19 │  20 │  21 │  22 │  23 │  24 │                ║
║  │  ✓  │  ✓  │  ⊘  │  ✓  │     │     │     │                ║
║  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                ║
║                                            [Delete]           ║
╚══════════════════════════════════════════════════════════════╝
Spacing: Comfortable, large click targets
Font size: 0.75rem (day name), 0.95rem (date), 1.2rem (status)
```

### Mobile View (< 600px)
```
╔══════════════════════════════════════════╗
║  Exercise Daily          🔥 5             ║
║  ────────────────────────────────────    ║
║  ┌───┬───┬───┬───┬───┬───┬───┐          ║
║  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│          ║
║  │18 │19 │20 │21 │22 │23 │24 │          ║
║  │ ✓ │ ✓ │ ⊘ │ ✓ │   │   │   │          ║
║  └───┴───┴───┴───┴───┴───┴───┘          ║
║                         [Delete]         ║
╚══════════════════════════════════════════╝
Spacing: Compact, touch-friendly
Font size: 0.65rem (day name), 0.85rem (date), 1rem (status)
```

---

## Color Palette Reference

### Completed (Green Theme)
```
Background gradient:
  Start: #d1fae5 (light mint)
  End:   #a7f3d0 (mint green)
Border: #6ee7b7 (emerald)
Text:   #059669 (dark green)
```

### Skipped (Yellow/Amber Theme)
```
Background gradient:
  Start: #fef3c7 (light yellow)
  End:   #fde68a (yellow)
Border: #fcd34d (amber)
Text:   #d97706 (orange)
```

### Not Done (Gray Theme)
```
Background: #f8fafc (slate 50)
Border:     #e2e8f0 (slate 200)
Text:       #334155 (slate 700)
```

### Today (Blue Theme)
```
Background: #eff6ff (blue 50)
Border:     #3b82f6 (blue 500)
Text:       #334155 (slate 700)
```

### Future (Faded Gray)
```
Background: #f8fafc (slate 50)
Border:     #e2e8f0 (slate 200)
Text:       #94a3b8 (slate 400)
Opacity:    0.5
```

---

## Typography

### Day Names
- Font size: `0.75rem` (desktop), `0.65rem` (mobile)
- Font weight: `600` (semi-bold)
- Color: `#64748b` (slate 500)
- Transform: `uppercase`
- Example: MON, TUE, WED

### Day Dates
- Font size: `0.95rem` (desktop), `0.85rem` (mobile)
- Font weight: `500` (medium)
- Color: `#334155` (slate 700)
- Example: 18, 19, 20

### Status Symbols
- Font size: `1.2rem` (desktop), `1rem` (mobile)
- Font weight: `bold`
- Height: `24px`
- Symbols: ✓ (completed), ⊘ (skipped)

---

## Animation & Transitions

### Hover Animation
```css
transition: all 0.2s ease;

On hover:
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```

### Card Hover
```css
transition: all 0.3s ease;

On hover:
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59,130,246,0.2);
  border-color: #3b82f6;
```

---

## Accessibility

### Visual Indicators
- ✅ Color + Symbol (not just color)
- ✅ Clear borders for focus
- ✅ Sufficient contrast ratios
- ✅ Large click targets (min 44x44px)

### Keyboard Navigation
- Tab through days
- Enter/Space to activate
- Escape to close dialogs

### Screen Readers
- Day names announced
- Status announced (completed/skipped)
- Date announced
- Error messages readable

---

## Print View (Future)
```
Exercise Daily - Weekly Report
Streak: 5 days

Mon 18: ✓ Completed
Tue 19: ✓ Completed  
Wed 20: ⊘ Skipped
Thu 21: ✓ Completed
Fri 22: Not completed
Sat 23: Not completed
Sun 24: Not completed

Notes: 1 skip used this week
```

---

## Quick Reference Card

```
Symbol Guide:
  ✓  = Completed (green)
  ⊘  = Skipped (yellow)
  🔵 = Today (blue border)
  ⬜ = Not done yet
  🔒 = Future (locked)

Rules:
  • Max 1 skip per week
  • No 2 consecutive skips
  • Skips break streaks
  • Click any day to update
  • Future days locked

Colors:
  🟢 Green  = Done
  🟡 Yellow = Skip
  ⬜ Gray   = Empty
  🔵 Blue   = Today
```

---

This UI design provides clear visual feedback, intuitive interactions, and maintains consistency across all device sizes! 🎨✨
