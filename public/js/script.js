/**
 * Habit Tracker JavaScript - Client Side
 * Multi-page navigation with analytics and charts
 */

// ========== Global Variables ==========
let habits = [];
let dailyChart = null;
let categoryChart = null;
let weeklyOverviewChart = null;
const API_URL = '/api/habits';

// ========== Motivational Messages ==========
const COMPLETION_MESSAGES = [
    "🎉 Awesome! You're building great habits!",
    "💪 Well done! Keep up the amazing work!",
    "✨ Fantastic! You're on a roll!",
    "🌟 You're crushing it! So proud of you!",
    "🎯 Nice work! Every step counts!",
    "🚀 You're unstoppable! Great job!",
    "💫 Excellent! You're making progress!",
    "🏆 Champion! Another win for you!",
    "🔥 You're on fire! Keep going!",
    "⭐ Brilliant! You've got this!",
    "🎊 Wonderful! You're doing great!",
    "💝 Love this! You're thriving!",
    "🌈 Beautiful! Your dedication shows!",
    "✅ Perfect! You're nailing it!",
    "🎪 Marvelous! Keep shining!",
    "🌺 Fabulous! You inspire us!",
    "🎁 Gift to yourself! Well earned!",
    "🦋 Amazing! You're transforming!",
    "🌻 Blooming beautifully! Great work!",
    "💎 Precious progress! You're valuable!"
];

const SUPPORT_MESSAGES = [
    "💙 It's okay! Tomorrow is a fresh start.",
    "🌱 Progress isn't always linear. You're still growing!",
    "🤗 Be kind to yourself. Every day is different.",
    "✨ No worries! What matters is getting back on track.",
    "🌟 You're human, and that's perfectly fine!",
    "💫 Small setbacks, big comebacks! You've got this.",
    "🌈 Life happens! Let's focus on today.",
    "🦋 Every moment is a chance to begin again.",
    "🌸 Your worth isn't measured by perfect streaks.",
    "💝 We all have off days. You're still amazing!",
    "🌺 Rest is part of the journey. Welcome back!",
    "☀️ New day, new opportunities! Ready when you are.",
    "🎈 Shake it off! You're doing better than you think.",
    "🌻 One missed day doesn't erase your progress.",
    "💚 Self-compassion is important. You're doing great!",
    "🍀 Lucky for you, you can start fresh right now!",
    "🎨 Life is messy and beautiful. Keep creating!",
    "🌊 Like waves, we ebb and flow. That's natural.",
    "🎵 Dance through it! Your rhythm is your own.",
    "🌙 Rest, recharge, and rise again. You're resilient!"
];

const STREAK_BREAK_MESSAGES = [
    "💙 Streaks are just numbers. Your growth is real!",
    "🌱 New beginnings are beautiful! Let's start fresh.",
    "✨ What you've learned stays with you forever.",
    "🤗 This is just a pause, not a stop. Keep going!",
    "💫 Your effort matters more than any streak.",
    "🌈 Every expert was once a beginner who kept trying.",
    "🦋 Change and growth take many forms. Trust yourself!",
    "💝 You're braver than you think. Ready to continue?",
    "🌸 Perfection isn't the goal—progress is!",
    "☀️ Today's a good day to be proud of yourself.",
    "🌺 Your journey is unique and valuable.",
    "🎈 Celebrate how far you've come already!",
    "💚 Consistency is built over time, not overnight.",
    "🍀 Every day you try is a success in itself.",
    "🎨 Your story is still being written. Keep going!",
    "🌊 Resilience is getting back up. And here you are!",
    "🎵 Your rhythm might change, but your song continues.",
    "🌙 Rest isn't failure—it's preparation for success.",
    "🌟 Believe in yourself. We believe in you!",
    "🎁 Give yourself credit for showing up today."
];

const ENCOURAGEMENT_ON_RETURN = [
    "🎉 Welcome back! So glad to see you here!",
    "💪 You're back! That's what matters most!",
    "✨ Look at you, returning strong!",
    "🌟 Your comeback story starts now!",
    "🚀 Back and ready! Let's do this!",
    "💫 Returning takes courage. Proud of you!",
    "🏆 The best time to start is now. Welcome!",
    "🔥 You're here! That's a victory already!",
    "⭐ Every return is a triumph. Great to have you!",
    "🎊 Welcome home! Let's build together!",
    "💝 Missing days made you appreciate today more!",
    "🌈 Your presence here is powerful!",
    "🦋 Transformation includes pauses. Ready to soar?",
    "🌻 Growth includes rest. Let's bloom again!",
    "💎 You're valuable, returning or not!"
];

// ========== DOM Elements ==========
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitCategoryInput = document.getElementById('habit-category');
const habitsContainer = document.getElementById('habits-container');

// ========== Page Navigation ==========

/**
 * Initialize navigation and load content
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set up navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
        });
    });

    // Add habit form listener
    if (habitForm) {
        habitForm.addEventListener('submit', addHabit);
    }

    // Category dropdown change listener
    const categorySelect = document.getElementById('habit-category');
    const customCategoryGroup = document.getElementById('custom-category-group');
    if (categorySelect && customCategoryGroup) {
        categorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'other') {
                customCategoryGroup.style.display = 'block';
            } else {
                customCategoryGroup.style.display = 'none';
            }
        });
    }

    // Skip days radio button change listener
    const skipDaysRadios = document.querySelectorAll('input[name="skip-days"]');
    const specificDaysGroup = document.getElementById('specific-days-group');
    skipDaysRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const skipDays = parseInt(e.target.value);
            if (skipDays > 0 && specificDaysGroup) {
                specificDaysGroup.style.display = 'block';
                updateSkipDaysHelp(skipDays);
                // Clear previous selections
                document.querySelectorAll('input[name="skip-specific-days"]').forEach(cb => cb.checked = false);
                updateSelectedDaysPreview();
            } else if (specificDaysGroup) {
                specificDaysGroup.style.display = 'none';
            }
        });
    });

    // Day checkboxes change listener
    const dayCheckboxes = document.querySelectorAll('input[name="skip-specific-days"]');
    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const skipDaysElement = document.querySelector('input[name="skip-days"]:checked');
            const maxSkipDays = skipDaysElement ? parseInt(skipDaysElement.value) : 0;
            const checkedCount = document.querySelectorAll('input[name="skip-specific-days"]:checked').length;
            
            // Limit selection to the number of skip days chosen
            if (checkedCount > maxSkipDays) {
                checkbox.checked = false;
                alert(`You can only select ${maxSkipDays} day(s) to skip.`);
            }
            
            updateSelectedDaysPreview();
        });
    });

    // Load initial data
    loadHabits().then(() => {
        // Check for return message and missed habits after data loads
        checkAndShowReturnMessage();
    });
    switchPage('page-add-habit'); // Show first page by default
});

/**
 * Update the help text based on selected skip days
 */
