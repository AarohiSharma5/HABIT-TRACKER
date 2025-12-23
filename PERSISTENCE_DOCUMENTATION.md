# Habit Tracker - Data Persistence Documentation

## 🔒 How Data Persistence Works

This application uses **MongoDB** as the permanent storage solution, ensuring all habit data persists across:
- Page reloads
- Browser closes
- Server restarts  
- Device switches (if using same database)

---

## 📊 Data Structure in MongoDB

### Collection: `habits`

Each habit document in MongoDB contains:

```javascript
{
  _id: ObjectId("..."),              // MongoDB's unique document ID
  name: "Drink 8 glasses of water",  // Habit name
  description: "Stay hydrated",      // Optional description
  
  // PERSISTENCE FIELDS FOR STREAK TRACKING:
  streak: 5,                         // Current consecutive days (calculated & cached)
  lastCompleted: ISODate("2025-12-23T00:00:00Z"), // Last completion date
  
  // SOURCE OF TRUTH - Complete history of all completions:
  completionHistory: [
    { date: ISODate("2025-12-19T00:00:00Z"), completed: true },
    { date: ISODate("2025-12-20T00:00:00Z"), completed: true },
    { date: ISODate("2025-12-21T00:00:00Z"), completed: true },
    { date: ISODate("2025-12-22T00:00:00Z"), completed: true },
    { date: ISODate("2025-12-23T00:00:00Z"), completed: true }
  ],
  
  // METADATA:
  category: "health",                // Category for organization
  isActive: true,                    // Active vs archived
  frequency: "daily",                // Target frequency
  
  // AUTO-MANAGED TIMESTAMPS:
  createdAt: ISODate("2025-12-18T10:30:00Z"),
  updatedAt: ISODate("2025-12-23T09:15:00Z")
}
```

---

## 🔄 Persistence Flow

### 1. **Page Load** (Reading Data)
```
Browser → GET /api/habits 
       → Express Server 
       → Mongoose: Habit.findActive() 
       → MongoDB reads 'habits' collection
       → Returns all habit documents
       → Frontend displays with current streaks
```

### 2. **Adding a Habit** (Creating Data)
```
User submits form 
       → POST /api/habits {name, description}
       → Server creates: new Habit({...})
       → Mongoose saves to MongoDB
       → Document persisted permanently
       → Frontend reloads from MongoDB
       → New habit appears with _id
```

### 3. **Completing a Habit** (Updating Data)
```
User checks checkbox
       → PUT /api/habits/:id/today {completed: true}
       → Server: Habit.findById(id)
       → Calls habit.complete() method:
          - Checks if already completed today
          - Calculates if consecutive (increments streak)
          - Adds entry to completionHistory[]
          - Updates lastCompleted date
          - Saves to MongoDB
       → MongoDB persists updated document
       → Frontend reloads from MongoDB
       → UI shows updated streak (e.g., 🔥 6)
```

### 4. **Deleting a Habit** (Removing Data)
```
User clicks delete & confirms
       → DELETE /api/habits/:id
       → Server: Habit.findByIdAndDelete(id)
       → MongoDB removes document permanently
       → Frontend reloads from MongoDB
       → Habit no longer appears
```

---

## 🛡️ Data Integrity Features

### 1. **Dual Persistence Strategy**
- **`completionHistory`** array = Source of truth (never modified except add/remove)
- **`streak`** field = Cached calculation (can be rebuilt from history)
- **`lastCompleted`** = Quick lookup optimization (derived from history)

### 2. **Automatic Streak Recalculation**
If streak gets corrupted or manually modified, the `_recomputeFromHistory()` method can rebuild it:

```javascript
// Recompute streak from completionHistory
habit._recomputeFromHistory();
await habit.save();
// Streak now accurately reflects consecutive days
```

### 3. **Undo Support**
The `uncompleteToday()` method removes today's completion and recalculates streak:

```javascript
// User accidentally marked complete
await habit.uncompleteToday();
// Entry removed from history, streak recalculated from remaining entries
```

---

## 🔍 Why This Architecture Ensures Persistence

### ✅ **Single Source of Truth**
- MongoDB is the ONLY storage location
- No localStorage, sessionStorage, or cookies used
- Frontend never stores data locally

### ✅ **Immediate Database Writes**
- Every action (add/complete/delete) writes to MongoDB immediately
- UI updates only AFTER successful database save
- No risk of losing data from browser crashes

### ✅ **Always Fresh Data**
- Every page load fetches from MongoDB
- No stale cache issues
- Always synchronized with database state

### ✅ **Server Survives Restarts**
- MongoDB data persists on disk
- Server restart doesn't lose any data
- Habits reload from database on next request

### ✅ **Cross-Device Support**
- Data stored in centralized database
- Access from any device/browser
- Same MongoDB = same habits everywhere

---

## 🔧 Technical Implementation

### Backend (Mongoose Model)
File: `/models/Habit.js`

Key methods that ensure persistence:
- `habit.save()` - Writes to MongoDB
- `habit.complete()` - Adds to history & saves
- `habit.uncompleteToday()` - Removes from history & saves
- `Habit.findActive()` - Queries MongoDB for all habits
- `Habit.findByIdAndDelete()` - Permanently removes from MongoDB

### API Routes
File: `/routes/habits.js`

All routes interact with MongoDB:
- `GET /api/habits` → Reads from MongoDB
- `POST /api/habits` → Creates in MongoDB
- `PUT /api/habits/:id/today` → Updates in MongoDB
- `DELETE /api/habits/:id` → Deletes from MongoDB

### Frontend
File: `/public/js/script.js`

Key persistence points:
- `loadHabits()` - Fetches from MongoDB on every page load
- `addHabit()` - Saves to MongoDB, then reloads
- `setToday()` - Updates MongoDB, then reloads
- `deleteHabit()` - Deletes from MongoDB, then reloads

---

## 🧪 Testing Persistence

### Test 1: Page Reload
1. Add a habit
2. Complete it (streak = 1)
3. Refresh page (Ctrl+R or F5)
4. ✅ Habit still there with streak = 1

### Test 2: Browser Close
1. Add habits and build streaks
2. Close browser completely
3. Reopen and navigate to app
4. ✅ All habits and streaks intact

### Test 3: Server Restart
1. Build some habit streaks
2. Stop server (Ctrl+C in terminal)
3. Restart server (`npm start`)
4. Reload page in browser
5. ✅ All data persists from MongoDB

### Test 4: Different Browser
1. Add habits in Chrome
2. Open app in Firefox (same URL)
3. ✅ Same habits appear (if same MongoDB)

---

## 📦 Database Backup

To ensure data never gets lost:

### Backup MongoDB
```bash
# Export all habits to JSON
mongodump --db=habit-tracker --collection=habits --out=backup/

# Or export to JSON format
mongoexport --db=habit-tracker --collection=habits --out=habits_backup.json
```

### Restore MongoDB
```bash
# Restore from dump
mongorestore --db=habit-tracker backup/habit-tracker/

# Or import from JSON
mongoimport --db=habit-tracker --collection=habits --file=habits_backup.json
```

---

## 🎯 Key Takeaways

1. **MongoDB is the only storage** - No local browser storage used
2. **Every action saves immediately** - Data persists before UI updates
3. **Page loads fetch fresh data** - Always synchronized with database
4. **completionHistory is sacred** - Complete audit trail never corrupted
5. **Streaks can be rebuilt** - Calculated from history for integrity

This architecture ensures **bulletproof data persistence** across all usage scenarios! 🚀
