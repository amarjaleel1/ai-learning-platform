/**
 * API client utility for making network requests
 * Provides standardized methods for communication with backend services
 */

// Base API configuration
const API_CONFIG = {
    baseUrl: 'https://api.ailearningplatform.com/v1',
    timeout: 15000, // 15 seconds
    retryAttempts: 2,
    retryDelay: 1000 // 1 second
};

/**
 * Make a fetch request with standardized error handling and retries
 * 
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Request options (method, headers, body)
 * @param {number} attempt - Current attempt number for retries
 * @returns {Promise<Object>} - Response data
 */
async function makeRequest(endpoint, options = {}, attempt = 1) {
    // Set default options
    const requestOptions = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include',
        ...options
    };

    // Add authentication token if available
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        requestOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Prepare request URL
    const url = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_CONFIG.baseUrl}/${endpoint.replace(/^\//, '')}`;
    
    try {
        // Set up request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        requestOptions.signal = controller.signal;
        
        // Make the request
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || response.statusText);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        
        // Return response data
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        // Handle network errors and retry if appropriate
        if ((error.name === 'AbortError' || error.message === 'Failed to fetch') && 
            attempt <= API_CONFIG.retryAttempts) {
            console.log(`Request to ${endpoint} failed, retrying (${attempt}/${API_CONFIG.retryAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
            return makeRequest(endpoint, options, attempt + 1);
        }
        
        // Re-throw the error after all retry attempts are exhausted
        console.error(`API request failed: ${error.message}`);
        throw error;
    }
}

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} - Response data
 */
function get(endpoint, options = {}) {
    return makeRequest(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} - Response data
 */
function post(endpoint, data = {}, options = {}) {
    return makeRequest(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} - Response data
 */
function put(endpoint, data = {}, options = {}) {
    return makeRequest(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} - Response data
 */
function del(endpoint, options = {}) {
    return makeRequest(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Configure API client settings
 * @param {Object} config - Configuration options
 */
function configure(config = {}) {
    Object.assign(API_CONFIG, config);
}

// Export API client functions for both global use and ES6 modules
if (typeof window !== 'undefined') {
    window.API = {
        get,
        post,
        put,
        delete: del,
        configure
    };
}

export {
    get,
    post,
    put,
    del as delete,
    configure
};

export default {
    get,
    post,
    put,
    delete: del,
    configure
};