function updateSkipDaysHelp(skipDays) {
    const helpText = document.getElementById('skip-days-help');
    if (helpText) {
        helpText.textContent = `Select exactly ${skipDays} day(s) to skip`;
    }
}

/**
 * Update the preview of selected days
 */
function updateSelectedDaysPreview() {
    const selectedCheckboxes = document.querySelectorAll('input[name="skip-specific-days"]:checked');
    const preview = document.getElementById('selected-days-preview');
    const listSpan = document.getElementById('selected-days-list');
    
    if (selectedCheckboxes.length > 0) {
        const dayNames = Array.from(selectedCheckboxes).map(cb => {
            return cb.value.charAt(0).toUpperCase() + cb.value.slice(1);
        });
        listSpan.textContent = dayNames.join(', ');
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

/**
 * Switch between pages
 */
function switchPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Remove active state from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    // Add active state to clicked nav link
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load page-specific content
    if (pageId === 'page-add-habit') {
        updateQuickStats();
    } else if (pageId === 'page-all-habits') {
        displayHabits();
    } else if (pageId === 'page-analytics') {
        loadAnalytics();
    } else if (pageId === 'page-weekly-progress') {
        loadWeeklyProgress();
    } else if (pageId === 'page-profile') {
        loadProfile();
    }
}

// ========== Habit Management ==========

/**
 * Add a new habit
 */
async function addHabit(e) {
    e.preventDefault();
    
    const habitName = habitInput.value.trim();
    let category = habitCategoryInput.value;
    const skipDaysElement = document.querySelector('input[name="skip-days"]:checked');
    const skipDays = skipDaysElement ? parseInt(skipDaysElement.value) : 0;
    const daysPerWeek = 7 - skipDays;
    
    // Get selected specific days to skip
    const selectedDays = Array.from(document.querySelectorAll('input[name="skip-specific-days"]:checked'))
        .map(cb => cb.value);
    
    // Validate that the number of selected days matches skip days count
    if (skipDays > 0 && selectedDays.length !== skipDays) {
        alert(`Please select exactly ${skipDays} day(s) to skip.`);
        return;
    }
    
    // Check if custom category is selected
    if (category === 'other') {
        const customCategoryInput = document.getElementById('custom-category-input');
        const customCategory = customCategoryInput ? customCategoryInput.value.trim() : '';
        if (customCategory) {
            category = customCategory.toLowerCase();
        } else {
            alert('Please enter a custom category name');
            return;
        }
    }
    
    if (habitName === '') {
        alert('Please enter a habit name');
        return;
    }
    
    console.log('Sending habit data:', { 
        name: habitName, 
        category, 
        daysPerWeek,
        skipDays: selectedDays 
    });
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: habitName, 
                category, 
                daysPerWeek,
                skipDays: selectedDays // Send array of day names to skip
            })
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (data.success) {
            habitInput.value = '';
            const customCategoryInput = document.getElementById('custom-category-input');
            if (customCategoryInput) customCategoryInput.value = '';
            document.getElementById('custom-category-group').style.display = 'none';
            habitCategoryInput.value = 'health'; // Reset to default
            // Reset skip days selection to 0
            const defaultSkipRadio = document.querySelector('input[name="skip-days"][value="0"]');
            if (defaultSkipRadio) defaultSkipRadio.checked = true;
            // Hide specific days group and clear selections
            const specificDaysGroup = document.getElementById('specific-days-group');
            if (specificDaysGroup) specificDaysGroup.style.display = 'none';
            document.querySelectorAll('input[name="skip-specific-days"]').forEach(cb => cb.checked = false);
            updateSelectedDaysPreview();
            await loadHabits();
            updateQuickStats();
            showMessage('Habit added successfully! 🎉', 'success');
        } else {
            console.error('Failed to create habit:', data);
            alert(data.message || 'Failed to add habit');
        }
    } catch (error) {
        console.error('Error adding habit:', error);
        alert(`Failed to add habit: ${error.message || 'Please try again.'}`);
    }
}

/**
 * Load all habits from the server
 */
async function loadHabits() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            habits = data.data;
        }
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

/**
 * Display habits list
 */
function displayHabits() {
    if (!habitsContainer) return;
    
    if (habits.length === 0) {
        habitsContainer.innerHTML = '<p class="no-habits">No habits yet. Add your first habit to get started! 🌟</p>';
        return;
    }
    
    habitsContainer.innerHTML = '';
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit);
        habitsContainer.appendChild(habitElement);
    });
    
    console.log('Habits displayed:', habits.length);
}

/**
 * Create habit element with weekly calendar
 */
