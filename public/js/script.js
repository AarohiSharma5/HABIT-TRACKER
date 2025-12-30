/**
 * Habit Tracker JavaScript - Client Side
 * Multi-page navigation with analytics and charts
 */

// ========== Global Variables ==========
const API_URL = '/api/habits';
let habits = [];
let currentUser = null; // Store current user profile data
let userSignupDate = null; // Store user signup date for filtering pre-signup days
let activeTimers = {}; // Store active timers: { habitId: { startTime, intervalId, notified } }
let dailyChart = null;
let categoryChart = null;
let weeklyOverviewChart = null;
let timerInterval = null;
let notificationSound = null;

// Initialize notification sound
try {
    notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDKE0fPTgjMGHm7A7+OZURE=');
    notificationSound.volume = 0.5;
} catch (e) {
    console.warn('Audio notification not available:', e);
}

// ========== Page Navigation Functions ==========

/**
 * Setup mobile hamburger menu functionality
 */
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (!hamburger || !navMenu || !overlay) return;
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMobileMenu);
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

/**
 * Toggle mobile menu open/close
 */
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    const isOpen = navMenu.classList.contains('active');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

/**
 * Switch between different pages
 */
function switchPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Load page-specific content
    if (pageId === 'page-analytics') {
        loadAnalytics();
    } else if (pageId === 'page-weekly-progress') {
        loadWeeklyProgress();
    } else if (pageId === 'page-profile') {
        loadProfile();
    } else if (pageId === 'page-all-habits') {
        displayHabits();
    } else if (pageId === 'page-add-habit') {
        updateQuickStats();
    } else if (pageId === 'page-yearly-view') {
        loadYearlyView();
    }
}

// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', async () => {
    await loadHabits();
    updateQuickStats();
    displayHabits();
    
    // Load user profile to update navbar icon
    await loadUserProfileForNav();
    
    // Check for honesty review after page load
    setTimeout(() => checkForHonestyReview(), 1000);
    
    // Setup navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            switchPage(pageId);
            
            // Close mobile menu when a link is clicked
            closeMobileMenu();
        });
    });
    
    // Setup mobile hamburger menu
    setupMobileMenu();
    
    // Setup form submission
    const habitForm = document.getElementById('habit-form');
    if (habitForm) {
        habitForm.addEventListener('submit', addHabit);
    }
    
    // Setup edit habit form submission
    const editHabitForm = document.getElementById('edit-habit-form');
    if (editHabitForm) {
        editHabitForm.addEventListener('submit', saveEditedHabit);
    }
    
    // Setup skip days selection handler
    const skipDaysRadios = document.querySelectorAll('input[name="skip-days"]');
    const specificDaysGroup = document.getElementById('specific-days-group');
    const skipDaysHelp = document.getElementById('skip-days-help');
    const dayCheckboxes = document.querySelectorAll('input[name="skip-specific-days"]');
    
    // Add checkbox listeners once (not inside radio handler)
    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedRadio = document.querySelector('input[name="skip-days"]:checked');
            const maxSkipDays = parseInt(selectedRadio.value);
            const checkedBoxes = document.querySelectorAll('input[name="skip-specific-days"]:checked');
            
            // Enforce selection limit
            if (checkedBoxes.length > maxSkipDays) {
                checkbox.checked = false;
                showMessage(`You can only select ${maxSkipDays} day${maxSkipDays > 1 ? 's' : ''} to skip`, 'info');
            }
            
            // Update preview
            updateSkipDaysPreview();
        });
    });
    
    skipDaysRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const skipCount = parseInt(e.target.value);
            if (skipCount > 0) {
                specificDaysGroup.style.display = 'block';
                skipDaysHelp.textContent = `Select exactly ${skipCount} day${skipCount > 1 ? 's' : ''} to skip`;
                
                // Clear previous selections
                dayCheckboxes.forEach(cb => cb.checked = false);
                updateSkipDaysPreview();
            } else {
                specificDaysGroup.style.display = 'none';
                // Clear selections
                dayCheckboxes.forEach(cb => cb.checked = false);
                updateSkipDaysPreview();
            }
        });
    });
    
    // Setup category selection handler
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
    
    // Setup routine generation checkbox handler
    const routineCheckbox = document.getElementById('generate-routine-on-create');
    const routinePromptSection = document.getElementById('routine-prompt-section');
    
    if (routineCheckbox && routinePromptSection) {
        routineCheckbox.addEventListener('change', () => {
            if (routineCheckbox.checked) {
                routinePromptSection.style.display = 'block';
            } else {
                routinePromptSection.style.display = 'none';
            }
        });
    }
    
    // Setup profile edit form submission
    const profileEditForm = document.getElementById('profile-edit-form');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', saveProfile);
    }
    
    switchPage('page-add-habit');
});

// ========== API Functions ==========

/**
 * Load all habits from server
 */
async function loadHabits() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            habits = data.habits;
            
            // Store user signup date for pre-signup filtering
            if (data.userCreatedAt) {
                userSignupDate = new Date(data.userCreatedAt);
                userSignupDate.setHours(0, 0, 0, 0);
                console.log('[Habit Tracker] User signup date:', userSignupDate.toISOString());
            }
            
            // Clean up orphaned timers (timers for habits that are no longer in-progress)
            Object.keys(activeTimers).forEach(habitId => {
                const habit = habits.find(h => h._id === habitId);
                if (!habit || habit.status !== 'in-progress') {
                    // Habit doesn't exist or is no longer in-progress, clean up timer
                    clearInterval(activeTimers[habitId].intervalId);
                    delete activeTimers[habitId];
                }
            });
        }
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

/**
 * Add new habit
 */
async function addHabit(e) {
    e.preventDefault();
    
    const name = document.getElementById('habit-input').value.trim();
    const description = document.getElementById('habit-description').value.trim();
    const category = document.getElementById('habit-category').value;
    const customCategory = document.getElementById('custom-category-input').value.trim();
    const skipDaysValue = parseInt(document.querySelector('input[name="skip-days"]:checked').value);
    const minimumDuration = document.getElementById('minimum-duration').value;
    const accountabilityMode = document.getElementById('accountability-mode').checked;
    const generateRoutine = document.getElementById('generate-routine-on-create').checked;
    const routinePrompt = document.getElementById('initial-routine-prompt').value.trim();
    
    // Get selected skip days
    const skipDays = [];
    const skipDaysCheckboxes = document.querySelectorAll('input[name="skip-specific-days"]:checked');
    skipDaysCheckboxes.forEach(checkbox => skipDays.push(checkbox.value));
    
    if (!name) {
        showMessage('Please enter a habit name', 'error');
        return;
    }
    
    // Validate skip days selection
    if (skipDaysValue > 0 && skipDays.length !== skipDaysValue) {
        showMessage(`Please select exactly ${skipDaysValue} day${skipDaysValue > 1 ? 's' : ''} to skip`, 'error');
        return;
    }
    
    const finalCategory = category === 'other' && customCategory ? customCategory : category;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                category: finalCategory,
                daysPerWeek: 7 - skipDaysValue,
                skipDays,
                minimumDuration: minimumDuration ? parseInt(minimumDuration) : null,
                accountabilityMode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const newHabit = data.habit;
            
            // Generate routine if requested
            if (generateRoutine) {
                await generateRoutineForNewHabit(newHabit._id, newHabit.name, finalCategory, routinePrompt);
            }
            
            await loadHabits();
            updateQuickStats();
            displayHabits();
            
            // FIXED: Refresh achievements after creating new habit
            if (document.getElementById('achievements-grid')) {
                renderAchievements();
            }
            
            document.getElementById('habit-form').reset();
            
            // Reset routine prompt section
            document.getElementById('routine-prompt-section').style.display = 'none';
            
            const successMsg = generateRoutine 
                ? 'Habit created and routine generated! 🎉' 
                : 'Habit added successfully! 🎉';
            showMessage(successMsg, 'success');
        }
    } catch (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit');
    }
}

/**
 * Generate routine for a newly created habit
 */
async function generateRoutineForNewHabit(habitId, habitName, habitCategory, userPrompt) {
    try {
        const defaultPrompt = userPrompt || `Give me a practical routine and tips for building the habit: ${habitName}`;
        
        const response = await fetch('/api/routines/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                habitId,
                habitName,
                habitCategory: habitCategory || 'general',
                userPrompt: defaultPrompt
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to generate routine:', data.message);
        }
    } catch (error) {
        console.error('Error generating routine for new habit:', error);
    }
}

/**
 * Toggle habit completion
 * Saves completedAt timestamp and updates status to "completed"
 * Prevents re-completion for the same day
 * 
 * STATE MANAGEMENT & GRAPH UPDATES:
 * - Updates habit state in database
 * - Reloads all habits to sync UI with database
 * - Refreshes weekly progress graphs
 * - Updates analytics charts if visible
 * - Ensures all visualizations stay in sync with data
 */
