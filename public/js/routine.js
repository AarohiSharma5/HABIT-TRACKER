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
    
    // Helper function to convert bold markdown to HTML
    const convertBoldText = (text) => {
        return text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*\*/g, ''); // Remove any remaining **
    };
    
    // Helper function to clean text
    const cleanText = (text) => {
        return convertBoldText(text.replace(/[\*#]+$/g, '').trim());
    };
    
    // Clean and format the AI-generated text
    let formattedText = routine.aiRoutineText
        // Remove excessive asterisks and dashes at line starts/ends
        .replace(/^[\*\-]{2,}\s*/gm, '')
        .replace(/\s[\*\-]{2,}$/gm, '')
        // Clean up excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    
    const lines = formattedText.split('\n');
    const processedLines = [];
    let inList = false;
    let listItems = [];
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) {
            // Close any open list
            if (inList) {
                processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            return;
        }
        
        // Main headings (# or ##)
        if (trimmed.startsWith('##')) {
            if (inList) {
                processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            const text = cleanText(trimmed.replace(/^##\s*/, ''));
            processedLines.push(`<h3 class="routine-heading routine-heading-sub">${text}</h3>`);
        }
        else if (trimmed.startsWith('#')) {
            if (inList) {
                processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            const text = cleanText(trimmed.replace(/^#\s*/, ''));
            processedLines.push(`<h2 class="routine-heading routine-heading-main">${text}</h2>`);
        }
        // Bullet points and list items
        else if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
            const text = cleanText(trimmed.replace(/^[\*\-•]\s*/, ''));
            if (text) {
                listItems.push(`<li class="routine-item">${text}</li>`);
                inList = true;
            }
        }
        // Numbered lists
        else if (trimmed.match(/^\d+[\.\)]\s/)) {
            if (inList && listItems.length > 0) {
                processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
                listItems = [];
            }
            const text = cleanText(trimmed.replace(/^\d+[\.\)]\s*/, ''));
            listItems.push(`<li class="routine-item-numbered">${text}</li>`);
            inList = true;
        }
        // Regular paragraphs
        else {
            if (inList) {
                processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            const text = cleanText(trimmed);
            processedLines.push(`<p class="routine-paragraph">${text}</p>`);
        }
    });
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
        processedLines.push(`<ul class="routine-list">${listItems.join('')}</ul>`);
    }
    
    displayDiv.innerHTML = `
        <div class="routine-meta">
            <div class="routine-timestamp">
                <span class="timestamp-icon">📅</span>
                <span>${new Date(routine.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                })}</span>
            </div>
            <div class="routine-prompt">
                <span class="prompt-icon">💬</span>
                <span>${routine.userPrompt}</span>
            </div>
        </div>
        <div class="routine-text">
            ${processedLines.join('')}
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
