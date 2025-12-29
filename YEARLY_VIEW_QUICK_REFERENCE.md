# Yearly Habit Tracking View - Quick Reference

## 🎯 Feature Overview
A 365-day calendar view showing your entire year of habit tracking with visual color-coding.

## 🎨 Color Code System

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 **Green** | Completed | You marked the habit as done |
| 🟡 **Yellow** | Skipped | You clicked "Skip Today" |
| 🔴 **Red** | Missed | No action taken on a past day |
| ⚪ **Gray** | Future | Day hasn't occurred yet |

## 📍 How to Access

1. Click **"📆 Yearly View"** in the navigation menu
2. Select a **habit** from the dropdown
3. Select a **year** from the dropdown
4. View your complete yearly calendar!

## 📊 What You'll See

### Month Blocks
- 12 month sections (January through December)
- Each month shows all its days in a grid
- Days are organized like a calendar (7 columns)

### Statistics Panel
Shows 4 key metrics:
- **Completed**: Total days you finished the habit
- **Skipped**: Total days you intentionally skipped
- **Missed**: Total days with no action
- **Completion Rate**: Percentage of days completed or skipped (excludes future days)

### Interactive Features
- **Hover**: Place your cursor on any day to see the exact date and status
- **Responsive**: Works on desktop, tablet, and mobile
- **Year Switching**: Navigate between current year and 4 previous years
- **Instant Updates**: Change habit or year for immediate refresh

## 🔍 Understanding Your Data

### Example Interpretation

If you see:
- 200 green squares (completed)
- 50 yellow squares (skipped)
- 30 red squares (missed)
- 85 gray squares (future)

**This means:**
- You completed the habit on 200 days
- You intentionally skipped 50 days (maintaining your streak)
- You missed 30 days (broke your streak)
- 85 days haven't occurred yet
- **Completion Rate**: 89% (250 active days out of 280 past days)

## 📱 Mobile View

On mobile devices:
- Months stack vertically (one per row)
- Grid adjusts to fit screen width
- All functionality remains the same
- Pinch to zoom for detailed view

## 🚀 Live Demo

Visit: https://habit-tracker-nine-kappa.vercel.app
1. Login to your account
2. Create a habit (if you haven't)
3. Mark some days as completed/skipped
4. Navigate to "📆 Yearly View"
5. Select your habit and year

## 💡 Pro Tips

1. **Track Patterns**: Look for red clusters to identify problem periods
2. **Celebrate Success**: Green dominance shows excellent consistency
3. **Yellow is OK**: Skipped days (yellow) are intentional rest days and maintain your streak
4. **Compare Years**: Switch between years to track long-term progress
5. **Best Viewed**: Full screen on desktop for complete overview

## 🔄 Automatic Updates

The yearly view automatically:
- ✅ Detects leap years (shows 366 days)
- ✅ Grays out future days
- ✅ Updates in real-time when you switch selections
- ✅ Calculates accurate statistics
- ✅ Excludes future days from completion rate

## 📈 Use Cases

**Perfect for:**
- Visualizing long-term consistency
- Identifying patterns and trends
- Reviewing yearly progress
- Sharing achievements (screenshot-friendly)
- Annual self-reflection
- Goal tracking reviews

**Example Scenarios:**
- "How many days did I exercise this year?"
- "What months was I most consistent?"
- "Where did I fall off track?"
- "What's my overall habit adherence?"

## 🛠️ Technical Notes

**Data Source:** MongoDB completionHistory array
**Status Logic:** Determined by presence/absence of entries
**Performance:** Single API call per view
**Compatibility:** All modern browsers

## ❓ FAQ

**Q: Can I edit past days from this view?**
A: Not yet - this is a read-only visualization. Edit from "All Habits" page.

**Q: Why are some days gray?**
A: Gray days are in the future and haven't occurred yet.

**Q: Do skipped days count as failures?**
A: No! Yellow (skipped) days maintain your streak and count as active days.

**Q: How far back can I view?**
A: Up to 5 years (current year + 4 previous years).

**Q: What happens on leap years?**
A: The system automatically detects leap years and shows 366 days.

---

**Quick Navigation:**
- Home → "📆 Yearly View" → Select Habit → Select Year → View Calendar

**Status:** ✅ Live on Production
**URL:** https://habit-tracker-nine-kappa.vercel.app