window.toggleToday = async function(habitId, isChecked) {
    try {
        // Find the habit to check if already completed
        const habit = habits.find(h => h._id === habitId);
        
        if (isChecked && habit) {
            // Check if already completed today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEntry = habit.completionHistory?.find(entry => {
                const d = new Date(entry.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            
            if (todayEntry && todayEntry.status === 'completed') {
                showMessage('Already completed today! 🎉', 'info');
                return;
            }
        }
        
        const url = `${API_URL}/${habitId}/${isChecked ? 'complete' : 'uncomplete-today'}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload habits from database to get updated state
            await loadHabits();
            
            // Update all UI components with new data
            updateQuickStats();
            displayHabits();
            
            // Refresh weekly progress graphs if that page is active
            refreshWeeklyProgress();
            
            // Refresh analytics charts if that page is active
            if (document.getElementById('page-analytics')?.classList.contains('active')) {
                loadAnalytics();
            }
            
            if (isChecked) {
                showMessage(`🎉 ${data.message || 'Great job!'}`, 'success');
            } else {
                showMessage('👍 Unmarked for today', 'success');
            }
        } else {
            showMessage(data.message || 'Failed to update habit', 'error');
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
        showMessage('Failed to update habit', 'error');
    }
}

/**
 * Start habit timer
 * Sets status to in-progress and starts tracking time
 * Ensures only one habit timer runs at a time
 */
window.startHabit = async function(habitId) {
    try {
        // Check if any other habit is currently in progress
        const inProgressHabit = habits.find(h => h.status === 'in-progress' && h._id !== habitId);
        if (inProgressHabit) {
            const continueStart = confirm(
                `"${inProgressHabit.name}" is currently in progress. Do you want to pause it and start "${habits.find(h => h._id === habitId)?.name}"?`
            );
            
            if (!continueStart) {
                return;
            }
            
            // Pause the current habit first
            await pauseHabit(inProgressHabit._id);
        }
        
        const response = await fetch(`${API_URL}/${habitId}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Stop any existing timer (just in case)
            Object.keys(activeTimers).forEach(id => {
                if (id !== habitId && activeTimers[id]) {
                    clearInterval(activeTimers[id].intervalId);
                    delete activeTimers[id];
                }
            });
            
            // Start local timer
            const startTime = Date.now();
            activeTimers[habitId] = {
                startTime,
                notified: false,
                intervalId: setInterval(() => {
                    updateTimerDisplay(habitId, startTime);
                }, 1000)
            };
            
            // Reload habits to update UI
            await loadHabits();
            displayHabits();
            showMessage('⏱️ Timer started!', 'success');
        } else {
            showMessage(data.message || 'Failed to start habit', 'error');
        }
    } catch (error) {
        console.error('Error starting habit:', error);
        showMessage('Failed to start habit', 'error');
    }
}

/**
 * Pause habit timer
 * Sets status back to idle and stops timer
 */
window.pauseHabit = async function(habitId) {
    try {
        // Stop local timer first
        if (activeTimers[habitId]) {
            clearInterval(activeTimers[habitId].intervalId);
            delete activeTimers[habitId];
        }
        
        // Call backend to reset habit status
        const response = await fetch(`${API_URL}/${habitId}/pause`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            displayHabits();
            showMessage('⏸️ Timer paused', 'info');
        } else {
            showMessage(data.message || 'Failed to pause habit', 'error');
        }
    } catch (error) {
        console.error('Error pausing habit:', error);
        showMessage('Failed to pause habit', 'error');
    }
}

/**
 * Complete habit with time tracking and reflection
 * Shows reflection modal before completion
 */
window.completeHabitWithTime = async function(habitId) {
    try {
        const habit = habits.find(h => h._id === habitId);
        
        // Calculate total elapsed time (current session + previously paused time)
        let duration = habit?.pausedDuration || 0; // Start with accumulated time
        
        if (habit && habit.startedAt) {
            const startTime = new Date(habit.startedAt).getTime();
            const endTime = Date.now();
            const currentSessionDuration = Math.floor((endTime - startTime) / 1000); // seconds
            duration += currentSessionDuration; // Add current session to total
        }
        
        // Check minimum duration requirement
        if (habit && habit.minimumDuration) {
            const requiredSeconds = habit.minimumDuration * 60;
            if (duration < requiredSeconds) {
                const remaining = Math.ceil((requiredSeconds - duration) / 60);
                showMessage(`⏰ Please continue for ${remaining} more minute${remaining > 1 ? 's' : ''} to meet the minimum duration`, 'error');
                return;
            }
        }
        
        // Show reflection modal before completing
        showReflectionModal(habitId, duration);
    } catch (error) {
        console.error('Error completing habit:', error);
        showMessage('Failed to complete habit', 'error');
    }
}

/**
 * Show reflection modal
 * Requires user to reflect before marking habit as complete
 * For accountability mode habits, requires more detailed reflection (50+ characters)
 */
function showReflectionModal(habitId, duration) {
    const modal = document.getElementById('reflection-modal');
    const input = document.getElementById('reflection-input');
    const charCount = document.getElementById('reflection-char-count');
    const form = document.getElementById('reflection-form');
    const modalTitle = modal.querySelector('h2');
    const modalSubtitle = modal.querySelector('.modal-subtitle');
    
    // Find the habit to check if accountability mode is enabled
    const habit = habits.find(h => h._id === habitId);
    const isAccountabilityMode = habit?.accountabilityMode || false;
    const minChars = isAccountabilityMode ? 50 : 5;
    
    // Update modal title and subtitle for accountability mode
    if (isAccountabilityMode) {
        modalTitle.textContent = '🔒 Accountability Mode';
        modalSubtitle.textContent = 'This habit requires detailed proof. Please describe what you did in detail (minimum 50 characters).';
        input.placeholder = 'Provide detailed description of what you accomplished... (minimum 50 characters for accountability mode)';
    } else {
        modalTitle.textContent = '✍️ Reflection Time';
        modalSubtitle.textContent = 'Before marking this habit as complete, take a moment to reflect on what you did.';
        input.placeholder = 'Describe what you accomplished... (minimum 5 characters)';
    }
    
    // Clear previous input
    input.value = '';
    charCount.textContent = '0 characters';
    charCount.style.color = '#64748b';
    
    // Update character count with dynamic requirement
    const updateCharCount = () => {
        const length = input.value.trim().length;
        charCount.textContent = `${length} / ${minChars} characters minimum`;
        if (length >= minChars) {
            charCount.style.color = '#10b981';
        } else if (length >= minChars * 0.5) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#64748b';
        }
    };
    
    input.addEventListener('input', updateCharCount);
    
    // Handle form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        const reflection = input.value.trim();
        
        if (reflection.length < minChars) {
            const remaining = minChars - reflection.length;
            const modeText = isAccountabilityMode ? ' (accountability mode requires detailed proof)' : '';
            showMessage(`Please write at least ${remaining} more character${remaining > 1 ? 's' : ''} in your reflection${modeText}`, 'error');
            return;
        }
        
        // Close modal and complete habit
        modal.style.display = 'none';
        await submitHabitCompletion(habitId, duration, reflection);
    };
    
    // Show modal
    modal.style.display = 'flex';
    input.focus();
    updateCharCount();
}

/**
 * Close reflection modal
 */
window.closeReflectionModal = function() {
    document.getElementById('reflection-modal').style.display = 'none';
}

/**
 * Submit habit completion with reflection
 */
