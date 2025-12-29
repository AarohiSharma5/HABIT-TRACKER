/**
 * AI Routine Assistant
 * Handles AI-generated habit routines using Gemini API
 */

// ========== Global State ==========
let currentRoutineHabitId = null;
let currentRoutineHabitName = '';
let currentRoutineHabitCategory = '';
let currentRoutine = null;
const ROUTINE_API_URL = '/api/routines';

// ========== Modal Functions ==========

/**
 * Open routine modal for a habit
 */
window.openRoutineModal = async function(habitId, habitName, habitCategory) {
    currentRoutineHabitId = habitId;
    currentRoutineHabitName = habitName;
    currentRoutineHabitCategory = habitCategory;
    
    const modal = document.getElementById('routine-modal');
    const title = document.getElementById('routine-modal-title');
    const subtitle = document.getElementById('routine-modal-subtitle');
    const requestView = document.getElementById('routine-request-view');
    const displayView = document.getElementById('routine-display-view');
    
    title.textContent = `Personal Routine for ${habitName}`;
    subtitle.textContent = 'Let\'s create a personalized routine to help you succeed!';
    
    // Check if routine already exists
    try {
        const response = await fetch(`${ROUTINE_API_URL}/${habitId}`);
        const data = await response.json();
        
        if (data.success && data.routine) {
            // Show existing routine
            currentRoutine = data.routine;
            displayRoutine(data.routine);
            requestView.style.display = 'none';
            displayView.style.display = 'block';
        } else {
            // Show request form
            requestView.style.display = 'block';
            displayView.style.display = 'none';
            document.getElementById('routine-prompt-input').value = '';
        }
    } catch (error) {
        console.error('Error checking for routine:', error);
        // Show request form on error
        requestView.style.display = 'block';
        displayView.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
};

/**
 * Close routine modal
 */
window.closeRoutineModal = function() {
    const modal = document.getElementById('routine-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset state
    currentRoutineHabitId = null;
    currentRoutineHabitName = '';
    currentRoutineHabitCategory = '';
    currentRoutine = null;
};

/**
 * Display routine in the modal
 */
function displayRoutine(routine) {
    const displayDiv = document.getElementById('routine-text-display');
    
    // Format the AI-generated text with proper line breaks and styling
    const formattedText = routine.aiRoutineText
        .split('\n')
        .map(line => {
            // Convert markdown-style headers
            if (line.startsWith('##')) {
                return `<h3 class="routine-heading">${line.replace(/^##\s*/, '')}</h3>`;
            } else if (line.startsWith('#')) {
                return `<h2 class="routine-heading">${line.replace(/^#\s*/, '')}</h2>`;
            }
            // Convert bullet points
            else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                return `<li class="routine-item">${line.replace(/^[\*\-]\s*/, '')}</li>`;
            }
            // Convert numbered lists
            else if (line.trim().match(/^\d+\./)) {
                return `<li class="routine-item-numbered">${line.replace(/^\d+\.\s*/, '')}</li>`;
            }
            // Regular paragraphs
            else if (line.trim().length > 0) {
                return `<p class="routine-paragraph">${line}</p>`;
            }
            return '';
        })
        .join('');
    
    displayDiv.innerHTML = `
        <div class="routine-meta">
            <small class="routine-timestamp">
                Generated on ${new Date(routine.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                })}
            </small>
            <small class="routine-prompt">Your request: "${routine.userPrompt}"</small>
        </div>
        <div class="routine-text">
            ${formattedText}
        </div>
    `;
}

/**
 * Regenerate routine
 */
window.regenerateRoutine = function() {
    const requestView = document.getElementById('routine-request-view');
    const displayView = document.getElementById('routine-display-view');
    const subtitle = document.getElementById('routine-modal-subtitle');
    
    // Pre-fill with previous prompt if available
    if (currentRoutine && currentRoutine.userPrompt) {
        document.getElementById('routine-prompt-input').value = currentRoutine.userPrompt;
    }
    
    subtitle.textContent = 'Let\'s create a new personalized routine for you!';
    requestView.style.display = 'block';
    displayView.style.display = 'none';
};

/**
 * Delete routine
 */
window.deleteRoutine = async function() {
    if (!currentRoutineHabitId) return;
    
    if (!confirm('Are you sure you want to delete this routine?')) {
        return;
    }
    
    try {
        const response = await fetch(`${ROUTINE_API_URL}/${currentRoutineHabitId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showRoutineMessage('Routine deleted successfully', 'success');
            closeRoutineModal();
        } else {
            showRoutineMessage(data.message || 'Failed to delete routine', 'error');
        }
    } catch (error) {
        console.error('Error deleting routine:', error);
        showRoutineMessage('Error deleting routine', 'error');
    }
};

// ========== Form Handling ==========

/**
 * Initialize routine feature
 */
function initializeRoutineFeature() {
    const routineForm = document.getElementById('routine-request-form');
    
    if (routineForm) {
        routineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await generateRoutine();
        });
    }
    
    // Close modal on overlay click
    const modal = document.getElementById('routine-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeRoutineModal();
            }
        });
    }
}

/**
 * Generate new routine using Gemini API
 */
async function generateRoutine() {
    const promptInput = document.getElementById('routine-prompt-input');
    const userPrompt = promptInput.value.trim();
    
    if (!userPrompt) {
        showRoutineMessage('Please enter a prompt', 'error');
        return;
    }
    
    if (!currentRoutineHabitId) {
        showRoutineMessage('No habit selected', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#routine-request-form button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${ROUTINE_API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                habitId: currentRoutineHabitId,
                habitName: currentRoutineHabitName,
                habitCategory: currentRoutineHabitCategory,
                userPrompt: userPrompt
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.routine) {
            currentRoutine = data.routine;
            displayRoutine(data.routine);
            
            // Switch to display view
            document.getElementById('routine-request-view').style.display = 'none';
            document.getElementById('routine-display-view').style.display = 'block';
            
            showRoutineMessage('Routine generated successfully! 🎉', 'success');
        } else {
            showRoutineMessage(data.message || 'Couldn\'t generate a routine right now. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error generating routine:', error);
        showRoutineMessage('Couldn\'t generate a routine right now. Please try again.', 'error');
    } finally {
        // Reset loading state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

/**
 * Show routine message notification
 */
function showRoutineMessage(message, type) {
    const msg = document.createElement('div');
    msg.className = `routine-message routine-message-${type}`;
    msg.textContent = message;
    
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        info: '#6F7CF3'
    };
    
    msg.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 16px 24px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

// ========== Initialize on Load ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRoutineFeature);
} else {
    initializeRoutineFeature();
}
