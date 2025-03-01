/**
 * State management module for AI Learning Platform
 * Handles user state, progress, and persistence
 */

// Default user state
const defaultUserState = {
    username: "Guest",
    coins: 100,
    completedLessons: [],
    currentLesson: null,
    achievements: [],
    lastActive: new Date().toISOString(),
    preferences: {
        theme: "light",
        codeEditorFontSize: 14,
        notifications: true
    }
};

// Current user state
let userState = { ...defaultUserState };

/**
 * Initialize user state from local storage or defaults
 */
export async function initUserState() {
    console.log("Initializing user state");
    try {
        const savedState = localStorage.getItem('aiLearningUserState');
        if (savedState) {
            console.log("Found saved user state");
            userState = JSON.parse(savedState);
            userState.lastActive = new Date().toISOString();
        } else {
            console.log("No saved state found, using defaults");
            userState = { ...defaultUserState };
        }
        
        // Update UI with user state
        updateUIWithUserState();
        return userState;
    } catch (error) {
        console.error("Error initializing user state:", error);
        userState = { ...defaultUserState };
        return userState;
    }
}

/**
 * Update UI elements based on user state
 */
function updateUIWithUserState() {
    // Update username display
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = userState.username;
    }
    
    // Update coins display
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = userState.coins.toString();
    }
}

/**
 * Save current user state to localStorage
 */
export function saveUserState() {
    try {
        userState.lastActive = new Date().toISOString();
        localStorage.setItem('aiLearningUserState', JSON.stringify(userState));
        console.log("User state saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving user state:", error);
        return false;
    }
}

/**
 * Get the current user state
 * @returns {Object} Current user state
 */
export function getUserState() {
    return { ...userState };
}

/**
 * Update user's coin balance
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @returns {Object} Updated user state
 */
export function updateCoins(amount) {
    userState.coins += amount;
    // Ensure coins don't go negative
    if (userState.coins < 0) {
        userState.coins = 0;
    }
    
    // Update UI
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = userState.coins.toString();
        
        // Add animation for feedback
        coinsElement.classList.add('coin-update');
        setTimeout(() => {
            coinsElement.classList.remove('coin-update');
        }, 500);
    }
    
    // Save state
    saveUserState();
    return userState;
}

/**
 * Mark a lesson as completed
 * @param {string} lessonId - ID of the completed lesson
 * @param {number} score - Score achieved (0-100)
 * @returns {Object} Updated user state
 */
export function completeLesson(lessonId, score = 100) {
    // Check if already completed to avoid duplicates
    const existingCompletion = userState.completedLessons.find(lesson => lesson.id === lessonId);
    
    if (existingCompletion) {
        // Update existing completion if score is higher
        if (score > existingCompletion.score) {
            existingCompletion.score = score;
            existingCompletion.completedAt = new Date().toISOString();
        }
    } else {
        // Add new completion
        userState.completedLessons.push({
            id: lessonId,
            score: score,
            completedAt: new Date().toISOString()
        });
        
        // Award coins for first-time completion
        updateCoins(50);
    }
    
    saveUserState();
    return userState;
}

export default {
    initUserState,
    saveUserState,
    getUserState,
    updateCoins,
    completeLesson
};