async function submitHabitCompletion(habitId, duration, reflection) {
    try {
        // Stop local timer
        if (activeTimers[habitId]) {
            clearInterval(activeTimers[habitId].intervalId);
            delete activeTimers[habitId];
        }
        
        // Complete the habit with duration and reflection
        const response = await fetch(`${API_URL}/${habitId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration, reflection })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            updateQuickStats();
            displayHabits();
            refreshWeeklyProgress();
            
            // FIXED: Refresh achievements and badges after completion
            if (document.getElementById('achievements-grid')) {
                renderAchievements();
            }
            if (document.getElementById('badges-container')) {
                renderBadges();
            }
            
            const mins = Math.floor(duration / 60);
            const secs = duration % 60;
            showMessage(`🎉 ${data.message || 'Great job!'} (${mins}m ${secs}s)`, 'success');
            
            // Check if end-of-day honesty check should be shown
            checkForHonestyReview();
        } else {
            showMessage(data.message || 'Failed to complete habit', 'error');
        }
    } catch (error) {
        console.error('Error submitting habit completion:', error);
        showMessage('Failed to complete habit', 'error');
    }
}

/**
 * Update timer display in real-time
 * Shows notification when minimum duration is reached
 */
function updateTimerDisplay(habitId, startTime) {
    const timerElement = document.getElementById(`timer-${habitId}`);
    if (timerElement) {
        const habit = habits.find(h => h._id === habitId);
        const pausedDuration = habit?.pausedDuration || 0; // Get accumulated time
        
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        const totalElapsed = pausedDuration + currentElapsed; // Total = paused + current
        
        const mins = Math.floor(totalElapsed / 60);
        const secs = totalElapsed % 60;
        timerElement.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        // Check if minimum duration is reached
        if (habit && habit.minimumDuration && activeTimers[habitId]) {
            const requiredSeconds = habit.minimumDuration * 60;
            
            // Notify when minimum duration is reached (only once)
            if (totalElapsed >= requiredSeconds && !activeTimers[habitId].notified) {
                activeTimers[habitId].notified = true;
                
                // Play sound
                if (notificationSound) {
                    notificationSound.play().catch(e => console.warn('Could not play sound:', e));
                }
                
                // Show visual notification
                showMessage(`⏰ Minimum duration reached for "${habit.name}"! You can complete it now.`, 'success');
                
                // Flash the timer element
                timerElement.style.animation = 'timerPulse 1s ease-in-out 3';
                setTimeout(() => {
                    timerElement.style.animation = '';
                }, 3000);
            }
        }
    }
}

/**
 * Delete habit
 */
window.deleteHabit = async function(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${habitId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            updateQuickStats();
            displayHabits();
            
            // FIXED: Refresh achievements after deleting habit
            if (document.getElementById('achievements-grid')) {
                renderAchievements();
            }
            
            showMessage('Habit deleted', 'success');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
    }
}

/**
 * Open edit habit modal
 */
window.openEditHabitModal = function(habitId) {
    const habit = habits.find(h => h._id === habitId);
    if (!habit) {
        showMessage('Habit not found', 'error');
        return;
    }
    
    // Populate form fields
    document.getElementById('edit-habit-id').value = habit._id;
    document.getElementById('edit-habit-name-display').value = habit.name;
    
    // Set skip days radio
    const skipDaysValue = 7 - (habit.daysPerWeek || 7);
    const skipDaysRadio = document.querySelector(`input[name=\"edit-skip-days\"][value=\"${skipDaysValue}\"]`);
    if (skipDaysRadio) skipDaysRadio.checked = true;
    
    // Handle specific skip days
    const editSpecificDaysGroup = document.getElementById('edit-specific-days-group');
    const editDayCheckboxes = document.querySelectorAll('input[name=\"edit-skip-specific-days\"]');
    
    // Clear all checkboxes first
    editDayCheckboxes.forEach(cb => cb.checked = false);
    
    if (skipDaysValue > 0) {
        editSpecificDaysGroup.style.display = 'block';
        // Check the specific days
        if (habit.skipDays && Array.isArray(habit.skipDays)) {
            habit.skipDays.forEach(day => {
                const checkbox = document.querySelector(`input[name=\"edit-skip-specific-days\"][value=\"${day}\"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        editSpecificDaysGroup.style.display = 'none';
    }
    
    // Set minimum duration
    document.getElementById('edit-minimum-duration').value = habit.minimumDuration || '';
    
    // Show modal
    document.getElementById('edit-habit-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Setup edit skip days change handlers
    setupEditSkipDaysHandlers();
}

/**
 * Close edit habit modal
 */
window.closeEditHabitModal = function() {
    document.getElementById('edit-habit-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('edit-habit-form').reset();
}

/**
 * Setup edit modal skip days handlers
 */
function setupEditSkipDaysHandlers() {
    const editSkipDaysRadios = document.querySelectorAll('input[name=\"edit-skip-days\"]');
    const editSpecificDaysGroup = document.getElementById('edit-specific-days-group');
    const editDayCheckboxes = document.querySelectorAll('input[name=\"edit-skip-specific-days\"]');
    const editSkipDaysHelp = document.getElementById('edit-skip-days-help');
    
    // Remove existing listeners by cloning nodes
    editSkipDaysRadios.forEach(radio => {
        const newRadio = radio.cloneNode(true);
        radio.parentNode.replaceChild(newRadio, radio);
    });
    
    editDayCheckboxes.forEach(checkbox => {
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
    });
    
    // Get fresh references
    const freshRadios = document.querySelectorAll('input[name=\"edit-skip-days\"]');
    const freshCheckboxes = document.querySelectorAll('input[name=\"edit-skip-specific-days\"]');
    
    // Add radio change listeners
    freshRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const skipCount = parseInt(e.target.value);
            if (skipCount > 0) {
                editSpecificDaysGroup.style.display = 'block';
                editSkipDaysHelp.textContent = `Select exactly ${skipCount} day${skipCount > 1 ? 's' : ''} to skip`;
            } else {
                editSpecificDaysGroup.style.display = 'none';
                freshCheckboxes.forEach(cb => cb.checked = false);
            }
        });
    });
    
    // Add checkbox change listeners
    freshCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedRadio = document.querySelector('input[name=\"edit-skip-days\"]:checked');
            if (!selectedRadio) return;
            
            const maxSkipDays = parseInt(selectedRadio.value);
            const checkedBoxes = document.querySelectorAll('input[name=\"edit-skip-specific-days\"]:checked');
            
            if (checkedBoxes.length > maxSkipDays) {
                checkbox.checked = false;
                showMessage(`You can only select ${maxSkipDays} day${maxSkipDays > 1 ? 's' : ''} to skip`, 'info');
            }
        });
    });
}

/**
 * Save edited habit
 */
async function saveEditedHabit(e) {
    e.preventDefault();
    
    const habitId = document.getElementById('edit-habit-id').value;
    const skipDaysValue = parseInt(document.querySelector('input[name=\"edit-skip-days\"]:checked').value);
    const minimumDuration = document.getElementById('edit-minimum-duration').value;
    
    // Get selected skip days
    const skipDays = [];
    const skipDaysCheckboxes = document.querySelectorAll('input[name=\"edit-skip-specific-days\"]:checked');
    skipDaysCheckboxes.forEach(checkbox => skipDays.push(checkbox.value));
    
    // Validate skip days selection
    if (skipDaysValue > 0 && skipDays.length !== skipDaysValue) {
        showMessage(`Please select exactly ${skipDaysValue} day${skipDaysValue > 1 ? 's' : ''} to skip`, 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${habitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                daysPerWeek: 7 - skipDaysValue,
                skipDays,
                minimumDuration: minimumDuration ? parseInt(minimumDuration) : null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local habits array
            await loadHabits();
            displayHabits();
            
            closeEditHabitModal();
            showMessage('Habit updated successfully! 🎉', 'success');
        } else {
            showMessage(data.message || 'Failed to update habit', 'error');
        }
    } catch (error) {
        console.error('Error updating habit:', error);
        showMessage('Failed to update habit', 'error');
    }
}

/**
 * Skip habit for today
 * Marks today as skipped without breaking streak
 */
window.skipHabitToday = async function(habitId) {
    try {
        const response = await fetch(`${API_URL}/${habitId}/skip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: new Date() })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            updateQuickStats();
            displayHabits();
            refreshWeeklyProgress();
            showMessage('Day marked as skipped. Streak maintained! ⏸️', 'info');
        } else {
            showMessage(data.message || 'Failed to skip habit', 'error');
        }
    } catch (error) {
        console.error('Error skipping habit:', error);
        showMessage('Error skipping habit', 'error');
    }
}

/**
 * Undo skip for today
 * Removes skip entry for today
 */
window.undoSkipToday = async function(habitId) {
    try {
        const response = await fetch(`${API_URL}/${habitId}/uncomplete`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadHabits();
            updateQuickStats();
            displayHabits();
            refreshWeeklyProgress();
            showMessage('Skip undone', 'success');
        } else {
            showMessage(data.message || 'Failed to undo skip', 'error');
        }
    } catch (error) {
        console.error('Error undoing skip:', error);
        showMessage('Error undoing skip', 'error');
    }
}

// ========== UI Functions ==========

/**
 * Display all habits
 */
function displayHabits() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="empty-state">No habits yet. Add one to get started! 🌱</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => createHabitElement(habit)).join('');
}

/**
 * Create habit HTML element with completion status and timestamp
 */
function createHabitElement(habit) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = habit.completionHistory?.find(entry => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });
    const isCompletedToday = todayEntry && todayEntry.status === 'completed';
    const isSkippedToday = todayEntry && todayEntry.status === 'skipped';
    
    // Check if today is a designated skip day for this habit
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[today.getDay()];
    const isDesignatedSkipDay = habit.skipDays && habit.skipDays.includes(todayDayName);
    
    const frequencyText = habit.daysPerWeek === 7 ? 'Daily' : `${habit.daysPerWeek} days/week`;
    
    // Show accountability badge if enabled
    let accountabilityBadge = '';
    if (habit.accountabilityMode) {
        accountabilityBadge = '<span class="accountability-badge" title="Accountability mode: Extra proof required">🔒 Accountability</span>';
    }
    
    // Show minimum duration indicator if set and habit is idle
    let minDurationInfo = '';
    if (habit.minimumDuration && habit.status === 'idle') {
        minDurationInfo = `<div class="min-duration-info" title="Minimum time requirement">⏱️ Minimum: ${habit.minimumDuration} min</div>`;
    }
    
    // Format completion time if completed today
    let completionInfo = '';
    if (isCompletedToday && habit.completedAt) {
        const completedTime = new Date(habit.completedAt);
        const timeStr = completedTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        completionInfo = `<div class="completion-timestamp">✅ Completed at ${timeStr}</div>`;
    }
    
    // Calculate elapsed time if in progress
    let elapsedTime = 0;
    let timerDisplay = '';
    if (habit.status === 'in-progress' && habit.startedAt) {
        const pausedDuration = habit.pausedDuration || 0; // Previously accumulated time
        const startTime = new Date(habit.startedAt).getTime();
        const currentTime = activeTimers[habit._id] ? Date.now() : startTime;
        const currentElapsed = Math.floor((currentTime - startTime) / 1000); // seconds
        elapsedTime = pausedDuration + currentElapsed; // Total = paused + current
    }
    
    // Show status badge and timer
    let statusBadge = '';
    if (habit.status === 'completed') {
        statusBadge = '<span class="status-badge status-completed">✅ Completed</span>';
        // Show duration if stored
        if (todayEntry && todayEntry.duration) {
            const mins = Math.floor(todayEntry.duration / 60);
            const secs = todayEntry.duration % 60;
            timerDisplay = `<div class="duration-display">⏱️ ${mins}m ${secs}s</div>`;
        }
    } else if (todayEntry && todayEntry.status === 'skipped') {
        statusBadge = '<span class="status-badge status-skipped">⏸️ Skipped</span>';
    } else if (habit.status === 'in-progress') {
        statusBadge = '<span class="status-badge status-in-progress">⏱️ In Progress</span>';
        const mins = Math.floor(elapsedTime / 60);
        const secs = elapsedTime % 60;
        timerDisplay = `<div class="timer-display" id="timer-${habit._id}">${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>`;
    }
    
    return `
        <div class="habit-card ${isCompletedToday ? 'completed-today' : ''} ${isSkippedToday ? 'skipped-today' : ''}" data-habit-id="${habit._id}">
            <div class="habit-card-header">
                <div class="habit-card-title-section">
                    <h3 class="habit-card-title">${habit.name}</h3>
                    ${habit.description ? `<p class="habit-card-description">${habit.description}</p>` : ''}
                </div>
                <span class="habit-card-streak">🔥 ${habit.streak || 0}</span>
            </div>
            
            ${accountabilityBadge || minDurationInfo ? `
                <div class="habit-card-badges">
                    ${accountabilityBadge}
                    ${minDurationInfo}
                </div>
            ` : ''}
            
            ${statusBadge || timerDisplay ? `
                <div class="habit-card-status">
                    ${statusBadge}
                    ${timerDisplay}
                </div>
            ` : ''}
            
            <div class="habit-card-footer">
                <div class="habit-card-actions-primary">
                    ${habit.status === 'idle' && !todayEntry ? `
                        <button class="btn-start" onclick="startHabit('${habit._id}')">Start</button>
                        ${isDesignatedSkipDay ? `<button class="btn-skip" onclick="skipHabitToday('${habit._id}')">Skip Today</button>` : ''}
                    ` : ''}
                    ${habit.status === 'in-progress' ? `
                        <button class="btn-pause" onclick="pauseHabit('${habit._id}')">Pause</button>
                        <button class="btn-complete" onclick="completeHabitWithTime('${habit._id}')">Complete</button>
                    ` : ''}
                    ${habit.status === 'completed' ? `
                        <button class="btn-undo" onclick="toggleToday('${habit._id}', false)">Undo</button>
                    ` : ''}
                    ${todayEntry && todayEntry.status === 'skipped' ? `
                        <button class="btn-undo" onclick="undoSkipToday('${habit._id}')">Undo Skip</button>
                    ` : ''}
                </div>
                <div class="habit-card-actions-secondary">
                    <button class="btn-routine" onclick="openRoutineModal('${habit._id}', '${habit.name}', '${habit.category || 'general'}')" title="Get AI routine">💡 Routine</button>
                    <button class="btn-edit-minimal" onclick="openEditHabitModal('${habit._id}')" title="Edit habit">✏️</button>
                    <button class="btn-delete-minimal" onclick="deleteHabit('${habit._id}')" title="Delete habit">×</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Update quick stats
 */
function updateQuickStats() {
    document.getElementById('total-habits').textContent = habits.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count completed habits today
    const completedToday = habits.filter(habit => {
        const entry = habit.completionHistory?.find(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
        return entry && entry.status === 'completed';
    }).length;
    
    // Active today = completed + skipped (both maintain engagement)
    const activeToday = habits.filter(habit => {
        const entry = habit.completionHistory?.find(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === today.getTime();
        });
        return entry && (entry.status === 'completed' || entry.status === 'skipped');
    }).length;
    
    document.getElementById('active-today').textContent = activeToday;
    
    const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0);
    document.getElementById('longest-streak').textContent = longestStreak;
}

/**
 * Show message notification
 */
function showMessage(message, type) {
    // Simple alert for now
    const msg = document.createElement('div');
    msg.className = `message message-${type}`;
    msg.textContent = message;
    msg.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 20px;background:#4ade80;color:white;border-radius:8px;z-index:9999;';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

// ========== Analytics Functions ==========

async function loadAnalytics() {
    try {
        const [dailyResponse, weeklyResponse] = await Promise.all([
            fetch(`${API_URL}/analytics/daily`),
            fetch(`${API_URL}/analytics/weekly`)
        ]);
        
        const dailyResult = await dailyResponse.json();
        const weeklyResult = await weeklyResponse.json();
        
        if (dailyResult.success && dailyResult.data) {
            updateDailyStats(dailyResult.data);
            createDailyChart(dailyResult.data);
            createCategoryChart(dailyResult.data);
        }
        
        if (weeklyResult.success && weeklyResult.data) {
            createWeeklyOverviewChart(weeklyResult.data);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateDailyStats(data) {
    const total = data.completed + data.skipped + data.notDone;
    document.getElementById('completed-count').textContent = data.completed;
    document.getElementById('skipped-count').textContent = data.skipped;
    document.getElementById('notdone-count').textContent = data.notDone;
    
    document.getElementById('completed-percentage').textContent = 
        total > 0 ? `${Math.round((data.completed / total) * 100)}%` : '0%';
    document.getElementById('skipped-percentage').textContent = 
        total > 0 ? `${Math.round((data.skipped / total) * 100)}%` : '0%';
    document.getElementById('notdone-percentage').textContent = 
        total > 0 ? `${Math.round((data.notDone / total) * 100)}%` : '0%';
}

function createDailyChart(data) {
    const ctx = document.getElementById('dailyCompletionChart');
    if (!ctx) return;
    
    if (dailyChart) dailyChart.destroy();
    
    dailyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Skipped', 'Not Done'],
            datasets: [{
                data: [data.completed, data.skipped, data.notDone],
                backgroundColor: ['#22c55e', '#94a3b8', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    if (categoryChart) categoryChart.destroy();
    
    const categories = Object.keys(data.categoryStats || {});
    const completedData = categories.map(cat => data.categoryStats[cat].completed);
    const totalData = categories.map(cat => data.categoryStats[cat].total);
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: '#4ade80',
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#22c55e'
                },
                {
                    label: 'Total',
                    data: totalData,
                    backgroundColor: '#cbd5e1',
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: '#94a3b8'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

function createWeeklyOverviewChart(weeklyData) {
    const ctx = document.getElementById('weeklyOverviewChart');
    if (!ctx) return;
    
    if (weeklyOverviewChart) weeklyOverviewChart.destroy();
    
    // Calculate daily totals across all habits
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dailyTotals = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        let completedCount = 0;
        let totalHabits = 0;
        
        weeklyData.forEach(habit => {
            totalHabits++;
            const dayStatus = habit.weekStatus.find(day => {
                const dayDate = new Date(day.date);
                dayDate.setHours(0, 0, 0, 0);
                return dayDate.getTime() === date.getTime();
            });
            
            if (dayStatus && (dayStatus.status === 'completed' || dayStatus.status === 'skipped')) {
                completedCount++;
            }
        });
        
        const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
        dailyTotals.push(percentage);
        
        const dayName = days[date.getDay()];
        const isToday = date.toDateString() === today.toDateString();
        labels.push(isToday ? `${dayName} (Today)` : dayName);
    }
    
    weeklyOverviewChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion Rate (%)',
                data: dailyTotals,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#7c3aed',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `Completion: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

// ========== Weekly Progress Functions ==========
/**
 * WEEKLY PROGRESS SYSTEM - 7-DAY GRAPH VISUALIZATION
 * 
 * PURPOSE:
 * Display a visual 7-day graph for each habit showing completion patterns
 * 
 * STATE SYSTEM (3 states per day):
 * 1. COMPLETED (green ●) - Habit was done, extends streak
 * 2. SKIPPED (yellow ●) - Intentionally skipped, maintains streak, max 1/week
 * 3. MISSED (red ●) - No entry, breaks streak
 * 
 * SKIP RULES:
 * - Maximum 1 skip per week (enforced by model)
 * - Cannot skip consecutive days (enforced by model)
 * - Skipped days maintain streak (don't break it)
 * - Only missed days break streaks
 * 
 * ACTIVE DAYS CALCULATION:
 * - Active days = completed + skipped
 * - Both completed and skipped count as "maintaining the habit"
 * - Missed days don't count as active
 * 
 * GRAPH RENDERING:
 * - Always shows 7 consecutive days (Sunday to Saturday) ending today
 * - Each day gets a colored dot based on its state
 * - Progress bar shows completion rate (completed / total 7 days)
 * - Legend explains the color meanings
 * - Updates automatically when habit state changes via refreshWeeklyProgress()
 * 
 * UI SYNC:
 * - loadWeeklyProgress() regenerates all cards from current habits data
 * - Called when: page loads, user switches to weekly page, habit state changes
 * - Ensures graphs always reflect database state
 */

async function loadWeeklyProgress() {
    const container = document.getElementById('weekly-progress-container');
    if (!container) return;
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="empty-state">No habits to show weekly progress for.</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => createWeeklyProgressCard(habit)).join('');
}

