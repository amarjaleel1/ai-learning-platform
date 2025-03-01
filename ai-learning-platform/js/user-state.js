/**
 * User state management module for the AI Learning Platform
 * Handles saving/loading user progress, achievements, and preferences
 */

// Default user state structure
const defaultUserState = {
    username: 'Guest',
    coins: 0,
    completedLessons: [],
    currentLesson: null,
    achievements: [],
    streak: 0,
    lastLoginDate: null,
    preferences: {
        theme: 'light',
        soundEffects: true,
        analyticsConsent: true
    },
    createdAt: new Date().toISOString()
};

// The user state object that will be used throughout the application
let userState = { ...defaultUserState };

/**
 * Initialize user state from storage
 * @returns {Promise} Promise that resolves when user state is loaded
 */
async function initUserState() {
    return new Promise((resolve) => {
        try {
            const storedState = localStorage.getItem('ai_learning_user_state');
            
            if (storedState) {
                // Parse stored state
                const parsedState = JSON.parse(storedState);
                
                // Merge with default state to ensure all properties exist
                userState = {
                    ...defaultUserState,
                    ...parsedState,
                    // Ensure nested objects are properly merged
                    preferences: {
                        ...defaultUserState.preferences,
                        ...(parsedState.preferences || {})
                    }
                };
                
                console.log('User state loaded from storage');
            } else {
                // First time user - ask for name
                askForUsername().then(() => {
                    // Generate a unique ID for this user
                    userState.userId = generateUserId();
                    saveUserState();
                });
            }
            
            resolve(userState);
        } catch (error) {
            console.error('Error initializing user state:', error);
            
            // Fallback to default state
            userState = { ...defaultUserState };
            resolve(userState);
        }
    });
}

/**
 * Generate a unique user ID
 * @returns {string} Unique ID
 */
function generateUserId() {
    return 'user_' + 
           Math.random().toString(36).substring(2, 10) + 
           Date.now().toString(36);
}

/**
 * Ask the user for their name
 * @returns {Promise} Promise that resolves when username is set
 */
function askForUsername() {
    return new Promise((resolve) => {
        // Check if there's already a modal in the DOM
        if (document.querySelector('.modal')) {
            resolve();
            return;
        }
        
        // Create welcome modal
        const modal = document.createElement('div');
        modal.className = 'modal welcome-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Welcome to AI Learning Platform!</h3>
                </div>
                <div class="modal-body">
                    <p>Please tell us your name so we can personalize your learning experience.</p>
                    <div class="input-group">
                        <label for="username-input">Name</label>
                        <input type="text" id="username-input" placeholder="Enter your name" maxlength="30">
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="continue-btn" class="primary-button">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-focus on input
        setTimeout(() => {
            const input = document.getElementById('username-input');
            if (input) {
                input.focus();
            }
        }, 100);
        
        // Handle continue button click
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                const input = document.getElementById('username-input');
                const name = input?.value.trim() || '';
                
                if (name) {
                    userState.username = name;
                }
                
                // Remove modal
                document.body.removeChild(modal);
                
                resolve();
            });
        }
        
        // Handle Enter key on input
        const input = document.getElementById('username-input');
        if (input) {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    continueBtn.click();
                }
            });
        }
    });
}

/**
 * Save user state to storage
 * @param {Object} updates - Optional object with updates to apply
 * @returns {Object} The updated user state
 */
function saveUserState(updates = {}) {
    try {
        // Apply updates if any
        if (Object.keys(updates).length > 0) {
            userState = {
                ...userState,
                ...updates,
                // If there are preference updates, merge them properly
                preferences: updates.preferences ? 
                    { ...userState.preferences, ...updates.preferences } :
                    userState.preferences
            };
        }
        
        // Save to localStorage
        localStorage.setItem('ai_learning_user_state', JSON.stringify(userState));
        
        // Update UI
        updateUserInfoDisplay(userState);
        
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('user-state-updated', { detail: userState }));
        
        return userState;
    } catch (error) {
        console.error('Error saving user state:', error);
        
        // Show notification if function is available
        if (typeof showNotification === 'function') {
            showNotification('Could not save your progress. Please check your browser storage settings.', 'error');
        }
        
        return userState;
    }
}

/**
 * Reset user progress (for debugging or user request)
 * @param {boolean} keepUsername - Whether to keep the username or reset it too
 * @returns {Promise} Promise that resolves when the state is reset
 */
