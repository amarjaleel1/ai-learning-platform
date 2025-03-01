// User state object to track progress and achievements
let userState = {
    username: '',
    coins: 0,
    completedLessons: [],
    currentLesson: 'intro',
    achievements: [],
    lastAccessed: null
};

// Initialize user state from local storage
async function initUserState() {
    return new Promise((resolve) => {
        loadUserState().then(() => {
            updateUserInfoDisplay();
            resolve();
        }).catch(error => {
            console.error("Error loading user state:", error);
            // If loading fails, we'll use the default state
            updateUserInfoDisplay();
            resolve();
        });
    });
}

// Load user state from localStorage
async function loadUserState() {
    return new Promise((resolve, reject) => {
        try {
            const savedState = localStorage.getItem('ai_learning_user_state');
            if (savedState) {
                userState = JSON.parse(savedState);
                console.log("User state loaded:", userState);
            } else {
                // If no saved state, prompt for username on first visit
                const username = prompt("Welcome! Please enter your name:", "Learner");
                userState.username = username || "Learner";
                saveUserState();
            }
            resolve(userState);
        } catch (error) {
            console.error("Error loading user state:", error);
            reject(error);
        }
    });
}

// Save user state to localStorage
function saveUserState(updates = {}) {
    // Update the user state with any provided updates
    if (Object.keys(updates).length) {
        userState = { ...userState, ...updates };
    }
    
    try {
        localStorage.setItem('ai_learning_user_state', JSON.stringify(userState));
        console.log("User state saved:", userState);
    } catch (error) {
        console.error("Error saving user state:", error);
        showNotification("Could not save your progress. Please check browser storage settings.", "error");
    }
    
    // Update UI with new state
    updateUserInfoDisplay();
}

// Update the UI to display user information
function updateUserInfoDisplay() {
    const usernameDisplay = document.getElementById('username-display');
    const coinsDisplay = document.getElementById('coins-display');
    
    if (usernameDisplay) {
        usernameDisplay.textContent = userState.username || "Learner";
    }
    
    if (coinsDisplay) {
        coinsDisplay.textContent = userState.coins || 0;
    }
}

// Award coins to the user
function awardCoins(amount, reason = '') {
    if (amount <= 0) return;
    
    userState.coins += amount;
    saveUserState();
    
    showNotification(`Earned ${amount} coins${reason ? ' for ' + reason : ''}!`, "success");
}

// Mark a lesson as completed
function completeLesson(lessonId) {
    if (!userState.completedLessons.includes(lessonId)) {
        userState.completedLessons.push(lessonId);
        saveUserState();
        
        // Find the lesson to get its coin reward
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson && lesson.coinReward) {
            awardCoins(lesson.coinReward, `completing "${lesson.title}"`);
        } else {
            // Default coin award if not specified in lesson
            awardCoins(5, "lesson completion");
        }
        
        // Update UI
        updateLessonList();
    }
}

// Reset user progress (for debugging/testing)
function resetUserProgress() {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
        userState = {
            username: userState.username,
            coins: 0,
            completedLessons: [],
            currentLesson: 'intro',
            achievements: [],
            lastAccessed: new Date().toISOString()
        };
        
        saveUserState();
        window.location.reload();
    }
}

// Export user functions for use in other modules
window.userState = userState;
window.loadUserState = loadUserState;
window.saveUserState = saveUserState;
window.awardCoins = awardCoins;
window.completeLesson = completeLesson;
window.resetUserProgress = resetUserProgress;