/**
 * Create weekly progress card for a habit with 7-day graph
 * 
 * VISUALIZATION RULES:
 * - Green dot (●) = completed day
 * - Yellow dot (●) = skipped day (intentional, maintains streak)
 * - Red dot (●) = missed day (no entry, breaks streak)
 * - 7 days always shown (Sunday to Saturday)
 * 
 * ACTIVE DAYS CALCULATION:
 * - Active days = completed + skipped (both maintain habit consistency)
 * - Missed days = days with no entry at all
 * - Progress bar shows: completed days / total days
 * 
 * GRAPH RENDERING:
 * - Always renders 7 consecutive days ending today
 * - Each day shows status with color-coded dot
 * - Legend explains color meanings
 * - Updates when habit state changes (via loadWeeklyProgress)
 */
function createWeeklyProgressCard(habit) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine the earliest eligible tracking date for this habit
    let earliestTrackingDate = null;
    
    if (userSignupDate) {
        // Use user signup date
        earliestTrackingDate = new Date(userSignupDate);
    }
    
    if (habit.createdAt) {
        const habitCreatedDate = new Date(habit.createdAt);
        habitCreatedDate.setHours(0, 0, 0, 0);
        
        // Use the later of user signup or habit creation
        if (!earliestTrackingDate || habitCreatedDate > earliestTrackingDate) {
            earliestTrackingDate = habitCreatedDate;
        }
    }
    
    // Calculate weekly stats for 7 consecutive days ending today
    let completedCount = 0;
    let skippedCount = 0;
    let missedCount = 0;
    let ineligibleCount = 0; // Days before signup/habit creation
    
    const weekData = [];
    
    // Debug: Log the habit and its completion history
    console.log(`[Weekly Progress] Creating card for: ${habit.name}`);
    console.log('[Weekly Progress] Completion History:', habit.completionHistory);
    console.log('[Weekly Progress] Earliest tracking date:', earliestTrackingDate ? earliestTrackingDate.toISOString() : 'none');
    
    // Generate 7 days (Sunday to Saturday) ending today
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const dayNameLower = dayNames[dayOfWeek].toLowerCase();
        
        // Check if this day is BEFORE user signup or habit creation
        const isBeforeEligibleDate = earliestTrackingDate && date < earliestTrackingDate;
        
        // Check if this day is a designated rest day (skipDays)
        const isRestDay = habit.skipDays && habit.skipDays.includes(dayNameLower);
        
        // Check completionHistory for this date
        const entry = habit.completionHistory?.find(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === date.getTime();
        });
        
        // Determine status and visualization
        let status = 'missed';        // Default: no entry = missed
        let statusClass = 'missed';   // CSS class for styling
        let statusIcon = '●';         // Solid dot for all states
        let statusColor = '#ef4444';  // Red for missed
        
        if (isBeforeEligibleDate) {
            // STATE 0: PRE-SIGNUP/INELIGIBLE (neutral gray, hollow dot)
            status = 'ineligible';
            statusClass = 'ineligible';
            statusColor = '#d1d5db';  // Light gray
            statusIcon = '○';  // Hollow dot
            ineligibleCount++;
        } else if (entry) {
            // Debug: Log entry details
            console.log(`[Weekly Progress] ${habit.name} - ${dayNames[dayOfWeek]}:`, {
                date: date.toISOString(),
                status: entry.status,
                isRestDay,
                entry: entry
            });
            
            if (entry.status === 'completed') {
                // STATE 1: COMPLETED (green)
                status = 'completed';
                statusClass = 'completed';
                statusColor = '#22c55e';  // Green
                completedCount++;
            } else if (entry.status === 'skipped') {
                // STATE 2: SKIPPED (gray/muted) - maintains streak
                status = 'skipped';
                statusClass = 'skipped';
                statusColor = '#94a3b8';  // Muted gray-blue
                skippedCount++;
            } else {
                // STATE 3: Other status treated as missed
                missedCount++;
            }
        } else {
            // No entry - check if it's a rest day
            if (isRestDay) {
                // STATE 4: REST DAY (gray) - not supposed to do habit
                status = 'rest';
                statusClass = 'rest';
                statusColor = '#9ca3af';  // Gray
                statusIcon = '○';  // Hollow dot for rest days
            } else {
                // STATE 3: MISSED (red) - no entry, breaks streak
                missedCount++;
            }
        }
        
        const isToday = date.toDateString() === today.toDateString();
        const dayName = dayNames[dayOfWeek];
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        
        weekData.push({
            dayName,
            dateStr,
            isToday,
            statusClass,
            status,
            statusIcon,
            statusColor
        });
    }
    
    // Calculate metrics (excluding ineligible days)
    const eligibleDays = 7 - ineligibleCount;
    // Active days = completed + skipped (both maintain consistency)
    const activeDays = completedCount + skippedCount;
    // Completion rate based on eligible days only
    const completionRate = eligibleDays > 0 ? Math.round((completedCount / eligibleDays) * 100) : 0;
    
    // Build HTML with graph
    let html = `
        <div class="weekly-card">
            <div class="weekly-card-header">
                <div>
                    <h3 class="weekly-habit-name">${habit.name}</h3>
                    <p class="weekly-habit-schedule">7-day tracking (Sunday - Saturday)</p>
                </div>
                <div class="weekly-stats-mini">
                    <span class="stat-mini completed" title="Completed">
                        <span class="stat-dot" style="background: #22c55e;">●</span>
                        ${completedCount}
                    </span>
                    <span class="stat-mini skipped" title="Skipped">
                        <span class="stat-dot" style="background: #94a3b8;">●</span>
                        ${skippedCount}
                    </span>
                    <span class="stat-mini missed" title="Missed">
                        <span class="stat-dot" style="background: #ef4444;">●</span>
                        ${missedCount}
                    </span>
                </div>
            </div>
            
            <!-- Progress Bar (Completion Rate) -->
            <div class="progress-bar-container">
                <div class="progress-bar-label">
                    <span>Completion Rate</span>
                    <span class="progress-percentage">${completionRate}%</span>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" style="width: ${completionRate}%; background: linear-gradient(90deg, #22c55e, #4ade80, #86efac);"></div>
                </div>
            </div>
            
            <!-- 7-Day Visual Graph -->
            <div class="weekly-grid">
    `;
    
    // Render each day in the 7-day graph
    weekData.forEach(day => {
        const todayClass = day.isToday ? 'today' : '';
        
        html += `
            <div class="day-cell ${day.statusClass} ${todayClass}">
                <div class="day-label">${day.dayName.substring(0, 3)}</div>
                <div class="day-date">${day.dateStr}</div>
                <div class="day-status-icon" style="color: ${day.statusColor}; font-size: 2.5rem; line-height: 1;">${day.statusIcon}</div>
                ${day.isToday ? '<div class="today-badge">Today</div>' : ''}
            </div>
        `;
    });
    
    html += `
            </div>
            
            <!-- Color Legend -->
            <div class="weekly-legend">
                <div class="legend-item">
                    <span class="legend-dot" style="background: #22c55e;">●</span>
                    <span>Completed</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot" style="background: #94a3b8;">●</span>
                    <span>Skipped</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot" style="background: #9ca3af;">○</span>
                    <span>Rest Day</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot" style="background: #ef4444;">●</span>
                    <span>Missed</span>
                </div>
                ${ineligibleCount > 0 ? `
                <div class="legend-item">
                    <span class="legend-dot" style="background: #d1d5db;">○</span>
                    <span>Before Signup</span>
                </div>
                ` : ''}
            </div>
            
            <!-- Streak & Active Days Info -->
            <div class="weekly-streak-info">
                <span class="streak-badge">🔥 ${habit.streak || 0} day streak</span>
                <span class="completion-text">${activeDays} of ${eligibleDays} eligible days active</span>
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Refresh weekly progress display
 * 
 * GRAPH RENDERING LOGIC:
 * - Checks if weekly progress page is currently active
 * - Reloads progress cards with updated habit data
 * - Ensures graphs reflect latest completion/skip/missed states
 * - Called after any habit state change (complete, skip, uncomplete)
 * 
 * This function maintains UI-data synchronization for the 7-day graphs
 */
function refreshWeeklyProgress() {
    const weeklyPage = document.getElementById('page-weekly-progress');
    if (weeklyPage && weeklyPage.classList.contains('active')) {
        // Page is visible - reload the progress cards
        loadWeeklyProgress();
    }
}

// ========== Helper Functions ==========

/**
 * Update skip days preview
 * Shows selected rest days in a readable format
 */
function updateSkipDaysPreview() {
    const checkedBoxes = document.querySelectorAll('input[name="skip-specific-days"]:checked');
    const preview = document.getElementById('selected-days-preview');
    const list = document.getElementById('selected-days-list');
    
    if (checkedBoxes.length > 0) {
        const days = Array.from(checkedBoxes).map(cb => {
            return cb.value.charAt(0).toUpperCase() + cb.value.slice(1);
        });
        list.textContent = days.join(', ');
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

// ========== Accountability & Honesty Check Functions ==========

/**
 * Check if honesty review should be shown
 * Shows once per day after 9 PM
 */
function checkForHonestyReview() {
    const now = new Date();
    const hour = now.getHours();
    
    // Only show after 9 PM
    if (hour < 21) return;
    
    // Check if review was already done today
    const lastCheck = localStorage.getItem('lastHonestyCheck');
    const today = now.toDateString();
    
    if (lastCheck === today) return;
    
    // Get today's completed habits
    const completedToday = habits.filter(habit => {
        const todayEntry = habit.completionHistory?.find(entry => {
            const d = new Date(entry.date);
            d.setHours(0, 0, 0, 0);
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            return d.getTime() === t.getTime();
        });
        return todayEntry && todayEntry.status === 'completed';
    });
    
    if (completedToday.length > 0) {
        showHonestyCheckModal(completedToday);
    }
}

/**
 * Show honesty check modal
 */
function showHonestyCheckModal(completedHabits) {
    const modal = document.getElementById('honesty-modal');
    const list = document.getElementById('honesty-habits-list');
    
    // Build habits list
    let html = '';
    completedHabits.forEach(habit => {
        html += `
            <div class="honesty-habit-item" data-habit-id="${habit._id}">
                <h3>${habit.name}</h3>
                <p class="honesty-question">Do you feel this habit was completed honestly?</p>
                <div class="honesty-options">
                    <label class="honesty-option">
                        <input type="radio" name="honesty-${habit._id}" value="yes" required>
                        <span class="honesty-label">✅ Yes</span>
                    </label>
                    <label class="honesty-option">
                        <input type="radio" name="honesty-${habit._id}" value="partially">
                        <span class="honesty-label">⚠️ Partially</span>
                    </label>
                    <label class="honesty-option">
                        <input type="radio" name="honesty-${habit._id}" value="not-really">
                        <span class="honesty-label">❌ Not really</span>
                    </label>
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
    modal.style.display = 'flex';
}

