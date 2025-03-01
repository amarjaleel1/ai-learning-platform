// UI Components and Notifications

// Store references to active UI elements
const uiState = {
    notifications: [],
    activeModals: [],
    tooltips: []
};

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - Notification type: 'info', 'success', 'warning', 'error'
 * @param {number} duration - How long to show the notification (ms)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.setAttribute('role', 'alert');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Generate a unique ID for this notification
    const id = 'notification-' + Date.now();
    notification.id = id;
    
    // Add appropriate icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    // Build notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}" aria-hidden="true"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Add close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(id);
    });
    
    // Add to the DOM
    container.appendChild(notification);
    
    // Track in state
    uiState.notifications.push({
        id,
        element: notification,
        timeout: setTimeout(() => removeNotification(id), duration)
    });
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
        notification.classList.add('visible');
    });
    
    return id;
}

/**
 * Remove a notification
 * @param {string} id - ID of the notification to remove
 */
function removeNotification(id) {
    // Find notification in state
    const index = uiState.notifications.findIndex(n => n.id === id);
    if (index === -1) return;
    
    const notification = uiState.notifications[index];
    
    // Clear timeout if exists
    if (notification.timeout) {
        clearTimeout(notification.timeout);
    }
    
    // Trigger exit animation
    notification.element.classList.remove('visible');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
        
        // Remove from state
        uiState.notifications.splice(index, 1);
    }, 300);
}

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string|HTMLElement} options.content - Modal content
 * @param {Array} options.buttons - Array of button configurations
 * @returns {Object} Modal controller with close method
 */
function showModal(options) {
    // Default options
    const defaults = {
        title: '',
        content: '',
        closable: true,
        buttons: [{
            text: 'Close',
            type: 'secondary',
            action: 'close'
        }],
        width: 'auto',
        onClose: null
    };
    
    // Merge options
    const config = { ...defaults, ...options };
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Generate ID
    const modalId = 'modal-' + Date.now();
    modal.id = modalId;
    
    // Create modal HTML
    let buttonHtml = '';
    config.buttons.forEach(button => {
        const buttonType = button.type || 'secondary';
        buttonHtml += `
            <button class="${buttonType}-button" data-action="${button.action || 'close'}">
                ${button.text}
            </button>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content" style="width: ${config.width};">
            ${config.title ? `
                <div class="modal-header">
                    <h3>${config.title}</h3>
                    ${config.closable ? `
                        <button class="close-modal" aria-label="Close modal">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    ` : ''}
                </div>
            ` : ''}
            <div class="modal-body">
                ${typeof config.content === 'string' ? config.content : ''}
            </div>
            ${buttonHtml ? `
                <div class="modal-footer">
                    ${buttonHtml}
                </div>
            ` : ''}
        </div>
    `;
    
    // If content is an element, append it
    if (typeof config.content !== 'string') {
        modal.querySelector('.modal-body').appendChild(config.content);
    }
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
        modal.classList.add('visible');
    });
    
    // Prevent body scrolling
    document.body.classList.add('modal-open');
    
    // Track in state
    const modalState = {
        id: modalId,
        element: modal,
        config
    };
    
    uiState.activeModals.push(modalState);
    
    // Close handler
    const closeModal = () => {
        // Find in state
        const index = uiState.activeModals.findIndex(m => m.id === modalId);
        if (index === -1) return;
        
        const modalState = uiState.activeModals[index];
        
        // Trigger exit animation
        modalState.element.classList.remove('visible');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (modalState.element.parentNode) {
                modalState.element.parentNode.removeChild(modalState.element);
            }
            
            // Remove from state
            uiState.activeModals.splice(index, 1);
            
            // Re-enable body scrolling if no more modals
            if (uiState.activeModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
            
            // Call onClose callback
            if (typeof modalState.config.onClose === 'function') {
                modalState.config.onClose();
            }
        }, 300);
    };
    
    // Setup event listeners
    
    // Close button
    const closeButton = modal.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Button actions
    modal.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            
            if (action === 'close') {
                closeModal();
            } else {
                // Find button config
                const buttonConfig = config.buttons.find(b => b.action === action);
                if (buttonConfig && typeof buttonConfig.handler === 'function') {
                    buttonConfig.handler();
                }
            }
        });
    });
    
    // Close on ESC key
    if (config.closable) {
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', keyHandler);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }
    
    // Return controller
    return {
        close: closeModal,
        element: modal
    };
}

