# Yearly Habit Tracking View - Feature Documentation

## Overview
A comprehensive 365-day (366 for leap years) calendar view that displays the complete yearly status of any habit with color-coded visual indicators.

## Features Implemented

### 1. Backend API Endpoint
**Route:** `GET /api/habits/:id/yearly?year=YYYY`

**Controller:** `habitController.getYearlyData()`

**Functionality:**
- Fetches all completion history for a specific habit
- Generates 365/366 day array for the selected year
- Automatically detects leap years
- Determines day status based on:
  - **Completed** (Green): User explicitly marked habit as done
  - **Skipped** (Yellow): User clicked "Skip Today"
  - **Missed** (Red): Past day with no entry in completionHistory
  - **Future** (Gray): Days that haven't occurred yet

### 2. Frontend UI Components

#### Navigation
- Added "📆 Yearly View" to main navigation menu
- Located in `/views/index.ejs`

#### Controls
- **Habit Selection Dropdown**: Choose from all active habits
- **Year Selection Dropdown**: Navigate between years (current year and 4 previous years)

#### Visual Display

**365-Day Grid Layout:**
- Organized by months (12 month blocks)
- Each month displays all days in a 7-column grid (week-like layout)
- Days are color-coded by status:
  - 🟢 Green: Completed
  - 🟡 Yellow: Skipped
  - 🔴 Red: Missed
  - ⚪ Gray: Future dates

**Statistics Panel:**
- Total Completed days
- Total Skipped days
- Total Missed days
- Completion Rate percentage (excludes future days)

**Interactive Features:**
- Hover on any day to see date and status
- Days scale up on hover (except future days)
- Real-time year/habit switching

### 3. Status Determination Logic

The system follows these rules:

```javascript
if (day is in the future) {
    status = 'future'
} else if (completionHistory has entry for this day) {
    status = entry.status  // 'completed' or 'skipped'
} else {
    status = 'missed'  // Past day with no entry
}
```

### 4. Leap Year Handling
- Automatically detects leap years using: `(year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)`
- Displays 366 days for leap years
- Shows "(Leap Year - 366 days)" in header

## Files Modified

### Backend
1. **`/controllers/habitController.js`**
   - Added `getYearlyData()` function
   
2. **`/routes/habits.js`**
   - Added route: `router.get('/:id/yearly', habitController.getYearlyData)`

### Frontend
3. **`/views/index.ejs`**
   - Added "Yearly View" navigation link
   - Created new page section with HTML structure
   - Added habit/year selection dropdowns
   - Added yearly grid container

4. **`/public/js/script.js`**
   - Added `loadYearlyView()` - Initialize page
   - Added `fetchYearlyData()` - Fetch data from API
   - Added `renderYearlyGrid()` - Render 365-day grid
   - Added `createMonthBlock()` - Create month sections
   - Added `calculateYearlyStats()` - Calculate statistics
   - Added `formatDateForTooltip()` - Format hover tooltips
   - Updated `switchPage()` to handle yearly view

5. **`/public/css/styles.css`**
   - Added `.yearly-controls` - Dropdown styling
   - Added `.yearly-view-section` - Container styling
   - Added `.yearly-months-grid` - Month layout
   - Added `.days-grid` - Day grid layout
   - Added `.day-cell` with status classes
   - Added responsive breakpoints for mobile/tablet

## Usage

1. **Navigate to Yearly View:**
   - Click "📆 Yearly View" in the navigation menu

2. **Select a Habit:**
   - Choose from the dropdown list of all active habits

3. **Select a Year:**
   - Choose year from dropdown (current year selected by default)

4. **Interpret the Grid:**
   - Green squares = Days you completed the habit
   - Yellow squares = Days you skipped (intentionally)
   - Red squares = Days you missed (no action taken)
   - Gray squares = Future days (not yet occurred)

5. **View Statistics:**
   - See completion count, skip count, miss count, and overall completion rate

## Technical Details

### Data Flow
```
User selects habit + year
    ↓
Frontend calls: GET /api/habits/{habitId}/yearly?year={year}
    ↓
Backend queries habit's completionHistory[]
    ↓
Generates 365/366 day array with status
    ↓
Returns JSON with yearData
    ↓
Frontend renders grid month-by-month
```

### Performance
- Single API call per habit/year combination
- Client-side rendering for instant grid display
- Efficient date calculations
- Minimal DOM manipulation

### Responsive Design
- Desktop: 3-4 month columns
- Tablet: 2 month columns
- Mobile: 1 month column (vertical scroll)

## Example API Response

```json
{
  "success": true,
  "data": {
    "habitId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "habitName": "Morning Exercise",
    "year": 2025,
    "isLeapYear": false,
    "daysInYear": 365,
    "yearData": [
      {
        "date": "2025-01-01T00:00:00.000Z",
        "status": "completed",
        "dayOfYear": 1
      },
      {
        "date": "2025-01-02T00:00:00.000Z",
        "status": "skipped",
        "dayOfYear": 2
      },
      {
        "date": "2025-01-03T00:00:00.000Z",
        "status": "missed",
        "dayOfYear": 3
      }
      // ... 362 more days
    ]
  }
}
```

## Testing

To test the feature:
1. Start server: `node server.js`
2. Navigate to: `http://localhost:3000`
3. Login with your account
4. Create/select a habit with some completion history
5. Click "📆 Yearly View" in navigation
6. Select the habit and year
7. Verify the grid displays correctly with proper colors

## Future Enhancements (Optional)
- Click on a day to view detailed reflection/notes
- Export yearly view as image
- Compare multiple habits side-by-side
- Add monthly completion rate overlays
- Heatmap intensity based on duration/effort

## Deployment

All code changes are ready for deployment. No additional configuration needed.

The feature uses existing:
- MongoDB habit schema (completionHistory)
- Express.js routing
- EJS templating
- Session authentication

---

**Feature Status:** ✅ Complete and Ready for Production

**Last Updated:** December 29, 2025