/**
 * Skip honesty check
 */
window.skipHonestyCheck = function() {
    document.getElementById('honesty-modal').style.display = 'none';
    // Don't mark as done so it shows again next time
}

/**
 * Submit honesty review
 */
window.submitHonestyReview = async function() {
    const reviews = [];
    const habitItems = document.querySelectorAll('.honesty-habit-item');
    
    // Collect all reviews
    let allAnswered = true;
    habitItems.forEach(item => {
        const habitId = item.dataset.habitId;
        const selected = item.querySelector(`input[name="honesty-${habitId}"]:checked`);
        
        if (!selected) {
            allAnswered = false;
            return;
        }
        
        reviews.push({
            habitId,
            honestyStatus: selected.value
        });
    });
    
    if (!allAnswered) {
        showMessage('Please review all habits before submitting', 'info');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/honesty-review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviews })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mark as done for today
            localStorage.setItem('lastHonestyCheck', new Date().toDateString());
            
            document.getElementById('honesty-modal').style.display = 'none';
            showMessage(data.message, 'success');
            
            // Reload habits to reflect changes
            await loadHabits();
            displayHabits();
            refreshWeeklyProgress();
        } else {
            showMessage(data.message || 'Failed to submit review', 'error');
        }
    } catch (error) {
        console.error('Error submitting honesty review:', error);
        showMessage('Failed to submit honesty review', 'error');
    }
}