function createHabitElement(habit) {
    const habitDiv = document.createElement('div');
    habitDiv.className = 'habit-item';
    
    // Check if today is completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = habit.completionHistory?.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });
    const isCompletedToday = todayEntry && todayEntry.status === 'completed';
    
    console.log(`Habit: ${habit.name}, Completed today: ${isCompletedToday}, Streak: ${habit.streak}`);
    
    // Get frequency display text
    const frequencyText = habit.daysPerWeek === 7 
        ? 'Daily' 
        : `${habit.daysPerWeek} days/week`;
    
    habitDiv.innerHTML = `
        <div class="habit-header">
            <div>
                <h3>${habit.name}</h3>
                <div class="habit-meta">
                    ${habit.category ? `<span class="category-tag">${habit.category}</span>` : ''}
                    <span class="frequency-tag">${frequencyText}</span>
                </div>
            </div>
            <div class="habit-stats">
                <span class="streak">🔥 ${habit.streak} day streak</span>
                <label class="checkbox-container">
                    <input 
                        type="checkbox" 
                        class="habit-checkbox" 
                        ${isCompletedToday ? 'checked' : ''}
                        onchange="toggleToday('${habit._id}', this.checked)"
                    >
                    <span class="checkbox-label">Complete Today</span>
                </label>
                <button class="btn-delete" onclick="deleteHabit('${habit._id}')">Delete</button>
            </div>
        </div>
        <div class="weekly-calendar" id="calendar-${habit._id}"></div>
    `;
    
    // Load weekly status for this habit
    loadWeeklyStatus(habit._id);
    
    return habitDiv;
}

/**
 * Load weekly status for a habit
 */
async function loadWeeklyStatus(habitId) {
    try {
        const response = await fetch(`${API_URL}/${habitId}/weekly`);
        const data = await response.json();
        
        if (data.success) {
            displayWeeklyCalendar(habitId, data.data.weekStatus);
        }
    } catch (error) {
        console.error('Error loading weekly status:', error);
    }
}

/**
 * Display weekly calendar
 */
function displayWeeklyCalendar(habitId, weekStatus) {
    const calendarDiv = document.getElementById(`calendar-${habitId}`);
    if (!calendarDiv) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    calendarDiv.innerHTML = '';
    
    weekStatus.forEach((day, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = `day-cell ${day.status}`;
        dayDiv.innerHTML = `
            <div class="day-name">${days[index]}</div>
            <div class="day-date">${day.dayOfMonth}</div>
        `;
        
        dayDiv.addEventListener('click', () => handleDayClick(habitId, day, index));
        calendarDiv.appendChild(dayDiv);
    });
}

/**
 * Handle day cell click
 */