/**
 * Show a tooltip
 * @param {Element} target - Element to attach tooltip to
 * @param {string} content - Tooltip content
 * @param {string} position - Tooltip position: 'top', 'right', 'bottom', 'left'
 * @returns {Object} Tooltip controller with show/hide methods
 */
function showTooltip(target, content, position = 'top') {
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.innerHTML = content;
    
    // Create arrow
    const arrow = document.createElement('div');
    arrow.className = 'tooltip-arrow';
    tooltip.appendChild(arrow);
    
    // Add to DOM
    document.body.appendChild(tooltip);
    
    // Generate ID
    const tooltipId = 'tooltip-' + Date.now();
    tooltip.id = tooltipId;
    
    // Position tooltip
    const positionTooltip = () => {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.top - tooltipRect.height - 10;
                break;
                
            case 'right':
                left = targetRect.right + 10;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
                
            case 'bottom':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.bottom + 10;
                break;
                
            case 'left':
                left = targetRect.left - tooltipRect.width - 10;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Adjust if off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    
    // Show tooltip
    const showTooltip = () => {
        positionTooltip();
        tooltip.classList.add('visible');
    };
    
    // Hide tooltip
    const hideTooltip = () => {
        tooltip.classList.remove('visible');
    };
    
    // Destroy tooltip
    const destroyTooltip = () => {
        // Find in state
        const index = uiState.tooltips.findIndex(t => t.id === tooltipId);
        if (index !== -1) {
            uiState.tooltips.splice(index, 1);
        }
        
        // Remove from DOM
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    };
    
    // Store in state
    uiState.tooltips.push({
        id: tooltipId,
        element: tooltip,
        target,
        callbacks: {
            show: showTooltip,
            hide: hideTooltip,
            destroy: destroyTooltip
        }
    });
    
    // Return controller
    return {
        show: showTooltip,
        hide: hideTooltip,
        destroy: destroyTooltip
    };
}

/**
 * Create a tooltip that shows on hover
 * @param {Element} element - Element to attach tooltip to
 * @param {string} content - Tooltip content
 * @param {string} position - Tooltip position
 */
function createHoverTooltip(element, content, position = 'top') {
    let tooltipController = null;
    
    element.addEventListener('mouseenter', () => {
        tooltipController = showTooltip(element, content, position);
        tooltipController.show();
    });
    
    element.addEventListener('mouseleave', () => {
        if (tooltipController) {
            tooltipController.hide();
            
            // Destroy after animation
            setTimeout(() => {
                tooltipController.destroy();
                tooltipController = null;
            }, 300);
        }
    });
}

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves to true if confirmed, false otherwise
 */
function showConfirmation(message, options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Confirm',
            confirmText: 'Yes',
            cancelText: 'No',
            type: 'question'
        };
        
        const config = { ...defaults, ...options };
        
        // Show modal
        showModal({
            title: config.title,
            content: `<p>${message}</p>`,
            closable: true,
            buttons: [
                {
                    text: config.confirmText,
                    type: 'primary',
                    action: 'confirm',
                    handler: () => resolve(true)
                },
                {
                    text: config.cancelText,
                    type: 'secondary',
                    action: 'cancel',
                    handler: () => resolve(false)
                }
            ],
            onClose: () => resolve(false)
        });
    });
}

/**
 * Show prompt dialog that requests input from user
 * @param {string} message - Prompt message
 * @param {string} defaultValue - Default input value
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves to input value or null if canceled
 */