// ========== Profile Functions ==========

/**
 * Load user profile for navbar icon (lightweight version)
 */
async function loadUserProfileForNav() {
    try {
        const response = await fetch('/auth/profile');
        const data = await response.json();
        
        if (data.success && data.user) {
            currentUser = data.user;
            // Update only the navbar icon
            const navProfileIcon = document.getElementById('nav-profile-icon');
            if (navProfileIcon) {
                navProfileIcon.innerHTML = '';
                
                if (data.user.photoURL) {
                    const img = document.createElement('img');
                    img.src = data.user.photoURL;
                    img.alt = data.user.name;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '50%';
                    img.onerror = function() {
                        this.remove();
                        const span = document.createElement('span');
                        span.className = 'profile-icon-text';
                        span.textContent = data.user.name ? data.user.name.charAt(0).toUpperCase() : '?';
                        navProfileIcon.appendChild(span);
                    };
                    navProfileIcon.appendChild(img);
                } else {
                    const span = document.createElement('span');
                    span.className = 'profile-icon-text';
                    span.textContent = data.user.name ? data.user.name.charAt(0).toUpperCase() : '?';
                    navProfileIcon.appendChild(span);
                }
            }
        }
    } catch (error) {
        console.error('Error loading profile for navbar:', error);
    }
}

