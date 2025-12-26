/**
 * Habit Tracker JavaScript - Client Side



**Happy Habit Building! 🚀🔥**---- Inspired by habit tracking methodologies- Designed to help people build better habits consistently- Built as a full-stack learning project## 🙏 Acknowledgments**Aarohi Sharma**## 👤 AuthorThis project is licensed under the ISC License.## 📄 LicenseContributions are welcome! Please feel free to submit a Pull Request.## 🤝 Contributing| `NODE_ENV` | Environment mode | `development` || `SESSION_SECRET` | Secret key for sessions | Required for production || `PORT` | Server port number | `3000` || `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/habit-tracker` ||----------|-------------|---------|| Variable | Description | Default |## 📝 Environment Variables  - Fetch API  - Vanilla JavaScript  - CSS3 (Responsive Design)  - HTML5- **Frontend:**  - dotenv  - Express Session  - EJS (Template Engine)  - Mongoose (ODM)  - MongoDB  - Express.js  - Node.js- **Backend:**## 🔧 Technologies Used```}  updatedAt: Date           // Auto-generated  createdAt: Date,          // Auto-generated  frequency: String,         // 'daily', 'weekly', 'custom'  isActive: Boolean,         // Active/archived status  category: String,          // Category tag  description: String,       // Optional description  }],    completed: Boolean    date: Date,  completionHistory: [{      // Array of completions  lastCompleted: Date,       // Last completion date  streak: Number,            // Current consecutive days  name: String,              // Habit name (required){```javascript### Habit Model## 🗃️ Database Schema- Resets the habit's streak to 0- **POST** `/api/habits/:id/reset-streak`### Reset Streak- Removes habit from database- **DELETE** `/api/habits/:id`### Delete Habit- Body: `{ "name": "Updated Name", "category": "updated" }`- **PUT** `/api/habits/:id`### Update Habit- Marks habit as completed for today and updates streak- **POST** `/api/habits/:id/complete`### Complete Habit- Body: `{ "name": "Exercise", "category": "health" }`- **POST** `/api/habits`### Create New Habit- Returns a specific habit by ID- **GET** `/api/habits/:id`### Get Single Habit- Returns all active habits- **GET** `/api/habits`### Get All Habits## 🔌 API Endpoints```└── .gitignore              # Git ignore rules├── .env.example             # Environment variables template├── .env                     # Environment variables (not in git)├── package.json             # Project dependencies├── server.js                # Express server setup│   └── assets/              # Images and other static files│   │   └── script.js        # Client-side JavaScript│   ├── js/│   │   └── styles.css       # Application styles│   ├── css/├── public/│   └── 404.ejs              # Error page│   ├── index.ejs            # Main habit tracker page│   │   └── footer.ejs       # Reusable footer template│   │   ├── header.ejs       # Reusable header template│   ├── partials/├── views/│   └── habits.js            # API routes for habit operations├── routes/│   └── Habit.js             # Mongoose schema for habits├── models/│   └── database.js          # MongoDB connection configuration├── config/HABIT TRACKER/```## 📁 Project StructureThe application will be available at: **http://localhost:3000**```npm start```bash### Production Mode```npm run dev```bash### Development Mode (with auto-restart)## 🚦 Running the Application   ```   mongod   ```bash4. **Start MongoDB** (if running locally)   ```   NODE_ENV=development   SESSION_SECRET=your-secret-key-here   PORT=3000   MONGODB_URI=mongodb://localhost:27017/habit-tracker   ```env   - Edit `.env` file and update the MongoDB connection string:   ```   cp .env.example .env   ```bash   - Copy `.env.example` to `.env`3. **Configure environment variables**   ```   npm install   ```bash2. **Install dependencies**   ```   cd "HABIT TRACKER"   ```bash1. **Clone or navigate to the repository**## 🛠️ Installation  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud database- **MongoDB** (v4 or higher) - [Download](https://www.mongodb.com/try/download/community)- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)Before running this application, make sure you have the following installed:## 📋 Prerequisites- 📱 Mobile-friendly interface- ⚡ Real-time updates- 🔄 RESTful API architecture- 🎨 Clean, responsive UI design- 💾 Persistent data storage with MongoDB- 📊 Track streaks for consecutive completions- ✅ Create and manage daily habits## 🚀 FeaturesA comprehensive habit tracking web application built with Node.js, Express, MongoDB, and EJS templates. Track your daily habits, build streaks, and maintain consistency in building better habits. * This file contains all the functionality for the habit tracker app
 * Now uses API calls to communicate with the backend server
 */

