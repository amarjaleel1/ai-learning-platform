/**
 * State management module for AI Learning Platform
 * Handles user state and application state
 */

// Default user state
const defaultUserState = {
    username: 'Guest',
    coins: 0,
    completedLessons: [],
    currentLesson: null,
    achievements: [],
    lastLoginDate: null,
    streak: 0,
    settings: {
        theme: 'light',
        codeEditorFontSize: 14,
        notifications: true
    }
};

// User state storage key
const USER_STATE_KEY = 'aiLearningPlatform_userState';

// Current user state
let userState = { ...defaultUserState };

/**
 * Initialize user state from localStorage or use default
 */
export function initUserState() {
    try {
        const savedState = localStorage.getItem(USER_STATE_KEY);
        
        if (savedState) {
            // Merge saved state with default state to handle any new properties
            const parsedState = JSON.parse(savedState);
            userState = {
                ...defaultUserState,  // Default values
                ...parsedState // Saved values override defaults
            };
        }
        
        // Check for daily login streak
        checkLoginStreak();
        
        // Update UI elements if needed
        updateUIFromState(userState);
        
        console.log("User state initialized:", userState);
    } catch (error) {
        console.error("Error initializing user state:", error);
        // Continue with default state if there was an error
    }
    
    return userState;
}

/**
 * Save current user state to localStorage
 * @param {Object} stateUpdate - The state properties to update
 * @returns {Promise} Promise resolving when state is saved
 */
export function saveUserState(stateUpdate = {}) {
    return new Promise((resolve, reject) => {
        try {
            // Update current state with new values
            userState = {
                ...userState,
                ...stateUpdate,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem(USER_STATE_KEY, JSON.stringify(userState));
            
            // Update UI elements if needed
            updateUIFromState(userState);
            
            resolve(userState);
        } catch (error) {
            console.error("Error saving user state:", error);
            reject(error);
        }
    });
}

/**
 * Load user state from localStorage
 * @returns {Promise} Promise resolving with the loaded state
 */
export function loadUserState() {
    return new Promise((resolve, reject) => {
        try {
            initUserState();
            resolve(userState);
        } catch (error) {
            console.error("Error loading user state:", error);
            reject(error);
        }
    });
}

/**
 * Get current user state
 * @returns {Object} Current user state
 */
export function getUserState() {
    return userState;
}

/**
 * Update UI elements based on user state
 * @param {Object} state - The user state
 */
function updateUIFromState(state) {
    // Update username
    const usernameElement = document.getElementById('username');
    if (usernameElement && state.username) {
        usernameElement.textContent = state.username;
    }
    
    // Update coins
    const coinsElement = document.getElementById('coins');
    if (coinsElement && state.coins !== undefined) {
        coinsElement.textContent = state.coins;
    }
}

/**
 * Check and update daily login streak
 */
function checkLoginStreak() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (userState.lastLoginDate) {
        const lastLogin = new Date(userState.lastLoginDate);
        const currentDate = new Date();
        
        // Calculate days between logins
        const timeDiff = currentDate.getTime() - lastLogin.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff === 1) {
            // Consecutive day login
            userState.streak += 1;
            // Award bonus coins for streaks at milestones
            if (userState.streak % 5 === 0) {
                const bonus = userState.streak;
                userState.coins += bonus;
                // Will be updated in main.js or notifications.js
                window.dispatchEvent(new CustomEvent('notification', { 
                    detail: {
                        message: `${bonus} bonus coins awarded for ${userState.streak} day streak!`,
                        type: "success"
                    }
                }));
            }
        } else if (daysDiff > 1) {
            // Streak broken
            userState.streak = 1;
        }
        // Same day login doesn't change streak
    } else {
        // First login ever
        userState.streak = 1;
    }
    
    userState.lastLoginDate = today;
    saveUserState();
}

/**
 * Reset user progress
 * @param {boolean} keepUsername - Whether to keep the username
 * @returns {Promise} Promise resolving when state is reset
 */
export function resetUserProgress(keepUsername = true) {
    const username = keepUsername ? userState.username : 'Guest';
    
    userState = {
        ...defaultUserState,
        username: username,
        lastLoginDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString()
    };
    
    return saveUserState();
}

/**
 * Update user coins
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @param {string} reason - Reason for coin change
 * @returns {Promise} Promise resolving with updated state
 */
export function updateCoins(amount, reason = '') {
    const previousCoins = userState.coins;
    userState.coins = Math.max(0, userState.coins + amount);
    
    // Dispatch coin change event for animations
    window.dispatchEvent(new CustomEvent('coin-change', { 
        detail: { 
            previous: previousCoins, 
            current: userState.coins, 
            change: amount,
            reason: reason
        } 
    }));
    
    return saveUserState();
}

// Export the module
export default {
    initUserState,
    saveUserState,
    loadUserState,
    getUserState,
    resetUserProgress,
    updateCoins
};