async function loadProfile() {
    try {
        const response = await fetch('/auth/profile');
        const data = await response.json();
        
        if (data.success && data.user) {
            // Store user data globally
            currentUser = data.user;
            
            // Update profile info
            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const profileUserId = document.getElementById('profile-userId');
            const profileAbout = document.getElementById('profile-about');
            
            if (profileName) profileName.textContent = data.user.name || 'User';
            if (profileEmail) profileEmail.textContent = data.user.email || '';
            if (profileUserId) profileUserId.textContent = data.user.userId || '';
            if (profileAbout) profileAbout.textContent = data.user.about || '';
            
            // Update profile avatar
            updateProfileAvatar(data.user);
            
            // Update stats
            const statTotal = document.getElementById('stat-total-habits');
            const statCompleted = document.getElementById('stat-completed-today');
            
            if (statTotal) statTotal.textContent = habits.length;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const completedToday = habits.filter(h => {
                const entry = h.completionHistory?.find(e => {
                    const d = new Date(e.date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === today.getTime();
                });
                return entry && entry.status === 'completed';
            }).length;
            
            if (statCompleted) statCompleted.textContent = completedToday;
            
            // FIXED: Render badges for all habits
            renderBadges();
            
            // FIXED: Render achievements dynamically
            renderAchievements();
            
            // Hide loading, show content
            const loading = document.querySelector('.profile-loading');
            const content = document.querySelector('.profile-content');
            if (loading) loading.style.display = 'none';
            if (content) content.style.display = 'block';
        } else {
            console.error('Profile data not found:', data);
            showMessage('Failed to load profile', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Failed to load profile', 'error');
    }
}

/**
 * Update profile avatar with photo or initials
 */
function updateProfileAvatar(user) {
    console.log('Updating profile avatar with user:', user);
    console.log('photoURL:', user.photoURL);
    
    const profileAvatar = document.getElementById('profile-avatar');
    const profileAvatarEdit = document.getElementById('profile-avatar-edit');
    const navProfileIcon = document.getElementById('nav-profile-icon');
    
    // Update all avatar elements (profile page view, edit, and navbar)
    [profileAvatar, profileAvatarEdit, navProfileIcon].forEach(avatar => {
        if (!avatar) {
            console.log('Avatar element not found');
            return;
        }
        
        console.log('Updating avatar element:', avatar.id);
        
        // Clear existing content
        avatar.innerHTML = '';
        
        if (user.photoURL) {
            console.log('Setting photo URL:', user.photoURL);
            // Show photo
            const img = document.createElement('img');
            img.src = user.photoURL;
            img.alt = user.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            img.onerror = function() {
                console.error('Failed to load image:', user.photoURL);
                // If image fails to load, show initials
                this.remove();
                const span = document.createElement('span');
                span.className = avatar.id === 'nav-profile-icon' ? 'profile-icon-text' : 'avatar-text';
                span.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
                avatar.appendChild(span);
            };
            img.onload = function() {
                console.log('Image loaded successfully');
            };
            avatar.appendChild(img);
        } else {
            console.log('No photoURL, showing initials');
            // Show initials
            const span = document.createElement('span');
            span.className = avatar.id === 'nav-profile-icon' ? 'profile-icon-text' : 'avatar-text';
            span.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
            avatar.appendChild(span);
        }
    });
}

/**
 * FIXED: Render badges for all habits based on streak milestones
 * Shows all 9 badge levels with locked/unlocked states
 */
function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;
    
    // Clear existing badges
    container.innerHTML = '';
    
    // Badge definitions matching model
    const badgeLevels = [
        { level: 1, name: 'Day One', icon: '🌱', days: 1 },
        { level: 2, name: 'Week Warrior', icon: '🥉', days: 7 },
        { level: 3, name: 'Habit Former', icon: '🥈', days: 21 },
        { level: 4, name: 'Month Master', icon: '🏅', days: 30 },
        { level: 5, name: 'Halfway Hero', icon: '🎖️', days: 50 },
        { level: 6, name: 'Century Champion', icon: '🏆', days: 100 },
        { level: 7, name: 'Double Century', icon: '💎', days: 200 },
        { level: 8, name: 'Triple Century', icon: '👑', days: 300 },
        { level: 9, name: 'Year Master', icon: '🌟', days: 365 }
    ];
    
    // Calculate max streak across all habits
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    
    // Render each badge
    badgeLevels.forEach(badge => {
        const isUnlocked = maxStreak >= badge.days;
        const badgeItem = document.createElement('div');
        badgeItem.className = `badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'} badge-${badge.days}`;
        
        badgeItem.innerHTML = `
            <div class="badge-circle">
                <div class="badge-icon">${badge.icon}</div>
            </div>
            <div class="badge-info">
                <div class="badge-name">${badge.name}</div>
                <div class="badge-days">${badge.days} ${badge.days === 1 ? 'day' : 'days'}</div>
                <div class="badge-status">${isUnlocked ? '✓ Unlocked' : 'Locked'}</div>
            </div>
        `;
        
        container.appendChild(badgeItem);
    });
}

/**
 * FIXED: Render achievements dynamically based on user progress
 * Automatically unlocks achievements when conditions are met
 */
function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    
    // Clear existing achievements
    container.innerHTML = '';
    
    // Calculate stats for achievement unlocks
    const totalHabits = habits.length;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    
    // Calculate total completions across all habits
    let totalCompletions = 0;
    habits.forEach(habit => {
        const completed = habit.completionHistory?.filter(e => e.status === 'completed').length || 0;
        totalCompletions += completed;
    });
    
    // Check for perfect week (all habits completed every day for 7 consecutive days)
    let hasPerfectWeek = false;
    if (habits.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let consecutiveDays = 0;
        
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);
            
            const allCompletedOnDate = habits.every(habit => {
                return habit.completionHistory?.some(entry => {
                    const entryDate = new Date(entry.date);
                    entryDate.setHours(0, 0, 0, 0);
                    return entryDate.getTime() === checkDate.getTime() && entry.status === 'completed';
                });
            });
            
            if (allCompletedOnDate) {
                consecutiveDays++;
            } else {
                break;
            }
        }
        
        hasPerfectWeek = consecutiveDays >= 7;
    }
    
    // Define achievement criteria
    const achievements = [
        {
            id: 'first-habit',
            icon: '🌱',
            name: 'First Habit',
            description: 'Create your first habit',
            unlocked: totalHabits >= 1
        },
        {
            id: 'habit-collector',
            icon: '📚',
            name: 'Habit Collector',
            description: 'Track 5 different habits',
            unlocked: totalHabits >= 5
        },
        {
            id: 'habit-master',
            icon: '👑',
            name: 'Habit King',
            description: 'Track 10+ habits',
            unlocked: totalHabits >= 10
        },
        {
            id: 'streak-starter',
            icon: '⚡',
            name: 'Streak Starter',
            description: 'Maintain a 3-day streak',
            unlocked: maxStreak >= 3
        },
        {
            id: 'streak-master',
            icon: '🔥',
            name: 'Streak Master',
            description: 'Maintain a 7-day streak',
            unlocked: maxStreak >= 7
        },
        {
            id: 'on-fire',
            icon: '💥',
            name: 'On Fire!',
            description: '30-day streak achieved',
            unlocked: maxStreak >= 30
        },
        {
            id: 'dedicated',
            icon: '💪',
            name: 'Dedicated',
            description: 'Complete 30 habits total',
            unlocked: totalCompletions >= 30
        },
        {
            id: 'committed',
            icon: '🎯',
            name: 'Committed',
            description: 'Complete 100 habits total',
            unlocked: totalCompletions >= 100
        },
        {
            id: 'unstoppable',
            icon: '🚀',
            name: 'Unstoppable',
            description: 'Complete 365 habits total',
            unlocked: totalCompletions >= 365
        },
        {
            id: 'perfect-week',
            icon: '✨',
            name: 'Perfect Week',
            description: 'Complete all habits for 7 days',
            unlocked: hasPerfectWeek
        },
        {
            id: 'century-club',
            icon: '🏆',
            name: 'Century Club',
            description: '100-day streak achieved',
            unlocked: maxStreak >= 100
        },
        {
            id: 'legend',
            icon: '⭐',
            name: 'Legend',
            description: '365-day streak achieved',
            unlocked: maxStreak >= 365
        }
    ];
    
    // Render each achievement
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}`;
        
        // Add unlock date if available (from achievements in profile)
        let dateHTML = '';
        if (achievement.unlocked) {
            dateHTML = '<div class="achievement-date">Unlocked!</div>';
        }
        
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
            ${dateHTML}
        `;
        
        // Add animation for newly unlocked achievements
        if (achievement.unlocked) {
            card.style.animation = 'achievementPulse 1s ease-out';
        }
        
        container.appendChild(card);
    });
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    console.log(`[Achievements] Rendered ${achievements.length} achievements. Unlocked: ${unlockedCount}`);
}

// ========== Profile Edit Functions ==========

window.enterEditMode = function() {
    const editMode = document.getElementById('profile-edit-mode');
    const displayMode = document.getElementById('profile-view-mode');
    
    if (editMode && displayMode) {
        displayMode.style.display = 'none';
        editMode.style.display = 'block';
        
        // Pre-fill form with current values
        const nameInput = document.getElementById('name-input');
        const aboutInput = document.getElementById('about-input');
        const photoURLInput = document.getElementById('photoURL-input');
        const aboutCharCount = document.getElementById('about-char-count');
        
        const currentName = document.getElementById('profile-name');
        const currentAbout = document.getElementById('profile-about');
        
        if (nameInput && currentName) {
            nameInput.value = currentName.textContent;
        }
        
        if (aboutInput && currentAbout) {
            aboutInput.value = currentAbout.textContent;
            if (aboutCharCount) {
                aboutCharCount.textContent = aboutInput.value.length;
            }
        }
        
        // Pre-fill photoURL if available
        if (photoURLInput && currentUser && currentUser.photoURL) {
            photoURLInput.value = currentUser.photoURL;
        }
        
        // Add character counter for about field
        if (aboutInput && aboutCharCount) {
            aboutInput.addEventListener('input', function() {
                aboutCharCount.textContent = this.value.length;
            });
        }
    }
}

window.cancelEditMode = function() {
    const editMode = document.getElementById('profile-edit-mode');
    const displayMode = document.getElementById('profile-view-mode');
    
    if (editMode && displayMode) {
        editMode.style.display = 'none';
        displayMode.style.display = 'block';
    }
}

