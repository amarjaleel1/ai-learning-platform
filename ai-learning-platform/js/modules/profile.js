/**
 * Profile module for AI Learning Platform
 * Handles user profile and progress
 */

import { getUserState, saveUserState, updateCoins } from './state.js';

/**
 * Initialize profile functionality
 */
export function initProfile() {
    // Render initial profile info
    renderProfileInfo();
    
    // Set up profile UI event handlers
    setupProfileHandlers();
    
    // Setup login reward system
    checkDailyLoginReward();
    
    console.log('Profile module initialized');
}

/**
 * Render profile information in the UI
 */
function renderProfileInfo() {
    const userState = getUserState();
    
    // Update username display
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = userState.username || 'Guest';
        
        // Add tooltip with more info
        usernameElement.setAttribute('title', `Streak: ${userState.streak || 0} days | Joined: ${new Date(userState.joinDate || Date.now()).toLocaleDateString()}`);
    }
    
    // Update coins display
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = userState.coins || 0;
    }
}

/**
 * Set up event handlers for profile UI
 */
function setupProfileHandlers() {
    // Username click handler (for changing username)
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.addEventListener('click', showUsernameChangeDialog);
    }
}

/**
 * Show dialog to change username
 */
function showUsernameChangeDialog() {
    // Create modal HTML
    const modalHtml = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Change Your Name</h3>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <p>Enter a new username below:</p>
                <input type="text" id="new-username" placeholder="Enter your name" maxlength="30" class="form-input">
            </div>
            <div class="modal-footer">
                <button id="save-username" class="primary-button">Save</button>
                <button id="cancel-username" class="secondary-button">Cancel</button>
            </div>
        </div>
    `;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal';
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal with animation
    setTimeout(() => {
        modalContainer.classList.add('show');
        
        // Set focus on input
        const inputElement = document.getElementById('new-username');
        if (inputElement) {
            inputElement.value = getUserState().username || '';
            inputElement.focus();
            inputElement.select();
        }
    }, 10);
    
    // Set up event handlers
    const closeButton = modalContainer.querySelector('.close-button');
    const cancelButton = document.getElementById('cancel-username');
    const saveButton = document.getElementById('save-username');
    
    function closeModal() {
        modalContainer.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modalContainer);
        }, 300); // Match CSS transition time
    }
    
    // Close button handler
    if (closeButton) closeButton.addEventListener('click', closeModal);
    
    // Cancel button handler
    if (cancelButton) cancelButton.addEventListener('click', closeModal);
    
    // Save button handler
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const inputElement = document.getElementById('new-username');
            if (inputElement) {
                const newUsername = inputElement.value.trim();
                if (newUsername) {
                    // Update username in state
                    saveUserState({ username: newUsername })
                        .then(() => {
                            // Update UI
                            renderProfileInfo();
                            
                            // Show success message
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('Username updated successfully!', 'success');
                            }
                            
                            closeModal();
                        })
                        .catch(error => {
                            console.error('Error saving username:', error);
                            
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('Error updating username. Please try again.', 'error');
                            }
                        });
                } else {
                    // Empty username, show error
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Username cannot be empty.', 'error');
                    }
                }
            }
        });
    }
}

/**
 * Check and handle daily login rewards
 */
function checkDailyLoginReward() {
    const userState = getUserState();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if we've already shown a login reward today
    if (userState.lastRewardDate === today) {
        return; // Already handled today's reward
    }
    
    // Calculate streak and bonus
    let streak = userState.streak || 0;
    let bonus = 0;
    
    // Special milestone bonuses
    if (streak === 7) {
        bonus = 50; // One week streak
    } else if (streak === 30) {
        bonus = 200; // One month streak
    } else if (streak % 100 === 0 && streak > 0) {
        bonus = 500; // Every 100 days
    }
    
    // Regular streak bonus (minimum 5 coins)
    const regularBonus = Math.max(5, Math.floor(streak / 5) * 5);
    const totalBonus = regularBonus + bonus;
    
    // Update user state and show reward dialog
    saveUserState({ lastRewardDate: today })
        .then(() => {
            return updateCoins(totalBonus, 'Daily login reward');
        })
        .then(() => {
            showLoginRewardDialog(streak, totalBonus, !!bonus);
        })
        .catch(error => {
            console.error('Error processing login reward:', error);
        });
}

/**
 * Show login reward dialog
 * @param {number} streak - User's current streak
 * @param {number} coins - Coins awarded
 * @param {boolean} isMilestone - Whether this is a milestone streak
 */
function showLoginRewardDialog(streak, coins, isMilestone) {
    // Create reward dialog HTML
    const dialogHtml = `
        <div class="modal-content ${isMilestone ? 'milestone' : ''}">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-check"></i> Daily Reward</h3>
            </div>
            <div class="login-reward">
                <div class="reward-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="reward-details">
                    <p>Welcome back! You've received <strong>${coins} coins</strong> for logging in today.</p>
                    <p>Current streak: <span class="streak">${streak} day${streak !== 1 ? 's' : ''}</span></p>
                    ${isMilestone ? '<p class="milestone-text">🎉 Milestone achievement! Keep up the good work! 🎉</p>' : ''}
                </div>
            </div>
            <button class="primary-button">Collect Reward</button>
        </div>
    `;
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal';
    modalContainer.innerHTML = dialogHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal with animation
    setTimeout(() => {
        modalContainer.classList.add('show');
    }, 10);
    
    // Close button handler
    const closeButton = modalContainer.querySelector('.primary-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modalContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modalContainer);
            }, 300); // Match CSS transition time
            
            // Animate coins display
            const coinDisplay = document.getElementById('coin-display');
            if (coinDisplay) {
                coinDisplay.classList.add('coin-animation');
                setTimeout(() => {
                    coinDisplay.classList.remove('coin-animation');
                }, 1000);
            }
        });
    }
}

/**
 * Show user achievements
 */
export function showAchievements() {
    const userState = getUserState();
    const achievements = userState.achievements || [];
    
    // Implementation for achievements view would go here
    console.log('User achievements:', achievements);
    
    // For now, just show a notification
    if (typeof window.showNotification === 'function') {
        window.showNotification(`You have ${achievements.length} achievements.`, 'info');
    }
}

/**
 * Award an achievement to the user
 * @param {string} achievementId - The ID of the achievement to award
 * @param {Object} achievementData - Data about the achievement (name, description, reward)
 * @returns {Promise} Promise that resolves when the achievement is awarded
 */
export function awardAchievement(achievementId, achievementData) {
    return new Promise((resolve, reject) => {
        const userState = getUserState();
        const achievements = userState.achievements || [];
        
        // Check if user already has this achievement
        if (achievements.some(a => a.id === achievementId)) {
            resolve(userState); // Already has achievement
            return;
        }
        
        // Add achievement with timestamp
        const newAchievement = {
            id: achievementId,
            name: achievementData.name,
            description: achievementData.description,
            date: new Date().toISOString()
        };
        
        const updatedAchievements = [...achievements, newAchievement];
        
        // Award coins if specified
        const coinReward = achievementData.coinReward || 0;
        
        // Update user state
        saveUserState({ achievements: updatedAchievements })
            .then(() => {
                if (coinReward > 0) {
                    return updateCoins(coinReward, `Achievement: ${achievementData.name}`);
                }
                return getUserState();
            })
            .then(state => {
                showAchievementNotification(achievementData, coinReward);
                resolve(state);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Show achievement notification
 * @param {Object} achievement - Achievement data
 * @param {number} coins - Coins awarded
 */
function showAchievementNotification(achievement, coins) {
    // Create achievement toast HTML
    const toastHtml = `
        <div class="achievement-icon">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="achievement-details">
            <h4>Achievement Unlocked</h4>
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
            ${coins > 0 ? `<p class="reward">+${coins} coins</p>` : ''}
        </div>
    `;
    
    // Create and add toast to document
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = toastHtml;
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
        toast.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 5000);
    }, 100);
    
    // Also show standard notification if available
    if (typeof window.showNotification === 'function') {
        let message = `Achievement unlocked: ${achievement.name}`;
        if (coins > 0) {
            message += ` (+${coins} coins)`;
        }
        window.showNotification(message, 'success', 4000);
    }
}

/**
 * Export achievement badges for user's profile
 * @returns {Promise<Array>} Promise that resolves with achievement badge HTML array
 */
export function getAchievementBadges() {
    return new Promise((resolve) => {
        const userState = getUserState();
        const achievements = userState.achievements || [];
        
        const badges = achievements.map(achievement => {
            const achievementDate = new Date(achievement.date).toLocaleDateString();
            
            return `
                <div class="achievement-badge" title="${achievement.description}\nAwarded: ${achievementDate}">
                    <div class="badge-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="badge-info">
                        <div class="badge-name">${achievement.name}</div>
                        <div class="badge-date">${achievementDate}</div>
                    </div>
                </div>
            `;
        });
        
        resolve(badges);
    });
}

/**
 * Reset user's profile data
 * @param {boolean} keepUsername - Whether to keep the current username
 * @returns {Promise} Promise that resolves when profile is reset
 */
export function resetProfile(keepUsername = true) {
    return new Promise((resolve, reject) => {
        try {
            // Get current username if needed
            const currentUsername = keepUsername ? getUserState().username : null;
            
            // Create confirmation modal
            const modalHtml = `
                <div class="modal-content danger">
                    <div class="modal-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> Reset Profile</h3>
                        <button class="close-button">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to reset your profile? This will:</p>
                        <ul>
                            <li>Reset your progress on all lessons</li>
                            <li>Set your coins back to 0</li>
                            <li>Remove all achievements</li>
                            <li>Reset your daily streak</li>
                        </ul>
                        <p><strong>This action cannot be undone!</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button id="confirm-reset" class="danger-button">Yes, Reset My Profile</button>
                        <button id="cancel-reset" class="secondary-button">Cancel</button>
                    </div>
                </div>
            `;
            
            // Create modal container
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal';
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
            
            // Show modal with animation
            setTimeout(() => {
                modalContainer.classList.add('show');
            }, 10);
            
            // Set up event handlers
            const closeButton = modalContainer.querySelector('.close-button');
            const cancelButton = document.getElementById('cancel-reset');
            const confirmButton = document.getElementById('confirm-reset');
            
            function closeModal() {
                modalContainer.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modalContainer);
                }, 300); // Match CSS transition time
            }
            
            // Close button handler
            if (closeButton) closeButton.addEventListener('click', closeModal);
            
            // Cancel button handler
            if (cancelButton) cancelButton.addEventListener('click', () => {
                closeModal();
                reject(new Error('Reset canceled by user'));
            });
            
            // Confirm button handler
            if (confirmButton) {
                confirmButton.addEventListener('click', () => {
                    // Create default state (completely fresh)
                    const defaultState = {
                        username: currentUsername || 'Guest',
                        coins: 0,
                        completedLessons: [],
                        achievements: [],
                        streak: 0,
                        lastLoginDate: new Date().toISOString().split('T')[0],
                        lastUpdated: new Date().toISOString()
                    };
                    
                    // Save default state
                    saveUserState(defaultState, true)  // true = complete overwrite
                        .then(() => {
                            // Update UI
                            renderProfileInfo();
                            
                            // Show success message
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('Profile has been reset successfully.', 'info');
                            }
                            
                            closeModal();
                            resolve();
                            
                            // Reload page to ensure everything is fresh
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        })
                        .catch(error => {
                            console.error('Error resetting profile:', error);
                            
                            if (typeof window.showNotification === 'function') {
                                window.showNotification('Error resetting profile. Please try again.', 'error');
                            }
                            
                            closeModal();
                            reject(error);
                        });
                });
            }
        } catch (error) {
            console.error('Error in resetProfile:', error);
            reject(error);
        }
    });
}

// Export module
export default {
    initProfile,
    showAchievements,
    awardAchievement,
    getAchievementBadges,
    resetProfile
};