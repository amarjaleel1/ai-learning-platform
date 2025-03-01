/**
 * Notifications module for AI Learning Platform
 * Creates toast notifications to provide feedback to users
 */

// Configuration for notifications
const config = {
    duration: 4000,
    position: 'top-right',
    maxVisible: 3
};

// Notification container
let notificationContainer;

/**
 * Initialize the notification system
 */
function initNotifications() {
    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container ' + config.position;
        document.body.appendChild(notificationContainer);
    }
}

/**
 * Show a notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info, warning)
 * @param {number} duration - Time in ms to show notification (optional)
 */
export function showNotification(message, type = 'info', duration = config.duration) {
    // Initialize if not already done
    if (!notificationContainer) {
        initNotifications();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    const iconClass = getIconForType(type);
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${iconClass}" aria-hidden="true"></i>
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Limit number of visible notifications
    const notifications = notificationContainer.querySelectorAll('.notification');
    if (notifications.length > config.maxVisible) {
        notificationContainer.removeChild(notifications[0]);
    }
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button listener
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto-hide after duration
    if (duration !== Infinity) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
}

/**
 * Hide a notification with animation
 * @param {HTMLElement} notification - The notification element to hide
 */
function hideNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Get the Font Awesome icon class for notification type
 * @param {string} type - Notification type
 * @returns {string} Font Awesome icon class
 */
function getIconForType(type) {
    switch (type.toLowerCase()) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        case 'info':
        default:
            return 'fas fa-info-circle';
    }
}

// Initialize on import
initNotifications();

export default {
    showNotification
};