window.clearPhotoURL = function() {
    const photoURLInput = document.getElementById('photoURL-input');
    if (photoURLInput) {
        photoURLInput.value = '';
        showMessage('Photo URL cleared. Click "Save Changes" to update.', 'info');
    }
}

window.saveProfile = async function(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('name-input');
    const aboutInput = document.getElementById('about-input');
    const photoURLInput = document.getElementById('photoURL-input');
    
    const name = nameInput?.value.trim();
    const about = aboutInput?.value.trim();
    const photoURL = photoURLInput?.value.trim();
    
    if (!name) {
        showMessage('Name is required', 'error');
        return;
    }
    
    // Validate photo URL if provided
    if (photoURL) {
        // Check if it's a direct image URL
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
        const isDirectImageURL = imageExtensions.test(photoURL);
        
        if (!isDirectImageURL) {
            showMessage('⚠️ Please use a direct image URL (must end with .jpg, .png, .gif, etc.). Google/search result links won\'t work.', 'error');
            return;
        }
        
        // Check if URL is valid
        try {
            new URL(photoURL);
        } catch (e) {
            showMessage('Invalid URL format', 'error');
            return;
        }
    }
    
    try {
        const response = await fetch('/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                about,
                photoURL: photoURL || null // Send null to clear the photo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Profile updated successfully! 🎉', 'success');
            
            // Update currentUser with new data
            currentUser = data.user;
            
            // Update display with new values
            const displayName = document.getElementById('profile-name');
            const displayAbout = document.getElementById('profile-about');
            
            if (displayName) displayName.textContent = data.user.name;
            if (displayAbout) displayAbout.textContent = data.user.about || '';
            
            // Update profile avatar with new photo
            updateProfileAvatar(data.user);
            
            // Exit edit mode
            cancelEditMode();
        } else {
            showMessage(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile', 'error');
    }
}

window.copyToClipboard = function(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.textContent) {
        navigator.clipboard.writeText(element.textContent)
            .then(() => {
                showMessage('Copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                showMessage('Failed to copy to clipboard', 'error');
            });
    }
}

// ========== Yearly View Functions ==========

/**
 * Initialize yearly view page
 */
async function loadYearlyView() {
    try {
        // Populate habits dropdown
        const habitSelect = document.getElementById('yearly-habit-select');
        habitSelect.innerHTML = '<option value="">Choose a habit...</option>';
        
        habits.forEach(habit => {
            const option = document.createElement('option');
            option.value = habit._id;
            option.textContent = habit.name;
            habitSelect.appendChild(option);
        });
        
        // Populate years dropdown (last 5 years to current year)
        const yearSelect = document.getElementById('yearly-year-select');
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';
        
        for (let year = currentYear; year >= currentYear - 4; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
        
        // Setup event listeners
        habitSelect.addEventListener('change', fetchYearlyData);
        yearSelect.addEventListener('change', fetchYearlyData);
        
    } catch (error) {
        console.error('Error loading yearly view:', error);
    }
}

/**
 * Fetch and display yearly data for selected habit and year
 */
async function fetchYearlyData() {
    const habitSelect = document.getElementById('yearly-habit-select');
    const yearSelect = document.getElementById('yearly-year-select');
    const container = document.getElementById('yearly-grid-container');
    
    const habitId = habitSelect.value;
    const year = yearSelect.value;
    
    if (!habitId) {
        container.innerHTML = '<p class="loading-text">Select a habit to view yearly progress...</p>';
        return;
    }
    
    try {
        container.innerHTML = '<p class="loading-text">Loading yearly data...</p>';
        
        const response = await fetch(`${API_URL}/${habitId}/yearly?year=${year}`);
        const data = await response.json();
        
        if (data.success) {
            renderYearlyGrid(data.data);
        } else {
            container.innerHTML = `<p class="error-text">${data.message}</p>`;
        }
    } catch (error) {
        console.error('Error fetching yearly data:', error);
        container.innerHTML = '<p class="error-text">Failed to load yearly data</p>';
    }
}

/**
 * Render 365-day yearly grid
 */
function renderYearlyGrid(data) {
    const container = document.getElementById('yearly-grid-container');
    const { habitName, year, isLeapYear, yearData } = data;
    
    // Create header
    const header = document.createElement('div');
    header.className = 'yearly-header';
    header.innerHTML = `
        <h3>${habitName}</h3>
        <p>${year} ${isLeapYear ? '(Leap Year - 366 days)' : '(365 days)'}</p>
    `;
    
    // Create months container
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'yearly-months-grid';
    
    // Group days by month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Organize data by month
    const monthsData = {};
    yearData.forEach(day => {
        const date = new Date(day.date);
        const monthIndex = date.getMonth();
        
        if (!monthsData[monthIndex]) {
            monthsData[monthIndex] = [];
        }
        monthsData[monthIndex].push(day);
    });
    
    // Render each month
    for (let i = 0; i < 12; i++) {
        if (monthsData[i]) {
            monthsContainer.appendChild(createMonthBlock(monthNames[i], monthsData[i]));
        }
    }
    
    // Statistics
    const stats = calculateYearlyStats(yearData);
    const statsDiv = document.createElement('div');
    statsDiv.className = 'yearly-stats';
    statsDiv.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.completed}</div>
            <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.skipped}</div>
            <div class="stat-label">Skipped</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.missed}</div>
            <div class="stat-label">Missed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.completionRate}%</div>
            <div class="stat-label">Completion Rate</div>
        </div>
    `;
    
    // Clear and populate container
    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(statsDiv);
    container.appendChild(monthsContainer);
}

/**
 * Create a month block with days grid
 */
function createMonthBlock(monthName, days) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month-block';
    
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-name';
    monthHeader.textContent = monthName;
    
    // Add weekday labels
    const weekdayLabels = document.createElement('div');
    weekdayLabels.className = 'weekday-labels';
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekdays.forEach(day => {
        const label = document.createElement('div');
        label.className = 'weekday-label';
        label.textContent = day;
        weekdayLabels.appendChild(label);
    });
    
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';
    
    // Add empty cells for days before the first day of the month
    if (days.length > 0) {
        const firstDate = new Date(days[0].date);
        const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Add empty cells
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            daysGrid.appendChild(emptyCell);
        }
    }
    
    // Add actual day cells
    days.forEach(day => {
        const dayCell = document.createElement('div');
        const date = new Date(day.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        
        // Check if this is today
        const isToday = dayDate.getTime() === today.getTime();
        
        dayCell.className = `day-cell ${day.status}${isToday ? ' today' : ''}`;
        dayCell.title = formatDateForTooltip(day.date, day.status, isToday);
        
        dayCell.textContent = date.getDate();
        
        // Add data attribute for enhanced tooltips
        dayCell.setAttribute('data-date', day.date);
        dayCell.setAttribute('data-status', day.status);
        
        daysGrid.appendChild(dayCell);
    });
    
    monthDiv.appendChild(monthHeader);
    monthDiv.appendChild(weekdayLabels);
    monthDiv.appendChild(daysGrid);
    
    return monthDiv;
}

/**
 * Calculate yearly statistics
 */
function calculateYearlyStats(yearData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only count eligible (non-future, non-ineligible) days
    const eligibleDays = yearData.filter(d => {
        const dayDate = new Date(d.date);
        return dayDate <= today && d.status !== 'ineligible';
    });
    
    const completed = eligibleDays.filter(d => d.status === 'completed').length;
    const skipped = eligibleDays.filter(d => d.status === 'skipped').length;
    const missed = eligibleDays.filter(d => d.status === 'missed').length;
    
    const totalEligibleDays = eligibleDays.length;
    const completionRate = totalEligibleDays > 0 
        ? Math.round(((completed + skipped) / totalEligibleDays) * 100) 
        : 0;
    
    return { completed, skipped, missed, completionRate };
}

/**
 * Format date for tooltip
 */
function formatDateForTooltip(dateStr, status, isToday = false) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);
    
    const statusIcons = {
        'completed': '✅',
        'skipped': '⏭️',
        'missed': '❌',
        'future': '📅',
        'ineligible': '⚪'
    };
    
    const statusText = {
        'completed': 'Completed',
        'skipped': 'Skipped',
        'missed': 'Missed',
        'future': 'Future date',
        'ineligible': 'Before signup'
    };
    
    const todayText = isToday ? ' (TODAY)' : '';
    return `${statusIcons[status]} ${formatted}${todayText}\nStatus: ${statusText[status] || status}`;
}

// Make functions global
window.switchPage = switchPage;
window.toggleToday = toggleToday;
window.deleteHabit = deleteHabit;