async function handleDayClick(habitId, day, dayIndex) {
    const statusCycle = {
        'incomplete': 'completed',
        'completed': 'skipped',
        'skipped': 'incomplete'
    };
    
    const newStatus = statusCycle[day.status];
    
    try {
        const endpoint = newStatus === 'skipped' ? 
            `${API_URL}/${habitId}/skip` : 
            `${API_URL}/${habitId}/day`;
        
        const response = await fetch(endpoint, {
            method: newStatus === 'skipped' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                dayIndex,
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const oldHabit = habits.find(h => h._id === habitId);
            const oldStreak = oldHabit ? oldHabit.streak : 0;
            
            await loadHabits();
            loadWeeklyStatus(habitId);
            refreshWeeklyProgress(); // Refresh weekly progress if visible
            
            // Check for streak changes and show appropriate message
            const newHabit = habits.find(h => h._id === habitId);
            if (newHabit && newStatus === 'completed') {
                const streakGrew = newHabit.streak > oldStreak;
                showMotivationalMessage('completion', newHabit, streakGrew);
            } else if (newStatus === 'incomplete' && oldStreak > 0 && newHabit && newHabit.streak === 0) {
                // Streak was broken
                showMotivationalMessage('streak-break', newHabit);
            }
        } else {
            alert(data.message || 'Failed to update status');
        }
    } catch (error) {
        console.error('Error updating day status:', error);
        alert('Failed to update status. Please try again.');
    }
}

/**
 * Toggle habit completion for today
 */
async function toggleToday(habitId, isChecked) {
    console.log('toggleToday called:', habitId, isChecked);
    
    try {
        if (isChecked) {
            // Mark as complete
            console.log('Marking habit as complete...');
            const response = await fetch(`${API_URL}/${habitId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('Success! Reloading habits...');
                
                // Check if streak increased (first completion or streak grew)
                const oldHabit = habits.find(h => h._id === habitId);
                await loadHabits();
                const newHabit = habits.find(h => h._id === habitId);
                
                displayHabits();
                if (document.getElementById('page-add-habit').classList.contains('active')) {
                    updateQuickStats();
                }
                if (document.getElementById('page-analytics').classList.contains('active')) {
                    loadAnalytics();
                }
                refreshWeeklyProgress(); // Refresh weekly progress if visible
                
                // Show encouraging message with streak info
                const streakGrew = !oldHabit || (newHabit && newHabit.streak > oldHabit.streak);
                showMotivationalMessage('completion', newHabit, streakGrew);
            } else {
                console.error('Failed to mark habit:', data.message);
                // Uncheck the checkbox if it failed
                await loadHabits();
                displayHabits();
                alert(data.message || 'Failed to mark habit');
            }
        } else {
            // Unmark (uncomplete)
            console.log('Unmarking habit...');
            const response = await fetch(`${API_URL}/${habitId}/uncomplete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('Success! Reloading habits...');
                await loadHabits();
                displayHabits();
                if (document.getElementById('page-add-habit').classList.contains('active')) {
                    updateQuickStats();
                }
                if (document.getElementById('page-analytics').classList.contains('active')) {
                    loadAnalytics();
                }
                refreshWeeklyProgress(); // Refresh weekly progress if visible
                showMessage('↩️ Habit unmarked for today', 'info');
            } else {
                console.error('Failed to unmark habit:', data.message);
                // Re-check the checkbox if it failed
                await loadHabits();
                displayHabits();
                alert(data.message || 'Failed to unmark habit');
            }
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
        console.error('Error stack:', error.stack);
        alert('Failed to update habit: ' + error.message);
        // Reload to reset checkbox state
        await loadHabits();
        displayHabits();
    }
}

/**
 * Delete a habit
 */
async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${habitId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            displayHabits();
            showMessage('Habit deleted', 'info');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit.');
    }
}

// ========== Analytics ==========

/**
 * Update quick stats on add habit page
 */
async function updateQuickStats() {
    await loadHabits();
    
    const totalHabits = habits.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let activeToday = 0;
    let longestStreak = 0;
    
    habits.forEach(habit => {
        const todayEntry = habit.completionHistory?.find(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
        
        if (todayEntry && todayEntry.status === 'completed') {
            activeToday++;
        }
        
        if (habit.streak > longestStreak) {
            longestStreak = habit.streak;
        }
    });
    
    document.getElementById('total-habits').textContent = totalHabits;
    document.getElementById('active-today').textContent = activeToday;
    document.getElementById('longest-streak').textContent = longestStreak;
}

/**
 * Load and display analytics
 */
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics/daily`);
        const data = await response.json();
        
        if (data.success) {
            displayDailyAnalytics(data.data);
        }
        
        // Load weekly overview chart
        await renderWeeklyOverviewChart();
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

/**
 * Render weekly overview chart - all habits combined
 */
async function renderWeeklyOverviewChart() {
    const ctx = document.getElementById('weeklyOverviewChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (weeklyOverviewChart) {
        weeklyOverviewChart.destroy();
    }
    
    // Get current week's data
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completedData = [];
    const skippedData = [];
    const missedData = [];
    
    // Aggregate data for each day of the week
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);
        
        // Don't count future days
        if (checkDate > today) {
            completedData.push(0);
            skippedData.push(0);
            missedData.push(0);
            continue;
        }
        
        let dayCompleted = 0;
        let daySkipped = 0;
        let dayMissed = 0;
        
        habits.forEach(habit => {
            // Check if this day should be tracked (not a skip day)
            const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
            const shouldSkip = habit.skipDays && habit.skipDays.includes(dayName);
            
            if (!shouldSkip) {
                // Find entry for this date
                const entry = habit.completionHistory?.find(e => {
                    const d = new Date(e.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === checkDate.getTime();
                });
                
                if (entry) {
                    if (entry.status === 'completed') {
                        dayCompleted++;
                    } else if (entry.status === 'skipped') {
                        daySkipped++;
                    } else {
                        dayMissed++;
                    }
                } else {
                    dayMissed++;
                }
            }
        });
        
        completedData.push(dayCompleted);
        skippedData.push(daySkipped);
        missedData.push(dayMissed);
    }
    
    weeklyOverviewChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dayLabels,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: 'rgba(74, 222, 128, 0.8)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: 'Skipped',
                    data: skippedData,
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                    borderColor: 'rgb(245, 158, 11)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: 'Missed',
                    data: missedData,
                    backgroundColor: 'rgba(252, 165, 165, 0.8)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Number of Habits'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return 'Total: ' + total + ' habits';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Display daily analytics
 */
function displayDailyAnalytics(analytics) {
    const { completed, skipped, notDone, total, completionRate, categoryStats } = analytics;
    
    // Update status breakdown
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('completed-percentage').textContent = 
        `${total > 0 ? Math.round((completed / total) * 100) : 0}%`;
    
    document.getElementById('skipped-count').textContent = skipped;
    document.getElementById('skipped-percentage').textContent = 
        `${total > 0 ? Math.round((skipped / total) * 100) : 0}%`;
    
    document.getElementById('notdone-count').textContent = notDone;
    document.getElementById('notdone-percentage').textContent = 
        `${total > 0 ? Math.round((notDone / total) * 100) : 0}%`;
    
    // Render daily completion chart (doughnut)
    renderDailyCompletionChart(completed, notDone, total);
    
    // Render category chart (bar)
    renderCategoryChart(categoryStats);
}

/**
 * Render daily completion chart
 */
function renderDailyCompletionChart(completed, notDone, total) {
    const ctx = document.getElementById('dailyCompletionChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    dailyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Not Done'],
            datasets: [{
                data: [completed, notDone],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(156, 163, 175)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: `${total > 0 ? Math.round((completed / total) * 100) : 0}% Complete Today`
                }
            }
        }
    });
}

/**
 * Render category chart
 */
function renderCategoryChart(categoryStats) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const categories = Object.keys(categoryStats);
    const completionRates = categories.map(cat => {
        const { completed, total } = categoryStats[cat];
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionRates,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Category Performance'
                }
            }
        }
    });
}

// ========== Weekly Progress ==========

/**
 * Load and display weekly progress
 */
async function loadWeeklyProgress() {
    try {
        const response = await fetch(`${API_URL}/analytics/weekly`);
        const data = await response.json();
        
        if (data.success) {
            displayWeeklyProgress(data.data);
        }
    } catch (error) {
        console.error('Error loading weekly progress:', error);
    }
}

/**
 * Refresh weekly progress if on that page
 */
function refreshWeeklyProgress() {
    const weeklyPage = document.getElementById('page-weekly-progress');
    if (weeklyPage && weeklyPage.classList.contains('active')) {
        loadWeeklyProgress();
    }
}

/**
 * Refresh weekly progress if on that page
 */
function refreshWeeklyProgress() {
    const weeklyPage = document.getElementById('page-weekly-progress');
    if (weeklyPage && weeklyPage.classList.contains('active')) {
        loadWeeklyProgress();
    }
}

/**
 * Display weekly progress for all habits
 */
function displayWeeklyProgress(weeklyData) {
    const container = document.getElementById('weekly-progress-container');
    if (!container) return;
    
    if (weeklyData.length === 0) {
        container.innerHTML = '<p class="no-habits">No habits to show. Add habits to see weekly progress.</p>';
        return;
    }
    
    container.innerHTML = '';
    weeklyData.forEach(habit => {
        const card = createWeeklyHabitCard(habit);
        container.appendChild(card);
    });
}

/**
 * Create weekly habit card with chart
 */
function createWeeklyHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'weekly-habit-card';
    card.setAttribute('data-habit-id', habit._id);
    
    // Calculate consistency percentage based on daysPerWeek target
    const targetDays = habit.daysPerWeek || 7;
    const completedDays = habit.completed;
    const skippedDays = habit.skipped;
    const totalDone = completedDays + skippedDays; // Skipped counts as done
    const consistencyPercentage = Math.round((totalDone / targetDays) * 100);
    
    // Calculate allowed skips (7 - targetDays)
    const allowedSkips = 7 - targetDays;
    
    // Determine consistency status color
    let consistencyClass = 'low';
    if (consistencyPercentage >= 90) consistencyClass = 'excellent';
    else if (consistencyPercentage >= 75) consistencyClass = 'good';
    else if (consistencyPercentage >= 50) consistencyClass = 'moderate';
    
    card.innerHTML = `
        <div class="weekly-card-header">
            <div class="habit-info">
                <h3>${habit.name}</h3>
                <div class="habit-tags">
                    ${habit.category ? `<span class="category-tag">${habit.category}</span>` : ''}
                    <span class="frequency-tag">${targetDays} days/week</span>
                </div>
            </div>
            <div class="consistency-circle ${consistencyClass}">
                <svg viewBox="0 0 100 100">
                    <circle class="circle-bg" cx="50" cy="50" r="40"></circle>
                    <circle class="circle-progress" cx="50" cy="50" r="40" 
                        style="stroke-dashoffset: ${251.2 - (251.2 * consistencyPercentage) / 100};"></circle>
                </svg>
                <div class="consistency-text">
                    <div class="percentage">${consistencyPercentage}%</div>
                    <div class="label">Consistency</div>
                </div>
            </div>
        </div>
        <div class="weekly-stats">
            <div class="stat-item">
                <span class="stat-icon">✅</span>
                <div>
                    <span class="stat-label">Completed</span>
                    <span class="stat-value">${completedDays}/${targetDays}</span>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-icon">⏭️</span>
                <div>
                    <span class="stat-label">Skipped</span>
                    <span class="stat-value">${skippedDays}/${allowedSkips}</span>
                </div>
            </div>
            <div class="stat-item">
                <span class="stat-icon">🔥</span>
                <div>
                    <span class="stat-label">Current Streak</span>
                    <span class="stat-value">${habit.streak}</span>
                </div>
            </div>
        </div>
        <div class="weekly-chart-container">
            <canvas id="weekly-chart-${habit._id}"></canvas>
        </div>
    `;
    
    // Render chart after card is added to DOM
    setTimeout(() => {
        renderWeeklyChart(habit);
    }, 100);
    
    return card;
}

/**
 * Render weekly progress chart for a habit
 */
function renderWeeklyChart(habit) {
    const ctx = document.getElementById(`weekly-chart-${habit._id}`);
    if (!ctx) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completionData = habit.weekStatus.map(day => {
        if (day.status === 'completed') return 100;
        if (day.status === 'skipped') return 50;
        return 0;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Completion',
                data: completionData,
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: habit.weekStatus.map(day => {
                    if (day.status === 'completed') return 'rgb(34, 197, 94)'; // Green
                    if (day.status === 'skipped') return 'rgb(234, 179, 8)'; // Yellow
                    return 'rgb(239, 68, 68)'; // Red
                }),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutCubic'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 12
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const status = habit.weekStatus[context.dataIndex].status;
                            if (status === 'completed') return '✅ Completed';
                            if (status === 'skipped') return '⏭️ Skipped';
                            return '❌ Missed';
                        }
                    }
                }
            }
        }
    });
}

// ========== Utility Functions ==========

// Store current user data
let currentUserData = null;

/**
 * Load and display user profile
 */
async function loadProfile() {
    const loadingDiv = document.querySelector('.profile-loading');
    const contentDiv = document.querySelector('.profile-content');
    
    try {
        const response = await fetch('/auth/profile');
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUserData = data.user;
            updateProfileDisplay(data.user);
            updateNavProfileIcon(data.user);
            
            // Load profile statistics
            await loadProfileStats();
            
            // Update badges and achievements
            updateBadges();
            updateAchievements();
            
            // Show content, hide loading
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        loadingDiv.innerHTML = '<p class="error-text">❌ Failed to load profile. Please try again.</p>';
    }
}

/**
 * Load profile statistics
 */
async function loadProfileStats() {
    try {
        // Get all habits
        await loadHabits();
        
        // Calculate statistics
        const totalHabits = habits.length;
        
        // Count completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let completedToday = 0;
        let currentStreak = 0;
        let bestStreak = 0;
        
        habits.forEach(habit => {
            // Check if completed today
            const todayEntry = habit.completionHistory?.find(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            
            if (todayEntry && todayEntry.status === 'completed') {
                completedToday++;
            }
            
            // Track best streak
            if (habit.streak > bestStreak) {
                bestStreak = habit.streak;
            }
            
            // Calculate average current streak
            currentStreak += habit.streak;
        });
        
        currentStreak = totalHabits > 0 ? Math.round(currentStreak / totalHabits) : 0;
        
        // Calculate weekly completion rate
        const weeklyCompletion = await calculateWeeklyCompletion();
        
        // Calculate days since joining
        const daysActive = currentUserData ? 
            Math.floor((new Date() - new Date(currentUserData.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
        
        // Update stats display
        document.getElementById('stat-total-habits').textContent = totalHabits;
        document.getElementById('stat-completed-today').textContent = completedToday;
        document.getElementById('stat-current-streak').textContent = currentStreak;
        document.getElementById('stat-best-streak').textContent = bestStreak;
        document.getElementById('stat-weekly-completion').textContent = weeklyCompletion + '%';
        document.getElementById('stat-days-active').textContent = daysActive;
        
    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

/**
 * Calculate weekly completion percentage
 */
async function calculateWeeklyCompletion() {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    let totalRequired = 0;
    let totalCompleted = 0;
    
    habits.forEach(habit => {
        // Count days in this week
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(weekStart);
            checkDate.setDate(weekStart.getDate() + i);
            
            // Only count up to today
            if (checkDate > today) break;
            
            // Check if this day should be tracked (not a skip day)
            const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
            const shouldSkip = habit.skipDays && habit.skipDays.includes(dayName);
            
            if (!shouldSkip) {
                totalRequired++;
                
                // Check if completed
                const entry = habit.completionHistory?.find(e => {
                    const d = new Date(e.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === checkDate.getTime();
                });
                
                if (entry && entry.status === 'completed') {
                    totalCompleted++;
                }
            }
        }
    });
    
    return totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
}

/**
 * Initialize and display badge system
 */
function updateBadges() {
    const badgesMilestones = [
        { days: 7, icon: '🌟', name: 'Week Warrior', color: 'badge-7' },
        { days: 21, icon: '💎', name: 'Habit Builder', color: 'badge-21' },
        { days: 30, icon: '🎯', name: 'Month Master', color: 'badge-30' },
        { days: 50, icon: '🔥', name: 'Streak Legend', color: 'badge-50' },
        { days: 100, icon: '👑', name: 'Century Champion', color: 'badge-100' }
    ];
    
    // Get best streak from habits
    let bestStreak = 0;
    habits.forEach(habit => {
        if (habit.streak > bestStreak) {
            bestStreak = habit.streak;
        }
    });
    
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = '';
    
    // Check for newly unlocked badges
    const previousBadges = JSON.parse(localStorage.getItem('unlockedBadges') || '[]');
    const currentUnlocked = [];
    
    badgesMilestones.forEach(badge => {
        const isUnlocked = bestStreak >= badge.days;
        const wasJustUnlocked = isUnlocked && !previousBadges.includes(badge.days);
        
        if (isUnlocked) {
            currentUnlocked.push(badge.days);
        }
        
        const badgeItem = document.createElement('div');
        badgeItem.className = `badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'} ${badge.color} ${wasJustUnlocked ? 'badge-just-unlocked' : ''}`;
        
        badgeItem.innerHTML = `
            <div class="badge-circle">
                <div class="badge-icon">${badge.icon}</div>
                ${!isUnlocked ? '<div class="badge-lock">🔒</div>' : ''}
            </div>
            <div class="badge-info">
                <div class="badge-name">${badge.name}</div>
                <div class="badge-days">${badge.days} Day${badge.days > 1 ? 's' : ''}</div>
                <div class="badge-status">
                    ${isUnlocked ? '✓ Earned' : 'Locked'}
                </div>
            </div>
        `;
        
        // Add tooltip
        if (isUnlocked) {
            badgeItem.title = `🎉 Earned on reaching ${badge.days}-day streak!`;
        } else {
            const daysNeeded = badge.days - bestStreak;
            badgeItem.title = `${daysNeeded} more day${daysNeeded > 1 ? 's' : ''} to unlock!`;
        }
        
        badgesContainer.appendChild(badgeItem);
        
        // Show notification for newly unlocked badge
        if (wasJustUnlocked) {
            setTimeout(() => {
                showBadgeUnlockNotification(badge);
            }, 500);
        }
    });
    
    // Save current unlocked badges
    localStorage.setItem('unlockedBadges', JSON.stringify(currentUnlocked));
}

