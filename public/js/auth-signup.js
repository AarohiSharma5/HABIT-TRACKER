/**
 * Authentication Handler for Signup Page
 * 
 * This file handles all signup-related UI interactions including:
 * - Google Sign-Up popup flow
 * - User ID/Password signup
 * - Error handling and user feedback
 * 
 * IMPORTANT: Google Sign-In MUST be triggered by a direct user click event.
 * This is a security requirement enforced by browsers to prevent unauthorized
 * popup windows and to ensure users have explicit control over authentication flows.
 * 
 * Browser popup blockers will prevent popups that are:
 * - Triggered automatically on page load
 * - Triggered by setTimeout/setInterval
 * - Triggered by async operations that don't originate from user interaction
 * - Called without a direct user gesture
 */

// ========== Utility Functions ==========

/**
 * Display alert messages to users
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('error' or 'success')
 */
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alert');
    if (!alertDiv) return;
    
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show loading state on a button
 * @param {HTMLElement} button - The button element
 * @param {string} loadingText - Text to display during loading
 */
function setButtonLoading(button, loadingText) {
    button.classList.add('loading');
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = loadingText;
}

/**
 * Restore button to normal state
 * @param {HTMLElement} button - The button element
 */
function restoreButton(button) {
    button.classList.remove('loading');
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
}

/**
 * Restore Google Sign-up button with icon
 * @param {HTMLElement} button - The button element
 */
function restoreGoogleButton(button) {
    button.classList.remove('loading');
    button.innerHTML = `
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
    `;
}

// ========== Google Sign-Up Handler ==========

/**
 * Handle Google Sign-Up flow
 * 
 * CRITICAL: This function MUST be called directly from a user click event.
 * Calling this from any async callback or delayed execution will cause
 * the popup to be blocked by the browser's popup blocker.
 * 
 * The auth.signInWithPopup() method requires an active user gesture
 * to open the popup window. This is a security feature that prevents
 * malicious websites from opening unwanted popups.
 * 
 * @param {Event} event - The click event (ensures user gesture)
 */
async function handleGoogleSignUp(event) {
    const googleSignupBtn = document.getElementById('google-signup-btn');
    
    try {
        // Show loading state
        setButtonLoading(googleSignupBtn, 'Signing up with Google...');
        
        console.log('🔐 Initiating Google sign-up...');
        
        // Call Firebase sign-in (MUST be called directly from user click)
        // signInWithGoogle is defined in firebase-config.js and returns immediately
        const result = await signInWithGoogle();
        
        console.log('📋 Sign-up result:', result);
        
        // Handle cancellation gracefully (user closed popup)
        if (!result.success) {
            // Don't throw an error for user cancellations
            // Just show a gentle message and restore the button
            if (result.error && result.error.includes('cancelled')) {
                console.log('ℹ️ User cancelled sign-up');
                showAlert('Sign-up was cancelled. Click the button when you\'re ready to continue.', 'error');
            } else {
                // Other errors (popup blocked, network issues, etc.)
                console.error('❌ Sign-up failed:', result.error);
                showAlert(result.error || 'Google sign-up failed. Please try again.', 'error');
            }
            restoreGoogleButton(googleSignupBtn);
            return;
        }
        
        // Success - send token to backend
        console.log('✅ Google sign-up successful, sending token to backend...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            const response = await fetch('/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idToken: result.idToken }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('📥 Backend response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Backend error:', errorText);
                throw new Error(`Server returned ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ Backend authentication successful');
            
            if (data.success) {
                showAlert('Account created successfully! Redirecting...', 'success');
                // Small delay for user to see success message
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                throw new Error(data.message || 'Authentication failed');
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('❌ Request timeout - server not responding');
                throw new Error('Server is not responding. Please check your connection.');
            }
            console.error('❌ Fetch error:', fetchError);
            throw fetchError;
        }
        
    } catch (error) {
        console.error('❌ Google sign-up error:', error);
        showAlert(error.message || 'Failed to sign up with Google. Please try again.', 'error');
        restoreGoogleButton(googleSignupBtn);
    }
}

// ========== User ID/Password Signup Handler ==========

/**
 * Handle traditional user ID and password signup
 * @param {Event} event - The form submit event
 */
async function handleUserIdSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Validation
    if (!name || !userId || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        // Show loading state
        setButtonLoading(submitBtn, 'Creating account...');
        
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, name, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            throw new Error(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        showAlert(error.message || 'Failed to create account. User ID might be taken.', 'error');
        restoreButton(submitBtn);
    }
}

// ========== Password Toggle Handler ==========

/**
 * Toggle password visibility
 */
function handlePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (!togglePassword || !passwordInput) return;
    
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

// ========== Initialization ==========

/**
 * Initialize all event listeners after DOM is fully loaded
 * 
 * CRITICAL: All event listeners are attached here using addEventListener
 * within DOMContentLoaded to ensure:
 * 1. DOM elements exist before we try to attach listeners
 * 2. No inline event handlers (onclick, etc.) which violate CSP
 * 3. User clicks are directly connected to auth functions
 * 4. Firebase is fully initialized before any auth attempt
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Signup page loaded, initializing event listeners...');
    
    // Setup Google Sign-up button
    // IMPORTANT: addEventListener ensures the click is a genuine user gesture
    const googleSignupBtn = document.getElementById('google-signup-btn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleSignUp);
        console.log('✅ Google Sign-up button listener attached');
    } else {
        console.warn('⚠️ Google Sign-up button not found');
    }
    
    // Setup User ID signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleUserIdSignup);
        console.log('✅ Signup form listener attached');
    } else {
        console.warn('⚠️ Signup form not found');
    }
    
    // Setup password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', handlePasswordToggle);
        console.log('✅ Password toggle listener attached');
    }
    
    console.log('✅ All signup event listeners initialized successfully');
});