// ========== Global Variables ==========

// Array to store all habits (fetched from MongoDB via server API)
// PERSISTENCE: This is populated fresh from database on every page load
// Never relies on browser storage - MongoDB is the single source of truth
let habits = [];

// API base URL - all endpoints connect to Express server which queries MongoDB
const API_URL = '/api/habits';

// ========== DOM Elements ==========
// Get references to HTML elements we'll need to manipulate
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsContainer = document.getElementById('habits-container');
const habitDescInput = document.getElementById('habit-description');

// ========== Event Listeners ==========
// Listen for form submission to add new habit
habitForm.addEventListener('submit', addHabit);

// PERSISTENCE: Load habits from MongoDB when page loads
// This ensures we always have the latest data after refresh/reload
document.addEventListener('DOMContentLoaded', loadHabits);

// ========== Functions ==========

/**
 * Add a new habit to the tracker
 * @param {Event} e - The form submit event
 * 
 * PERSISTENCE FLOW:
 * 1. Validate input
 * 2. Send POST request to server with habit data
 * 3. Server creates new Mongoose document and saves to MongoDB
 * 4. On success, reload all habits from database (ensures sync)
 * 5. UI updates with new habit (now persisted permanently)
 * 
 * DATA PERSISTS BECAUSE:
 * - New habit saved to MongoDB before UI updates
 * - If page reloads before save completes, old data shown (no phantom habits)
 * - After successful save, habit survives all future page reloads
 */
async function addHabit(e) {
    e.preventDefault(); // Prevent form from submitting normally
    
    const habitName = habitInput.value.trim();
    const habitDescription = habitDescInput ? habitDescInput.value.trim() : '';
    
    // Validate input
    if (habitName === '') {
        alert('Please enter a habit name');
        return;
    }
    
    try {
        // Send POST request to create new habit in MongoDB
        // Server will create a Mongoose document and save to database
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: habitName, description: habitDescription })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // PERSISTENCE: Reload habits from MongoDB to sync UI with database
            // This ensures the new habit is shown with its database-assigned _id
            await loadHabits();
            
            // Clear input field
            habitInput.value = '';
            if (habitDescInput) habitDescInput.value = '';
            
            // Show success message
            showMessage('Habit added successfully! 🎉', 'success');
        } else {
            alert(data.message || 'Failed to add habit');
        }
    } catch (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit. Please try again.');
    }
}

/**
 * Display all habits in the UI
 */
function displayHabits() {
    // Clear container
    habitsContainer.innerHTML = '';
    
    // Check if there are no habits
    if (habits.length === 0) {
        habitsContainer.innerHTML = '<p style="text-align: center; color: #999;">No habits yet. Add one to get started!</p>';
        return;
    }
    
    // Create and display each habit checklist item
    habits.forEach(habit => {
        const item = createHabitListItem(habit);
        habitsContainer.appendChild(item);
    });
}

/**
 * Create a habit card element with weekly calendar view
 * @param {Object} habit - The habit object
 * @returns {HTMLElement} The habit card element
 */
function createHabitListItem(habit) {
    const item = document.createElement('div');
    item.className = 'habit-item';

    // Header section with title and streak
    const header = document.createElement('div');
    header.className = 'habit-header';

    const titleSection = document.createElement('div');
    titleSection.className = 'habit-title-section';

    const title = document.createElement('div');
    title.className = 'habit-title';
    title.textContent = habit.name;

    const desc = document.createElement('div');
    desc.className = 'habit-desc';
    desc.textContent = habit.description || '';

    titleSection.appendChild(title);
    if (habit.description) titleSection.appendChild(desc);

    const streakBadge = document.createElement('span');
    streakBadge.className = 'streak-badge';
    streakBadge.textContent = `🔥 ${habit.streak}`;

    header.appendChild(titleSection);
    header.appendChild(streakBadge);

    // Weekly calendar section
    const weeklySection = document.createElement('div');
    weeklySection.className = 'weekly-calendar';
    weeklySection.id = `weekly-${habit._id}`;

    // Load weekly status
    loadWeeklyStatus(habit._id, weeklySection);

    // Actions section
    const actions = document.createElement('div');
    actions.className = 'habit-actions';

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteHabit(habit._id);

    actions.appendChild(delBtn);

    item.appendChild(header);
    item.appendChild(weeklySection);
    item.appendChild(actions);

    return item;
}

/**
 * Load and display weekly status for a habit
 * @param {string} habitId - The habit ID
 * @param {HTMLElement} container - Container element for the weekly calendar
 */