/**
 * Show badge unlock notification
 */
function showBadgeUnlockNotification(badge) {
    // Create notification overlay
    const notification = document.createElement('div');
    notification.className = 'badge-unlock-notification';
    notification.innerHTML = `
        <div class="badge-unlock-content">
            <div class="badge-unlock-icon">${badge.icon}</div>
            <h2 class="badge-unlock-title">🎉 Badge Unlocked!</h2>
            <p class="badge-unlock-name">${badge.name}</p>
            <p class="badge-unlock-desc">${badge.days}-day streak achieved!</p>
            <button class="btn-badge-close" onclick="this.parentElement.parentElement.remove()">Continue</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Update achievements display
 */
function updateAchievements() {
    const achievements = [
        {
            id: 'first-habit',
            icon: '🌱',
            name: 'First Habit',
            desc: 'Create your first habit',
            unlocked: habits.length >= 1
        },
        {
            id: 'streak-master',
            icon: '⚡',
            name: 'Streak Master',
            desc: 'Maintain a 7-day streak',
            unlocked: habits.some(h => h.streak >= 7)
        },
        {
            id: 'dedicated',
            icon: '💪',
            name: 'Dedicated',
            desc: 'Complete 30 habits',
            unlocked: getTotalCompletions() >= 30
        },
        {
            id: 'perfect-week',
            icon: '🎯',
            name: 'Perfect Week',
            desc: 'Complete all habits for a week',
            unlocked: checkPerfectWeek()
        },
        {
            id: 'on-fire',
            icon: '🔥',
            name: 'On Fire!',
            desc: '30-day streak achieved',
            unlocked: habits.some(h => h.streak >= 30)
        },
        {
            id: 'habit-king',
            icon: '👑',
            name: 'Habit King',
            desc: 'Track 10+ habits',
            unlocked: habits.length >= 10
        }
    ];
    
    const achievementsGrid = document.getElementById('achievements-grid');
    achievementsGrid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        
        if (achievement.unlocked) {
            card.title = 'Achievement Unlocked! 🎉';
        } else {
            card.title = 'Keep going to unlock this achievement!';
        }
        
        achievementsGrid.appendChild(card);
    });
}

/**
 * Get total habit completions
 */
function getTotalCompletions() {
    let total = 0;
    habits.forEach(habit => {
        if (habit.completionHistory) {
            total += habit.completionHistory.filter(e => e.status === 'completed').length;
        }
    });
    return total;
}

/**
 * Check if user has completed a perfect week
 */
function checkPerfectWeek() {
    if (habits.length === 0) return false;
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    
    // Check last 4 weeks for a perfect week
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const checkWeekStart = new Date(weekStart);
        checkWeekStart.setDate(weekStart.getDate() - (weekOffset * 7));
        
        let isPerfectWeek = true;
        
        // Check each habit
        for (const habit of habits) {
            // Check each day of the week
            for (let i = 0; i < 7; i++) {
                const checkDate = new Date(checkWeekStart);
                checkDate.setDate(checkWeekStart.getDate() + i);
                
                // Skip if future date
                if (checkDate > today) continue;
                
                // Check if this day should be tracked
                const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][checkDate.getDay()];
                const shouldSkip = habit.skipDays && habit.skipDays.includes(dayName);
                
                if (!shouldSkip) {
                    // Check if completed
                    const entry = habit.completionHistory?.find(e => {
                        const d = new Date(e.date);
                        d.setHours(0, 0, 0, 0);
                        return d.getTime() === checkDate.getTime();
                    });
                    
                    if (!entry || entry.status !== 'completed') {
                        isPerfectWeek = false;
                        break;
                    }
                }
            }
            
            if (!isPerfectWeek) break;
        }
        
        if (isPerfectWeek) return true;
    }
    
    return false;
}

/**
 * Update profile display with user data
 */
function updateProfileDisplay(user) {
    // Update avatar
    const avatarDiv = document.getElementById('profile-avatar');
    const avatarText = avatarDiv.querySelector('.avatar-text');
    
    if (user.photoURL) {
        avatarDiv.style.backgroundImage = `url(${user.photoURL})`;
        avatarDiv.style.backgroundSize = 'cover';
        avatarDiv.style.backgroundPosition = 'center';
        avatarText.textContent = '';
    } else {
        // Show default user icon
        avatarDiv.style.backgroundImage = 'none';
        avatarDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        avatarText.textContent = '👤';
        avatarText.style.fontSize = '4rem';
    }
    
    // Update profile info
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email || 'No email provided';
    document.getElementById('profile-userId').textContent = user.userId;
    
    // Update about section
    const aboutDiv = document.getElementById('profile-about');
    if (user.about && user.about.trim()) {
        aboutDiv.textContent = user.about;
        aboutDiv.style.display = 'block';
    } else {
        aboutDiv.textContent = 'No bio added yet. Click "Edit Profile" to add one!';
        aboutDiv.style.fontStyle = 'italic';
        aboutDiv.style.color = '#94a3b8';
    }
    
    // Update auth provider
    const authProviderDiv = document.getElementById('profile-authProvider');
    if (user.authProvider === 'google') {
        authProviderDiv.innerHTML = '<span class="badge-google">🔐 Google Sign-In</span>';
    } else {
        authProviderDiv.innerHTML = '<span class="badge-local">🔑 Password</span>';
    }
    
    // Update member since
    const createdDate = new Date(user.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('profile-createdAt').textContent = createdDate.toLocaleDateString('en-US', options);
}

/**
 * Update navigation profile icon
 */
function updateNavProfileIcon(user) {
    const navIcon = document.getElementById('nav-profile-icon');
    const iconText = navIcon.querySelector('.profile-icon-text');
    
    if (user.photoURL) {
        navIcon.style.backgroundImage = `url(${user.photoURL})`;
        navIcon.style.backgroundSize = 'cover';
        navIcon.style.backgroundPosition = 'center';
        navIcon.style.background = '';
        iconText.textContent = '';
    } else {
        // Show default user icon
        navIcon.style.backgroundImage = 'none';
        navIcon.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
        iconText.textContent = '👤';
        iconText.style.fontSize = '1.8rem';
        iconText.style.webkitBackgroundClip = 'unset';
        iconText.style.webkitTextFillColor = 'unset';
        iconText.style.filter = 'grayscale(20%)';
    }
}

/**
 * Enter edit mode
 */
function enterEditMode() {
    if (!currentUserData) return;
    
    document.getElementById('profile-view-mode').style.display = 'none';
    document.getElementById('profile-edit-mode').style.display = 'block';
    
    // Populate edit form
    document.getElementById('name-input').value = currentUserData.name;
    document.getElementById('photoURL-input').value = currentUserData.photoURL || '';
    document.getElementById('about-input').value = currentUserData.about || '';
    
    // Update avatar preview
    const avatarEditDiv = document.getElementById('profile-avatar-edit');
    const avatarEditText = avatarEditDiv.querySelector('.avatar-text-edit');
    
    if (currentUserData.photoURL) {
        avatarEditDiv.style.backgroundImage = `url(${currentUserData.photoURL})`;
        avatarEditDiv.style.backgroundSize = 'cover';
        avatarEditDiv.style.backgroundPosition = 'center';
        avatarEditDiv.style.background = '';
        avatarEditText.textContent = '';
    } else {
        // Show default user icon
        avatarEditDiv.style.backgroundImage = 'none';
        avatarEditDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        avatarEditText.textContent = '👤';
        avatarEditText.style.fontSize = '4rem';
    }
    
    updateCharCount();
    
    // Add event listeners
    document.getElementById('about-input').addEventListener('input', updateCharCount);
    document.getElementById('photoURL-input').addEventListener('input', previewPhotoURL);
    document.getElementById('profile-edit-form').addEventListener('submit', saveProfile);
}

/**
 * Cancel edit mode
 */
function cancelEditMode() {
    document.getElementById('profile-edit-mode').style.display = 'none';
    document.getElementById('profile-view-mode').style.display = 'block';
}

/**
 * Update character count
 */
function updateCharCount() {
    const aboutInput = document.getElementById('about-input');
    const charCount = document.getElementById('about-char-count');
    charCount.textContent = aboutInput.value.length;
}

/**
 * Preview photo URL
 */
function previewPhotoURL() {
    const photoURL = document.getElementById('photoURL-input').value.trim();
    const avatarEditDiv = document.getElementById('profile-avatar-edit');
    const avatarEditText = avatarEditDiv.querySelector('.avatar-text-edit');
    
    if (photoURL) {
        avatarEditDiv.style.backgroundImage = `url(${photoURL})`;
        avatarEditDiv.style.backgroundSize = 'cover';
        avatarEditDiv.style.backgroundPosition = 'center';
        avatarEditDiv.style.background = '';
        avatarEditText.textContent = '';
    } else {
        // Show default user icon
        avatarEditDiv.style.backgroundImage = 'none';
        avatarEditDiv.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        avatarEditText.textContent = '👤';
        avatarEditText.style.fontSize = '4rem';
    }
}

/**
 * Save profile changes
 */
async function saveProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('name-input').value.trim();
    const photoURL = document.getElementById('photoURL-input').value.trim();
    const about = document.getElementById('about-input').value.trim();
    
    if (!name) {
        alert('Name is required');
        return;
    }
    
    try {
        const response = await fetch('/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, photoURL, about })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUserData = data.user;
            updateProfileDisplay(data.user);
            updateNavProfileIcon(data.user);
            
            // Reload stats and achievements
            await loadProfileStats();
            updateAchievements();
            
            cancelEditMode();
            showSuccessMessage('✅ Profile updated successfully!');
        } else {
            alert('❌ ' + (data.message || 'Failed to update profile'));
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('❌ Failed to update profile. Please try again.');
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #34D399, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(52, 211, 153, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    // Simple alert for now, could be replaced with a toast notification
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${emoji} ${message}`);
}

