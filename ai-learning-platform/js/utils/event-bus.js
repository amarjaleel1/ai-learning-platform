/**
 * Event Bus Utility for application-wide event handling
 * Implements a simple publish-subscribe pattern
 */

// Store for event handlers
const subscribers = {};

/**
 * Subscribe to an event
 * @param {string} event - Event name to subscribe to
 * @param {Function} callback - Function to call when event is published
 * @returns {Object} - Subscription object with unsubscribe method
 */
function subscribe(event, callback) {
    if (!subscribers[event]) {
        subscribers[event] = [];
    }
    
    const index = subscribers[event].push(callback) - 1;
    
    // Return subscription handle with unsubscribe method
    return {
        unsubscribe: () => {
            subscribers[event].splice(index, 1);
        }
    };
}

/**
 * Publish an event with data
 * @param {string} event - Event name to publish
 * @param {*} data - Data to pass to subscribers
 */
function publish(event, data) {
    if (!subscribers[event]) {
        return;
    }
    
    subscribers[event].forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
        }
    });
}

/**
 * Clear all subscribers for an event
 * @param {string} event - Event name to clear
 */
function clear(event) {
    subscribers[event] = [];
}

/**
 * Clear all subscribers for all events
 */
function clearAll() {
    Object.keys(subscribers).forEach(event => {
        subscribers[event] = [];
    });
}

/**
 * Get the count of subscribers for a specific event
 * @param {string} event - Event name
 * @returns {number} - Number of subscribers
 */
function count(event) {
    if (!subscribers[event]) {
        return 0;
    }
    return subscribers[event].length;
}

/**
 * List all active event types
 * @returns {string[]} - Array of event names
 */
function listEvents() {
    return Object.keys(subscribers);
}

// Create a default EventBus instance
const EventBus = {
    subscribe,
    publish,
    clear,
    clearAll,
    count,
    listEvents
};

// Make EventBus available globally for legacy code
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
}

// Export for ES6 modules
export default EventBus;