function showPrompt(message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Input Required',
            confirmText: 'OK',
            cancelText: 'Cancel',
            inputType: 'text',
            placeholder: '',
            maxLength: 100
        };
        
        const config = { ...defaults, ...options };
        
        // Create input element
        const inputContainer = document.createElement('div');
        inputContainer.className = 'prompt-container';
        
        // Add message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        inputContainer.appendChild(messageElement);
        
        // Add input field
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const input = document.createElement('input');
        input.type = config.inputType;
        input.value = defaultValue;
        input.placeholder = config.placeholder;
        input.maxLength = config.maxLength;
        
        inputGroup.appendChild(input);
        inputContainer.appendChild(inputGroup);
        
        // Show modal
        const modal = showModal({
            title: config.title,
            content: inputContainer,
            closable: true,
            buttons: [
                {
                    text: config.confirmText,
                    type: 'primary',
                    action: 'confirm',
                    handler: () => resolve(input.value)
                },
                {
                    text: config.cancelText,
                    type: 'secondary',
                    action: 'cancel',
                    handler: () => resolve(null)
                }
            ],
            onClose: () => resolve(null)
        });
        
        // Focus input
        setTimeout(() => {
            input.focus();
            
            // Handle enter key to confirm
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    resolve(input.value);
                    modal.close();
                }
            });
        }, 100);
    });
}

/**
 * Animate a coin reward
 * @param {number} amount - Number of coins to animate
 */
function animateCoinAward(amount) {
    const coinDisplay = document.getElementById('coin-display');
    if (!coinDisplay) return;
    
    // Create animation container
    const animContainer = document.createElement('div');
    animContainer.className = 'coin-animation-container';
    document.body.appendChild(animContainer);
    
    // Get the position of the coin counter
    const coinRect = coinDisplay.getBoundingClientRect();
    const targetX = coinRect.left + coinRect.width / 2;
    const targetY = coinRect.top + coinRect.height / 2;
    
    // Create coins
    const coinCount = Math.min(amount, 10); // Max 10 coins for performance
    
    for (let i = 0; i < coinCount; i++) {
        const coin = document.createElement('div');
        coin.className = 'animated-coin';
        coin.innerHTML = '<i class="fas fa-coins"></i>';
        animContainer.appendChild(coin);
        
        // Randomize start position
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        
        // Animate to target position
        setTimeout(() => {
            coin.style.left = `${targetX}px`;
            coin.style.top = `${targetY}px`;
            coin.style.opacity = '0';
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            coin.remove();
        }, 1000);
    }
    
    // Remove animation container after all animations
    setTimeout(() => {
        animContainer.remove();
    }, 1100);
}

// Check for daily login reward
function checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (userState.lastLoginDate !== today) {
        // It's a new day, give login reward
        const isConsecutiveDay = isConsecutiveLogin(userState.lastLoginDate);
        
        if (isConsecutiveDay) {
            userState.streak++;
        } else {
            userState.streak = 1;
        }
        
        // Update last login date
        userState.lastLoginDate = today;
        
        // Calculate reward (more for streak)
        const reward = 5 + Math.min(5, userState.streak);
        
        // Show login reward
        setTimeout(() => {
            showLoginReward(reward, userState.streak);
        }, 1500);
        
        saveUserState();
    }
}

// Check if login is consecutive
function isConsecutiveLogin(lastLogin) {
    if (!lastLogin) return false;
    
    const lastDate = new Date(lastLogin);
    const today = new Date();
    
    // Reset hours to compare just the dates
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = today - lastDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
}

// Show login reward modal
function showLoginReward(amount, streak) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal reward-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-check"></i> Daily Login Reward</h3>
            </div>
            <div class="login-reward">
                <div class="reward-icon">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="reward-details">
                    <p>You've received <strong>${amount} coins</strong> for logging in today!</p>
                    ${streak > 1 ? `<p class="streak">🔥 ${streak} day streak! Keep it up!</p>` : ''}
                </div>
            </div>
            <button id="claim-reward" class="primary-button">Claim Reward</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Add event listener to claim button
    document.getElementById('claim-reward').addEventListener('click', () => {
        awardCoins(amount, 'Daily login bonus');
        closeModal(modal);
    });
}

