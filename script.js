/**
 * Habit Tracker JavaScript
 * This file contains all the functionality for the habit tracker app
 * including adding habits, tracking streaks, and managing the habit list
 */

// ========== Global Variables ==========
// Array to store all habits
let habits = [];

// ========== DOM Elements ==========
// Get references to HTML elements we'll need to manipulate
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsContainer = document.getElementById('habits-container');

// ========== Event Listeners ==========
// Listen for form submission to add new habit
habitForm.addEventListener('submit', addHabit);

// Load habits from localStorage when page loads
document.addEventListener('DOMContentLoaded', loadHabits);

// ========== Functions ==========

/**
 * Add a new habit to the tracker
 * @param {Event} e - The form submit event
 */
function addHabit(e) {
    e.preventDefault(); // Prevent form from submitting normally
    
    const habitName = habitInput.value.trim();
    
    // Validate input
    if (habitName === '') {
        alert('Please enter a habit name');
        return;
    }
    
    // Create new habit object
    const habit = {
        id: Date.now(), // Unique ID based on timestamp
        name: habitName,
        streak: 0,
        lastCompleted: null,
        createdAt: new Date().toISOString()
    };
    
    // Add habit to array
    habits.push(habit);
    
    // Save to localStorage
    saveHabits();
    
    // Update UI
    displayHabits();
    
    // Clear input field
    habitInput.value = '';
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
    
    // Create and display each habit card
    habits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

/**
 * Create a habit card element
 * @param {Object} habit - The habit object
 * @returns {HTMLElement} The habit card element
 */
function createHabitCard(habit) {
    // Create main card container
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    // Create habit info section
    const habitInfo = document.createElement('div');
    habitInfo.className = 'habit-info';
    
    const habitName = document.createElement('div');
    habitName.className = 'habit-name';
    habitName.textContent = habit.name;
    
    const habitStreak = document.createElement('div');
    habitStreak.className = 'habit-streak';
    habitStreak.textContent = `🔥 Current streak: ${habit.streak} days`;
    
    habitInfo.appendChild(habitName);
    habitInfo.appendChild(habitStreak);
    
    // Create action buttons section
    const habitActions = document.createElement('div');
    habitActions.className = 'habit-actions';
    
    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = 'Complete';
    completeBtn.onclick = () => completeHabit(habit.id);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteHabit(habit.id);
    
    habitActions.appendChild(completeBtn);
    habitActions.appendChild(deleteBtn);
    
    // Assemble the card
    card.appendChild(habitInfo);
    card.appendChild(habitActions);
    
    return card;
}

/**
 * Mark a habit as completed for today
 * @param {number} habitId - The ID of the habit to complete
 */
function completeHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return;
    
    const today = new Date().toDateString();
    const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted).toDateString() : null;
    
    // Check if already completed today
    if (lastCompleted === today) {
        alert('You already completed this habit today! 🎉');
        return;
    }
    
    // Update streak
    habit.streak++;
    habit.lastCompleted = new Date().toISOString();
    
    // Save and update UI
    saveHabits();
    displayHabits();
    
    // Show success message
    alert(`Great job! Your streak is now ${habit.streak} days! 🔥`);
}

/**
 * Delete a habit from the tracker
 * @param {number} habitId - The ID of the habit to delete
 */
function deleteHabit(habitId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    // Remove habit from array
    habits = habits.filter(h => h.id !== habitId);
    
    // Save and update UI
    saveHabits();
    displayHabits();
}

/**
 * Save habits to localStorage
 */
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

/**
 * Load habits from localStorage
 */
function loadHabits() {
    const storedHabits = localStorage.getItem('habits');
    
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
        displayHabits();
    }
}

// ========== Additional Features (Optional) ==========
// You can add more features here such as:
// - Editing habit names
// - Setting daily reminders
// - Viewing habit history/calendar
// - Statistics and analytics
// - Categories for different types of habits
// - Dark mode toggle
