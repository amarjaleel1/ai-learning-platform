/**
 * Network module for AI Learning Platform
 * Handles API communication and network status
 */

// Base API URL - defaults to current host if not specified
const API_BASE_URL = window.API_BASE_URL || '';

// Default request options
const DEFAULT_OPTIONS = {
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * Initialize network functionality
 */
export function initNetwork() {
    // Set up network status monitoring
    monitorNetworkStatus();
    
    // Set up global error handling for fetch requests
    setupFetchInterceptor();
    
    console.log('Network module initialized');
}

/**
 * Monitor the network status and show indicators when offline/online
 */
function monitorNetworkStatus() {
    // Create network status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'network-status';
    statusIndicator.id = 'network-status';
    document.body.appendChild(statusIndicator);
    
    // Function to update status indicator
    const updateNetworkStatus = (online) => {
        if (online) {
            statusIndicator.className = 'network-status online';
            statusIndicator.innerHTML = '<i class="fas fa-wifi"></i> Connection restored';
            statusIndicator.style.display = 'flex';
        } else {
            statusIndicator.className = 'network-status offline';
            statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No internet connection';
            statusIndicator.style.display = 'flex';
        }
    };
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        updateNetworkStatus(true);
        
        // Notify the user
        if (window.showNotification) {
            window.showNotification('Internet connection restored', 'success');
        }
    });
    
    window.addEventListener('offline', () => {
        updateNetworkStatus(false);
        
        // Notify the user
        if (window.showNotification) {
            window.showNotification('No internet connection', 'error');
        }
    });
    
    // Initial status check
    updateNetworkStatus(navigator.onLine);
}

/**
 * Set up global fetch interceptor for error handling
 */
function setupFetchInterceptor() {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Replace with our custom implementation
    window.fetch = async (url, options = {}) => {
        // Check if we're online
        if (!navigator.onLine) {
            if (window.showNotification) {
                window.showNotification('Cannot perform request: No internet connection', 'error');
            }
            return Promise.reject(new Error('No internet connection'));
        }
        
        try {
            // Start a timeout for the request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 30000);
            });
            
            // Make the actual request
            const responsePromise = originalFetch(url, options);
            
            // Race against the timeout
            const response = await Promise.race([responsePromise, timeoutPromise]);
            
            // Check if the response is OK
            if (!response.ok) {
                const error = new Error(`HTTP error! Status: ${response.status}`);
                error.response = response;
                throw error;
            }
            
            return response;
        } catch (error) {
            // Log the error
            console.error('Fetch error:', error);
            
            // Show error notification
            if (window.showNotification && error.message !== 'Request timeout') {
                window.showNotification('Error connecting to the server', 'error');
            } else if (window.showNotification) {
                window.showNotification('Request timed out', 'error');
            }
            
            // Re-throw the error to be handled by the caller
            throw error;
        }
    };
}

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response promise
 */
export async function get(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = { ...DEFAULT_OPTIONS, ...options, method: 'GET' };
    
    try {
        const response = await fetch(url, fetchOptions);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response promise
 */
export async function post(endpoint, data, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        return await response.json();
    } catch (error) {
        console.error(`Error posting to ${url}:`, error);
        throw error;
    }
}

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response promise
 */
export async function put(endpoint, data, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        return await response.json();
    } catch (error) {
        console.error(`Error putting to ${url}:`, error);
        throw error;
    }
}

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise} Response promise
 */
export async function del(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        method: 'DELETE'
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        return await response.json();
    } catch (error) {
        console.error(`Error deleting from ${url}:`, error);
        throw error;
    }
}

/**
 * Check if there's an active internet connection
 * @returns {boolean} True if online
 */
export function isOnline() {
    return navigator.onLine;
}

export default {
    initNetwork,
    get,
    post,
    put,
    del,
    isOnline
};
