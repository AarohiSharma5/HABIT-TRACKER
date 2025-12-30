# Visual Reference - Routine & Edit Features

## 🎯 Feature Overview

This guide provides a visual walkthrough of the new and improved features.

---

## 1. 🎨 Improved Routine Display

### Before:
```
## **Morning Exercise Routine** ##
-- Here are some tips --
• • Wake up at 6 AM
* * Drink water
-- Warm up --
• Do 10 jumping jacks
** cool down **
```

### After:
```
Morning Exercise Routine
├─ Here are some tips
├─ Preparation
│  ├─ Wake up at 6 AM
│  ├─ Drink water
│  └─ Prepare workout space
├─ Warm Up
│  ├─ Do 10 jumping jacks
│  ├─ Stretch for 5 minutes
│  └─ Light cardio
└─ Cool Down
   └─ Breathing exercises
```

**Improvements:**
- ✅ Clean headings (no ## symbols)
- ✅ Proper list structure
- ✅ No repeated bullets (•, --)
- ✅ Clear visual hierarchy
- ✅ Better spacing

---

## 2. 💡 Create Habit with Routine

### New Habit Form Section:

```
┌────────────────────────────────────────┐
│  [✓] 💡 Generate AI Routine           │
│      for this habit                    │
│                                        │
│  Get personalized tips and a routine  │
│  plan powered by AI                    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ What would you like help with?   │ │
│  │ (Optional)                        │ │
│  │ ┌──────────────────────────────┐ │ │
│  │ │ e.g., 'Give me a morning     │ │ │
│  │ │ routine', 'How can I stay    │ │ │
│  │ │ consistent?'                 │ │ │
│  │ └──────────────────────────────┘ │ │
│  │                                  │ │
│  │ Leave blank for general routine  │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**User Flow:**
1. Check box to enable routine generation
2. Section expands with prompt field
3. Enter custom prompt or leave blank
4. Click "Create Habit"
5. Habit created + routine generated automatically

---

## 3. ✏️ Edit Habit Modal

### Habit Card Actions:

```
┌─────────────────────────────────────────┐
│  💪 Exercise 30 minutes          🔥 5   │
│  Stay healthy and active               │
│                                         │
│  ✅ Completed                          │
│                                         │
│  [Start]  [💡]  [✏️]  [×]             │
│           Route  Edit  Del             │
└─────────────────────────────────────────┘
```

### Edit Modal Layout:

```
┌────────────────────────────────────────────┐
│  ×                                          │
│  Edit Habit Settings                        │
│  Note: Habit name cannot be changed        │
│  ─────────────────────────────────────────│
│                                             │
│  Habit Name (Cannot be changed)            │
│  ┌──────────────────────────────────────┐ │
│  │  Exercise 30 minutes      (disabled) │ │
│  └──────────────────────────────────────┘ │
│  Habit name is immutable                   │
│                                             │
│  How many days would you like to skip?     │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐     │
│  │  7  │  │  6  │  │  5  │  │  4  │     │
│  │ 🔥  │  │ 💪  │  │ ⭐  │  │ 🎯  │     │
│  │  0  │  │◉ 1  │  │  2  │  │  3  │     │
│  └─────┘  └─────┘  └─────┘  └─────┘     │
│                                             │
│  Which days to skip?                       │
│  [✓] Monday    [ ] Tuesday  [ ] Wednesday  │
│  [ ] Thursday  [ ] Friday   [ ] Saturday   │
│  [ ] Sunday                                 │
│                                             │
│  Minimum Duration                          │
│  ┌──────────────────────────────────────┐ │
│  │  30 (minutes)                        │ │
│  └──────────────────────────────────────┘ │
│                                             │
│  [Cancel]           [Save Changes]         │
└────────────────────────────────────────────┘
```

**Features:**
- ✅ Habit name shown but disabled
- ✅ Visual skip day selector (radio + checkboxes)
- ✅ Current values pre-selected
- ✅ Validation enforced (can't over-select)
- ✅ Saves without page reload

---

## 4. 📱 Mobile Responsive Views

### Routine Modal on Phone:

```
┌──────────────────────┐
│  ×                    │
│  Personal Routine    │
│  for Exercise        │
│                      │
│  ┌────────────────┐ │
│  │ 📅 Dec 30     │ │
│  │ 💬 Morning    │ │
│  │   routine     │ │
│  ├────────────────┤ │
│  │                │ │
│  │ Morning Prep   │↕│ ← Scrollable
│  │ ▸ Wake at 6   │ │   (65vh max)
│  │ ▸ Drink water │ │
│  │                │ │
│  │ Exercise       │ │
│  │ ▸ Warm up     │ │
│  │ ▸ Main set    │ │
│  │ ▸ Cool down   │ │
│  │                │ │
│  └────────────────┘ │
│                      │
│  [🔄 Regen] [🗑️Del]│
│  [Done]              │
└──────────────────────┘
```

**Mobile Improvements:**
- ✅ Full-screen modal (95% width)
- ✅ Fixed close button (always visible)
- ✅ Scrollable content (60vh on mobile)
- ✅ Larger font sizes (accessibility)
- ✅ Stacked action buttons
- ✅ Touch-friendly targets

---

## 5. 🎯 Edit Workflow Example

### Scenario: Change workout schedule from daily to 6 days/week

**Step 1:** Click edit button on habit card
```
[✏️] ← Click this
```

**Step 2:** Modal opens with current settings
```
Currently: 7 days active (no skip days)
```

**Step 3:** Select "1 Skip Day"
```
Radio buttons: [🔥 7] [●💪 6] [⭐ 5] [🎯 4]
```

**Step 4:** Specific days section appears
```
"Select exactly 1 day to skip"
Checkboxes appear for Mon-Sun
```

**Step 5:** Check Sunday
```
[✓] Sunday
```

**Step 6:** Click "Save Changes"
```
✓ Habit updated successfully! 🎉
```

**Step 7:** Habit card updates immediately
```
Updated display shows: 6 days/week
Sunday marked as skip day
```

---

## 6. 🚫 Immutability Examples

### ❌ CANNOT Do:
```
Habit Name: "Exercise 30 minutes"
          ↓
Try to change to: "Morning Workout"
          ↓
❌ Field is read-only
```

**Message shown:**
> "Habit name is immutable to maintain data integrity"

### ✅ CAN Do:
```
Create new habit: "Morning Workout"
Copy settings from old habit
Delete old habit if needed
```

---

## 7. 💡 Routine Text Formatting

### Input (Gemini AI Response):
```
## **Morning Routine** ##

-- **Wake up** --
* * Drink water immediately
- - Stretch for 5 minutes

**Breakfast**
• • Healthy meal
• • Take vitamins

-- Cool down --
```

### Output (Displayed to User):
```
Morning Routine
───────────────

Wake up
▸ Drink water immediately
▸ Stretch for 5 minutes

Breakfast
▸ Healthy meal
▸ Take vitamins

Cool down
```

**Processing:**
1. Remove ## markers
2. Strip ** bold markers (or convert to `<strong>`)
3. Remove -- decorators
4. Deduplicate bullets (• •, * *, - -)
5. Group into proper `<ul>` lists
6. Clean whitespace

---

## 8. 🎨 Visual Hierarchy

### Routine Content Structure:

```
┌─────────────────────────────────────┐
│ 📅 Generated on Dec 30, 2025        │ ← Metadata
│ 💬 Your request: "morning routine"  │
├─────────────────────────────────────┤
│                                     │
│ Main Heading (1.375rem, bold)      │ ← H2
│                                     │
│ Regular paragraph text explaining   │ ← P
│ the routine in detail...            │
│                                     │
│   Sub Heading (1.125rem, semi-bold)│ ← H3
│   ▸ List item with proper spacing  │ ← LI
│   ▸ Another list item               │
│   ▸ Third list item                 │
│                                     │
│ Another paragraph of text with      │
│ strong emphasis for key points.     │
│                                     │
└─────────────────────────────────────┘
```

**Spacing:**
- Main headings: 1.75rem top margin
- Sub headings: 1.5rem top margin
- Paragraphs: 0.875rem vertical margin
- List items: 0.625rem vertical margin
- Consistent line-height: 1.65-1.75

---

## 9. 🎯 Color Coding

### Routine Modal:
- **Headings:** `#6F7CF3` (Primary Purple-Blue)
- **Text:** `#1F2937` (Dark Gray)
- **Metadata:** `#6B7280` (Medium Gray)
- **Background:** Gradient `#fafbff` → `#f0f4ff`
- **Border:** `rgba(111, 124, 243, 0.1)`

### Edit Button:
- **Default:** White bg, `#94a3b8` text
- **Hover:** `#eff6ff` bg, `#667eea` text
- **Border:** `#e2e8f0` → `#bfdbfe` on hover

### Action Buttons:
- **Primary:** Gradient purple-blue
- **Secondary:** White with blue border
- **Danger:** Red for delete
- **Success:** Green for complete

---

## 10. ⚡ Performance Features

### Optimizations:
- ✅ CSS-only animations (GPU accelerated)
- ✅ Minimal JavaScript execution
- ✅ Event delegation
- ✅ Debounced input handlers
- ✅ Lazy rendering (only visible elements)
- ✅ No memory leaks (proper cleanup)

### Loading States:
```
Generating routine...
┌────────────────────────┐
│  ⏳ Generating...      │ ← Spinner
│  Please wait...        │
└────────────────────────┘
```

### Success States:
```
✓ Habit created and routine generated! 🎉
✓ Habit updated successfully! 🎉
✓ Routine generated successfully! 🎉
```

---

## 📊 Quick Reference

| Feature | Action | Result |
|---------|--------|--------|
| **Create with Routine** | Check box during creation | Auto-generates routine |
| **Edit Habit** | Click ✏️ button | Opens edit modal |
| **Change Schedule** | Select skip days | Updates without reload |
| **View Routine** | Click 💡 button | Shows formatted routine |
| **Close Modal** | Click × or ESC | Closes, restores scroll |
| **Scroll Content** | Swipe/wheel | Smooth custom scrollbar |

---

## 🎉 User Benefits

### Before:
- ❌ Cluttered routine text
- ❌ No routine during creation
- ❌ Can't edit habits
- ❌ Must recreate to change schedule

### After:
- ✅ Clean, readable routines
- ✅ Optional routine at creation
- ✅ Edit schedule anytime
- ✅ Immutable name protects data
- ✅ Mobile-friendly everywhere

---

**Status:** ✅ All features implemented and tested
**Last Updated:** December 30, 2025