async function loadWeeklyStatus(habitId, container) {
    try {
        const response = await fetch(`${API_URL}/${habitId}/weekly`);
        const data = await response.json();
        
        if (data.success) {
            displayWeeklyCalendar(habitId, data.data.week, container);
        } else {
            container.innerHTML = '<p class="error">Failed to load weekly status</p>';
        }
    } catch (error) {
        console.error('Error loading weekly status:', error);
        container.innerHTML = '<p class="error">Failed to load weekly status</p>';
    }
}

/**
 * Display weekly calendar with 7 days
 * @param {string} habitId - The habit ID
 * @param {Array} week - Array of 7 day objects
 * @param {HTMLElement} container - Container element
 */
function displayWeeklyCalendar(habitId, week, container) {
    container.innerHTML = '';
    
    week.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'day-item';
        
        // Add status classes
        if (day.status === 'completed') {
            dayEl.classList.add('completed');
        } else if (day.status === 'skipped') {
            dayEl.classList.add('skipped');
        } else if (day.isFuture) {
            dayEl.classList.add('future');
        } else if (day.isToday) {
            dayEl.classList.add('today');
        }
        
        // Day name
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = day.dayName;
        
        // Day date (number)
        const dayDate = document.createElement('div');
        dayDate.className = 'day-date';
        dayDate.textContent = new Date(day.date).getDate();
        
        // Status indicator
        const statusIcon = document.createElement('div');
        statusIcon.className = 'day-status';
        if (day.status === 'completed') {
            statusIcon.textContent = '✓';
        } else if (day.status === 'skipped') {
            statusIcon.textContent = '⊘';
        } else {
            statusIcon.textContent = '';
        }
        
        dayEl.appendChild(dayName);
        dayEl.appendChild(dayDate);
        dayEl.appendChild(statusIcon);
        
        // Add click handler for non-future days
        if (!day.isFuture) {
            dayEl.style.cursor = 'pointer';
            dayEl.onclick = () => handleDayClick(habitId, day);
        }
        
        container.appendChild(dayEl);
    });
}

/**
 * Handle clicking on a day in the weekly calendar
 * @param {string} habitId - The habit ID
 * @param {Object} day - The day object
 */
async function handleDayClick(habitId, day) {
    if (day.isFuture) return;
    
    // Show options: Mark Complete, Skip, or Remove
    const currentStatus = day.status;
    let newStatus;
    
    if (currentStatus === 'completed') {
        // If completed, offer to remove or skip
        const action = confirm('Remove completion for this day?\n\nOK = Remove\nCancel = Keep');
        if (!action) return;
        newStatus = null; // Remove entry
    } else if (currentStatus === 'skipped') {
        // If skipped, offer to complete or remove
        const action = confirm('Mark as completed?\n\nOK = Complete\nCancel = Remove skip');
        if (action) {
            newStatus = 'completed';
        } else {
            newStatus = null; // Remove entry
        }
    } else {
        // Not done yet, offer to complete or skip
        const action = confirm('What would you like to do?\n\nOK = Mark Complete\nCancel = Skip Day');
        newStatus = action ? 'completed' : 'skipped';
    }
    
    await updateDayStatus(habitId, day.date, newStatus);
}

/**
 * Update the status of a specific day
 * @param {string} habitId - The habit ID
 * @param {Date} date - The date to update
 * @param {string|null} status - New status ('completed', 'skipped', or null to remove)
 */
async function updateDayStatus(habitId, date, status) {
    try {
        if (status === null) {
            // Remove the entry (uncomplete/unskip)
            const dateStr = new Date(date).toISOString().split('T')[0];
            const response = await fetch(`${API_URL}/${habitId}/today`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: false, date: dateStr })
            });
            const data = await response.json();
            if (data.success) {
                await loadHabits();
                showMessage('Status removed', 'success');
            } else {
                showMessage(data.message || 'Failed to remove status', 'error');
            }
        } else {
            // Set new status
            const dateStr = new Date(date).toISOString().split('T')[0];
            const response = await fetch(`${API_URL}/${habitId}/day`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, status })
            });
            const data = await response.json();
            if (data.success) {
                await loadHabits();
                showMessage(`Marked as ${status}! ${status === 'completed' ? '✓' : '⊘'}`, 'success');
            } else {
                showMessage(data.message || 'Failed to update status', 'error');
            }
        }
    } catch (error) {
        console.error('Error updating day status:', error);
        showMessage('Failed to update. Please try again.', 'error');
    }
}