function resetUserProgress(keepUsername = true) {
    return new Promise((resolve, reject) => {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            reject(new Error('User cancelled reset'));
            return;
        }
        
        try {
            // Save username if requested
            const username = keepUsername ? userState.username : 'Guest';
            
            // Reset to default state
            userState = {
                ...defaultUserState,
                username,
                createdAt: new Date().toISOString()
            };
            
            // Save the reset state
            saveUserState();
            
            // Show notification if function is available
            if (typeof showNotification === 'function') {
                showNotification('All progress has been reset.', 'info');
            }
            
            // Reload the page to refresh everything
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            resolve();
        } catch (error) {
            console.error('Error resetting user progress:', error);
            reject(error);
        }
    });
}

/**
 * Award coins to the user
 * @param {number} amount - Amount of coins to award
 * @param {string} reason - Reason for awarding coins
 */
function awardCoins(amount, reason = '') {
    if (!amount || amount <= 0) return;
    
    // Update coin count
    userState.coins = (userState.coins || 0) + amount;
    
    // Save the updated state
    saveUserState();
    
    // Show coin animation if function exists
    if (typeof animateCoinAward === 'function') {
        animateCoinAward(amount);
    }
    
    // Show notification if function exists
    if (typeof showNotification === 'function') {
        showNotification(`+${amount} coins${reason ? ' for ' + reason : ''}`, 'success');
    }
    
    // Play sound if function exists and enabled
    if (typeof playSoundEffect === 'function' && userState.preferences?.soundEffects !== false) {
        playSoundEffect('coin');
    }
}

/**
 * Mark a lesson as completed
 * @param {string} lessonId - ID of the completed lesson
 */
function completeLesson(lessonId) {
    if (!lessonId) return;
    
    // Only add if not already completed
    if (!userState.completedLessons.includes(lessonId)) {
        // Add to completed lessons
        userState.completedLessons.push(lessonId);
        
        // Add completion date
        if (!userState.completionDates) {
            userState.completionDates = {};
        }
        userState.completionDates[lessonId] = new Date().toISOString();
        
        // Save the updated state
        saveUserState();
        
        // Find lesson to get coin reward
        const lesson = window.lessons?.find(l => l.id === lessonId);
        if (lesson && lesson.coinReward) {
            awardCoins(lesson.coinReward, `completing "${lesson.title}"`);
        } else {
            // Default reward if not specified
            awardCoins(5, "completing lesson");
        }
        
        // Update lessons list if function exists
        if (typeof updateLessonList === 'function') {
            updateLessonList();
        }
        
        // Track analytics if function exists
        if (typeof trackLessonCompletion === 'function') {
            const timeSpent = calculateTimeSpent(lessonId);
            trackLessonCompletion(lessonId, timeSpent);
        }
        
        // Check for achievements if function exists
        if (typeof checkAchievements === 'function') {
            checkAchievements();
        }
    }
}

/**
 * Calculate approximate time spent on a lesson
 * @param {string} lessonId - ID of the lesson
 * @returns {number} Time in seconds
 */
function calculateTimeSpent(lessonId) {
    // In a real app, you'd track when the lesson was started
    // Here we'll just return a placeholder value
    return 300; // 5 minutes
}

/**
 * Update the UI display with user information
 */
function updateUserInfoDisplay() {
    // Update username display
    const usernameDisplay = document.getElementById('username');
    if (usernameDisplay) {
        usernameDisplay.textContent = userState.username;
    }
    
    // Update coin display
    const coinDisplay = document.getElementById('coins');
    if (coinDisplay) {
        coinDisplay.textContent = userState.coins || 0;
    }
}

/**
 * Check if user has unlocked a specific lesson
 * @param {string} lessonId - ID of the lesson to check
 * @returns {boolean} Whether the lesson is unlocked
 */
function isLessonUnlocked(lessonId) {
    // If already completed, it's unlocked
    if (userState.completedLessons.includes(lessonId)) {
        return true;
    }
    
    // Find the lesson
    const lesson = window.lessons?.find(l => l.id === lessonId);
    if (!lesson) return false;
    
    // Check if user has enough coins
    return (lesson.requiredCoins || 0) <= (userState.coins || 0);
}

/**
 * Get the current user state
 * @returns {Object} The current user state
 */
function getUserState() {
    return userState;
}

// Export user state functions for global use
window.userState = userState;
window.initUserState = initUserState;
window.saveUserState = saveUserState;
window.resetUserProgress = resetUserProgress;
window.awardCoins = awardCoins;
window.completeLesson = completeLesson;
window.isLessonUnlocked = isLessonUnlocked;
window.getUserState = getUserState;