/**
 * Get random message from array
 */
function getRandomMessage(messagesArray) {
    return messagesArray[Math.floor(Math.random() * messagesArray.length)];
}

/**
 * Show motivational message based on action
 */
function showMotivationalMessage(type, habit = null, streakGrew = false) {
    let message = '';
    let extraInfo = '';
    let messageColor = '';
    
    if (type === 'completion') {
        message = getRandomMessage(COMPLETION_MESSAGES);
        messageColor = 'linear-gradient(135deg, #34D399, #059669)';
        
        if (habit && habit.streak > 0) {
            if (streakGrew) {
                extraInfo = `🔥 ${habit.streak} day streak!`;
                if (habit.streak === 7) extraInfo += ' 🎉 One week!';
                if (habit.streak === 30) extraInfo += ' 🏆 One month!';
                if (habit.streak === 100) extraInfo += ' 👑 Century!';
            } else {
                extraInfo = `Streak: ${habit.streak} days`;
            }
        }
    } else if (type === 'missed') {
        message = getRandomMessage(SUPPORT_MESSAGES);
        messageColor = 'linear-gradient(135deg, #F59E0B, #D97706)';
        extraInfo = 'Take it easy on yourself 💙';
    } else if (type === 'streak-break') {
        message = getRandomMessage(STREAK_BREAK_MESSAGES);
        messageColor = 'linear-gradient(135deg, #8B5CF6, #7C3AED)';
        extraInfo = "What matters is that you're here now 🌟";
    } else if (type === 'return') {
        message = getRandomMessage(ENCOURAGEMENT_ON_RETURN);
        messageColor = 'linear-gradient(135deg, #3B82F6, #2563EB)';
        extraInfo = "Let's make today count! 💪";
    }
    
    displayMotivationalToast(message, extraInfo, messageColor);
}