// Check for achievements
function checkAchievements() {
    // First lesson completed
    if (userState.completedLessons.length === 1 && !hasAchievement('first_lesson')) {
        addAchievement('first_lesson', 'First Steps', 'Complete your first lesson', 5);
    }
    
    // Complete 3 lessons
    if (userState.completedLessons.length >= 3 && !hasAchievement('three_lessons')) {
        addAchievement('three_lessons', 'Getting Started', 'Complete three lessons', 10);
    }
    
    // Complete all lessons
    if (userState.completedLessons.length >= lessons.length && !hasAchievement('all_lessons')) {
        addAchievement('all_lessons', 'AI Scholar', 'Complete all available lessons', 20);
    }
    
    // Login streak achievements
    if (userState.streak >= 3 && !hasAchievement('three_day_streak')) {
        addAchievement('three_day_streak', 'Consistent Learner', 'Login for 3 days in a row', 10);
    }
}

// Check if user has an achievement
function hasAchievement(id) {
    return userState.achievements.some(a => a.id === id);
}

// Add an achievement
function addAchievement(id, title, description, rewardCoins) {
    const achievement = {
        id,
        title,
        description,
        dateEarned: new Date().toISOString()
    };
    
    userState.achievements.push(achievement);
    saveUserState();
    
    // Show achievement notification
    showAchievementNotification(title, description, rewardCoins);
    
    // Award coins
    if (rewardCoins > 0) {
        awardCoins(rewardCoins, `${title} achievement`);
    }
}

// Show achievement notification
function showAchievementNotification(title, description, rewardCoins) {
    // Create achievement toast
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-icon">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="achievement-details">
            <h4>Achievement Unlocked!</h4>
            <h3>${title}</h3>
            <p>${description}</p>
            ${rewardCoins ? `<p class="reward">+${rewardCoins} coins</p>` : ''}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 5000);
}

// Track user progress and show recommendations
function trackProgress() {
    const completedCount = userState.completedLessons.length;
    const totalLessons = lessons.length;
    const progressPercent = Math.round((completedCount / totalLessons) * 100);
    
    // Show progress in profile section if it exists
    const progressElement = document.getElementById('progress-bar');
    if (progressElement) {
        progressElement.style.width = `${progressPercent}%`;
        progressElement.setAttribute('aria-valuenow', progressPercent);
        document.getElementById('progress-percent').textContent = `${progressPercent}%`;
    }
    
    // Show recommendations based on progress
    if (completedCount > 0 && completedCount < totalLessons) {
        // Find next uncompleted lesson
        const nextLesson = lessons.find(lesson => !userState.completedLessons.includes(lesson.id));
        if (nextLesson && progressPercent > 25) {
            showRecommendation(nextLesson);
        }
    }
}

// Show lesson recommendation
function showRecommendation(lesson) {
    const recommendationBox = document.getElementById('recommendation-box');
    if (!recommendationBox) return;
    
    recommendationBox.innerHTML = `
        <h3>Recommended Next Step</h3>
        <div class="recommendation">
            <div class="recommendation-icon">
                <i class="fas fa-forward"></i>
            </div>
            <div class="recommendation-details">
                <h4>${lesson.title}</h4>
                <p>Continue your learning journey with this lesson!</p>
                <button id="go-to-recommendation">Start Lesson</button>
            </div>
        </div>
    `;
    
    recommendationBox.classList.remove('hidden');
    
    // Add event listener to button
    document.getElementById('go-to-recommendation').addEventListener('click', () => {
        loadLesson(lesson.id);
        recommendationBox.classList.add('hidden');
    });
}