/**
 * Mark a habit as completed for today
 * @param {string} habitId - The ID of the habit to complete
 * @param {boolean} completed - Whether to mark as completed or incomplete
 * 
 * PERSISTENCE FLOW:
 * 1. Send PUT request to server with completion status
 * 2. Server updates MongoDB document:
 *    - Adds/removes entry in completionHistory array
 *    - Recalculates streak based on consecutive days
 *    - Updates lastCompleted date
 * 3. MongoDB saves changes (data now persists)
 * 4. Reload habits from database to show updated streak
 * 
 * WHY STREAK PERSISTS:
 * - completionHistory array stored in MongoDB (permanent record)
 * - Streak calculated from history and saved to database
 * - After page reload, streak value comes directly from MongoDB
 * - No client-side calculation needed - server is source of truth
 */
async function setToday(habitId, completed) {
    try {
        const response = await fetch(`${API_URL}/${habitId}/today`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        const data = await response.json();
        if (data.success) {
            await loadHabits();
            showMessage(completed ? 'Marked complete for today ✅' : 'Marked incomplete for today ↩️', 'success');
        } else {
            showMessage(data.message || 'Update failed', 'error');
            await loadHabits();
        }
    } catch (error) {
        console.error('Error updating today status:', error);
        showMessage('Failed to update. Please try again.', 'error');
        await loadHabits();
    }
}

/**
 * Delete a habit from the tracker
 * @param {string} habitId - The ID of the habit to delete
 * 
 * PERSISTENCE FLOW:
 * 1. Confirm with user
 * 2. Send DELETE request to server
 * 3. Server calls Mongoose findByIdAndDelete()
 * 4. MongoDB permanently removes the document
 * 5. Reload habits from database (deleted habit no longer appears)
 * 
 * DATA PERSISTENCE:
 * - Deletion is permanent in MongoDB
 * - Habit will not reappear on page reload
 * - Other habits remain unaffected and persist normally
 */
async function deleteHabit(habitId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${habitId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showMessage('Habit deleted successfully', 'success');
            
            // Reload habits from server
            await loadHabits();
        } else {
            alert(data.message || 'Failed to delete habit');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
    }
}

// Helpers
function completedToday(habit) {
    if (!habit.lastCompleted) return false;
    const last = new Date(habit.lastCompleted);
    const today = new Date();
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return last.getTime() === today.getTime();
}

/**
 * Load habits from server (MongoDB)
 * 
 * PERSISTENCE MECHANISM:
 * This is the KEY function that ensures persistence across page reloads
 * 
 * HOW IT WORKS:
 * 1. Sends GET request to /api/habits endpoint
 * 2. Server queries MongoDB: Habit.findActive() 
 * 3. Mongoose returns all documents from 'habits' collection where isActive=true
 * 4. Server sends JSON response with habit data
 * 5. Frontend receives habits with all fields:
 *    - _id (MongoDB document ID)
 *    - name, description, category
 *    - streak (calculated and stored in DB)
 *    - lastCompleted (date of last completion)
 *    - completionHistory (full array of all past completions)
 *    - createdAt, updatedAt (automatic timestamps)
 * 6. Updates local habits array
 * 7. Calls displayHabits() to render UI
 * 
 * CALLED ON:
 * - Initial page load (DOMContentLoaded event)
 * - After adding a new habit
 * - After completing/uncompleting a habit
 * - After deleting a habit
 * 
 * WHY THIS ENSURES PERSISTENCE:
 * - Always fetches fresh data from MongoDB (single source of truth)
 * - Never relies on localStorage, sessionStorage, or cookies
 * - Works even if user clears browser data
 * - Works across different devices (if same MongoDB instance)
 * - Survives server restarts (MongoDB data persists on disk)
 */
async function loadHabits() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            habits = data.data;
            displayHabits();
        } else {
            console.error('Failed to load habits:', data.message);
            habitsContainer.innerHTML = '<p style="text-align: center; color: #ff0000;">Failed to load habits. Please refresh the page.</p>';
        }
    } catch (error) {
        console.error('Error loading habits:', error);
        habitsContainer.innerHTML = '<p style="text-align: center; color: #ff0000;">Failed to connect to server. Please check your connection.</p>';
    }
}

/**
 * Show a temporary message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'error', 'info')
 */
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to body
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// ========== Additional Features ==========
// You can add more features here such as:
// - Editing habit names
// - Setting daily reminders
// - Viewing habit history/calendar
// - Statistics and analytics
// - Categories for different types of habits
// - Dark mode toggle
