/**
 * Notification module for AI Learning Platform
 * Handles all system notifications to the user
 */

// Queue for notifications to ensure they don't overlap
let notificationQueue = [];
let isShowingNotification = false;

/**
 * Show a notification to the user
 * @param {string} message - The notification message
 * @param {string} type - Type of notification (success, error, info, warning)
 * @param {number} duration - How long to show the notification in ms
 * @returns {void}
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Add to queue
    notificationQueue.push({ message, type, duration });
    
    // If not currently showing a notification, show this one
    if (!isShowingNotification) {
        processNotificationQueue();
    }
}

/**
 * Process the next notification in the queue
 */
function processNotificationQueue() {
    if (notificationQueue.length === 0) {
        isShowingNotification = false;
        return;
    }
    
    isShowingNotification = true;
    const { message, type, duration } = notificationQueue.shift();
    
    // Check if notification container exists, create if not
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${type}`;
    notificationElement.setAttribute('role', 'alert');
    notificationElement.setAttribute('aria-live', 'polite');
    
    // Add icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
        default:
            icon = 'fa-info-circle';
    }
    
    notificationElement.innerHTML = `
        <i class="fas ${icon}" aria-hidden="true"></i>
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Add to container
    container.appendChild(notificationElement);
    
    // Show with animation
    setTimeout(() => {
        notificationElement.classList.add('show');
    }, 10);
    
    // Add close handler
    const closeButton = notificationElement.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        closeNotification(notificationElement);
    });
    
    // Auto-close after duration
    setTimeout(() => {
        closeNotification(notificationElement);
    }, duration);
}

/**
 * Close a specific notification
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Remove after animation completes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
        
        // Process next notification in queue
        processNotificationQueue();
    }, 300); // Match CSS transition time
}

// Create and add notification styles
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    
    styleElement.textContent = `
        #notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .notification {
            background-color: white;
            border-left: 4px solid #3498db;
            border-radius: 4px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 280px;
            max-width: 400px;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.hide {
            transform: translateX(120%);
            opacity: 0;
        }
        
        .notification i:first-child {
            font-size: 1.2rem;
        }
        
        .notification-message {
            flex: 1;
            padding-right: 10px;
        }
        
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            padding: 5px;
        }
        
        .notification-close:hover {
            color: #333;
        }
        
        .notification.success {
            border-left-color: #2ecc71;
        }
        
        .notification.success i:first-child {
            color: #2ecc71;
        }
        
        .notification.error {
            border-left-color: #e74c3c;
        }
        
        .notification.error i:first-child {
            color: #e74c3c;
        }
        
        .notification.warning {
            border-left-color: #f39c12;
        }
        
        .notification.warning i:first-child {
            color: #f39c12;
        }
        
        .notification.info {
            border-left-color: #3498db;
        }
        
        .notification.info i:first-child {
            color: #3498db;
        }
        
        @media (max-width: 480px) {
            #notification-container {
                right: 10px;
                left: 10px;
            }
            
            .notification {
                min-width: 0;
                max-width: none;
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize module
(function init() {
    window.addEventListener('DOMContentLoaded', () => {
        addNotificationStyles();
    });
    
    // Set up global event listener for notifications
    window.addEventListener('notification', (event) => {
        const { message, type, duration } = event.detail;
        showNotification(message, type, duration);
    });
})();

// Export module
export default {
    showNotification
};
