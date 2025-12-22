/**
 * Habit Tracker JavaScript - Client Side
































































































































































































**Happy Habit Building! 🚀🔥**---- Inspired by habit tracking methodologies- Designed to help people build better habits consistently- Built as a full-stack learning project## 🙏 Acknowledgments**Aarohi Sharma**## 👤 AuthorThis project is licensed under the ISC License.## 📄 LicenseContributions are welcome! Please feel free to submit a Pull Request.## 🤝 Contributing| `NODE_ENV` | Environment mode | `development` || `SESSION_SECRET` | Secret key for sessions | Required for production || `PORT` | Server port number | `3000` || `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/habit-tracker` ||----------|-------------|---------|| Variable | Description | Default |## 📝 Environment Variables  - Fetch API  - Vanilla JavaScript  - CSS3 (Responsive Design)  - HTML5- **Frontend:**  - dotenv  - Express Session  - EJS (Template Engine)  - Mongoose (ODM)  - MongoDB  - Express.js  - Node.js- **Backend:**## 🔧 Technologies Used```}  updatedAt: Date           // Auto-generated  createdAt: Date,          // Auto-generated  frequency: String,         // 'daily', 'weekly', 'custom'  isActive: Boolean,         // Active/archived status  category: String,          // Category tag  description: String,       // Optional description  }],    completed: Boolean    date: Date,  completionHistory: [{      // Array of completions  lastCompleted: Date,       // Last completion date  streak: Number,            // Current consecutive days  name: String,              // Habit name (required){```javascript### Habit Model## 🗃️ Database Schema- Resets the habit's streak to 0- **POST** `/api/habits/:id/reset-streak`### Reset Streak- Removes habit from database- **DELETE** `/api/habits/:id`### Delete Habit- Body: `{ "name": "Updated Name", "category": "updated" }`- **PUT** `/api/habits/:id`### Update Habit- Marks habit as completed for today and updates streak- **POST** `/api/habits/:id/complete`### Complete Habit- Body: `{ "name": "Exercise", "category": "health" }`- **POST** `/api/habits`### Create New Habit- Returns a specific habit by ID- **GET** `/api/habits/:id`### Get Single Habit- Returns all active habits- **GET** `/api/habits`### Get All Habits## 🔌 API Endpoints```└── .gitignore              # Git ignore rules├── .env.example             # Environment variables template├── .env                     # Environment variables (not in git)├── package.json             # Project dependencies├── server.js                # Express server setup│   └── assets/              # Images and other static files│   │   └── script.js        # Client-side JavaScript│   ├── js/│   │   └── styles.css       # Application styles│   ├── css/├── public/│   └── 404.ejs              # Error page│   ├── index.ejs            # Main habit tracker page│   │   └── footer.ejs       # Reusable footer template│   │   ├── header.ejs       # Reusable header template│   ├── partials/├── views/│   └── habits.js            # API routes for habit operations├── routes/│   └── Habit.js             # Mongoose schema for habits├── models/│   └── database.js          # MongoDB connection configuration├── config/HABIT TRACKER/```## 📁 Project StructureThe application will be available at: **http://localhost:3000**```npm start```bash### Production Mode```npm run dev```bash### Development Mode (with auto-restart)## 🚦 Running the Application   ```   mongod   ```bash4. **Start MongoDB** (if running locally)   ```   NODE_ENV=development   SESSION_SECRET=your-secret-key-here   PORT=3000   MONGODB_URI=mongodb://localhost:27017/habit-tracker   ```env   - Edit `.env` file and update the MongoDB connection string:   ```   cp .env.example .env   ```bash   - Copy `.env.example` to `.env`3. **Configure environment variables**   ```   npm install   ```bash2. **Install dependencies**   ```   cd "HABIT TRACKER"   ```bash1. **Clone or navigate to the repository**## 🛠️ Installation  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud database- **MongoDB** (v4 or higher) - [Download](https://www.mongodb.com/try/download/community)- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)Before running this application, make sure you have the following installed:## 📋 Prerequisites- 📱 Mobile-friendly interface- ⚡ Real-time updates- 🔄 RESTful API architecture- 🎨 Clean, responsive UI design- 💾 Persistent data storage with MongoDB- 📊 Track streaks for consecutive completions- ✅ Create and manage daily habits## 🚀 FeaturesA comprehensive habit tracking web application built with Node.js, Express, MongoDB, and EJS templates. Track your daily habits, build streaks, and maintain consistency in building better habits. * This file contains all the functionality for the habit tracker app
 * Now uses API calls to communicate with the backend server
 */

// ========== Global Variables ==========
// Array to store all habits (fetched from server)
let habits = [];

// API base URL
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

// Load habits from server when page loads
document.addEventListener('DOMContentLoaded', loadHabits);

// ========== Functions ==========

/**
 * Add a new habit to the tracker
 * @param {Event} e - The form submit event
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
        // Send POST request to create new habit
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: habitName, description: habitDescription })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload habits from server
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
 * Create a habit card element
 * @param {Object} habit - The habit object
 * @returns {HTMLElement} The habit card element
 */
function createHabitListItem(habit) {
    const isTodayCompleted = completedToday(habit);

    const item = document.createElement('div');
    item.className = 'habit-item' + (isTodayCompleted ? ' completed' : '');

    const left = document.createElement('label');
    left.className = 'habit-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'habit-checkbox';
    checkbox.checked = isTodayCompleted;
    checkbox.addEventListener('change', () => setToday(habit._id, checkbox.checked));

    const textWrap = document.createElement('div');
    textWrap.className = 'habit-text';

    const title = document.createElement('div');
    title.className = 'habit-title';
    title.textContent = habit.name;

    const desc = document.createElement('div');
    desc.className = 'habit-desc';
    desc.textContent = habit.description || '';

    textWrap.appendChild(title);
    if (habit.description) textWrap.appendChild(desc);

    left.appendChild(checkbox);
    left.appendChild(textWrap);

    const right = document.createElement('div');
    right.className = 'habit-right';

    const streak = document.createElement('span');
    streak.className = 'streak-badge';
    streak.textContent = `🔥 ${habit.streak}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteHabit(habit._id);

    right.appendChild(streak);
    right.appendChild(delBtn);

    item.appendChild(left);
    item.appendChild(right);

    return item;
}

/**
 * Mark a habit as completed for today
 * @param {string} habitId - The ID of the habit to complete
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
 * Load habits from server
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
