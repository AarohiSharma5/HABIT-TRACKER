/**
 * Habit Tracker JavaScript - Client Side
 * Multi-page navigation with analytics and charts
 */

// ========== Global Variables ==========
let habits = [];
let dailyChart = null;
let categoryChart = null;
const API_URL = '/api/habits';

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
    loadHabits();
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
            await loadHabits();
            loadWeeklyStatus(habitId);
            refreshWeeklyProgress(); // Refresh weekly progress if visible
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
                await loadHabits();
                displayHabits();
                if (document.getElementById('page-add-habit').classList.contains('active')) {
                    updateQuickStats();
                }
                if (document.getElementById('page-analytics').classList.contains('active')) {
                    loadAnalytics();
                }                refreshWeeklyProgress(); // Refresh weekly progress if visible                showMessage('✅ Habit marked complete for today!', 'success');
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
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
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
            cancelEditMode();
            alert('✅ Profile updated successfully!');
        } else {
            alert('❌ ' + (data.message || 'Failed to update profile'));
        }
    } catch (error) {
        console.error('Profile update error:', error);
        alert('❌ Failed to update profile. Please try again.');
    }
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