/**
 * Display motivational toast notification
 */
function displayMotivationalToast(message, extraInfo = '', bgColor = '') {
    const toast = document.createElement('div');
    toast.className = 'motivational-toast';
    
    const backgroundColor = bgColor || 'linear-gradient(135deg, #667eea, #764ba2)';
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-message">${message}</div>
            ${extraInfo ? `<div class="toast-extra">${extraInfo}</div>` : ''}
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 20px 28px;
        border-radius: 16px;
        font-weight: 600;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        z-index: 10000;
        animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 400px;
        font-size: 1.1rem;
        line-height: 1.5;
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    });
}

/**
 * Detect missed habits and show supportive messages
 */
async function checkForMissedHabits() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let missedCount = 0;
    let streaksBroken = 0;
    
    habits.forEach(habit => {
        // Check if yesterday should have been tracked
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][yesterday.getDay()];
        const shouldSkip = habit.skipDays && habit.skipDays.includes(dayName);
        
        if (!shouldSkip) {
            // Check if yesterday was completed
            const yesterdayEntry = habit.completionHistory?.find(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === yesterday.getTime();
            });
            
            if (!yesterdayEntry || yesterdayEntry.status === 'incomplete') {
                missedCount++;
                
                // Check if this broke a streak
                if (habit.streak === 0 && habit.completionHistory?.some(e => e.status === 'completed')) {
                    streaksBroken++;
                }
            }
        }
    });
    
    return { missedCount, streaksBroken };
}

/**
 * Show welcome back message for returning users
 */
function checkAndShowReturnMessage() {
    const lastVisit = localStorage.getItem('lastVisitDate');
    const today = new Date().toDateString();
    
    if (lastVisit && lastVisit !== today) {
        const lastVisitDate = new Date(lastVisit);
        const daysSinceVisit = Math.floor((new Date() - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceVisit >= 2) {
            // User hasn't visited in 2+ days, show welcoming message
            setTimeout(() => {
                showMotivationalMessage('return');
            }, 1000);
        }
    }
    
    // Update last visit
    localStorage.setItem('lastVisitDate', today);
}
