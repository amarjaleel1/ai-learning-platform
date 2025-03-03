/**
 * API module for interacting with backend services
 * This is currently mocked for demonstration, but can be connected
 * to real backend services in production
 */

import { fetchWithTimeout } from './utils.js';

// API configuration
const API_CONFIG = {
    baseUrl: '/api',
    timeout: 10000,  // 10 seconds
    mockEnabled: true
};

// API endpoints
const ENDPOINTS = {
    lessons: '/lessons',
    progress: '/user/progress',
    submissions: '/submissions',
    feedback: '/feedback',
    achievements: '/user/achievements'
};

/**
 * Make an API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - Response promise
 */
async function apiRequest(endpoint, options = {}) {
    // Use mock data if enabled
    if (API_CONFIG.mockEnabled) {
        return mockApiResponse(endpoint, options);
    }
    
    const url = API_CONFIG.baseUrl + endpoint;
    
    // Set up default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add authorization if user is logged in
    if (userState && userState.token) {
        headers['Authorization'] = `Bearer ${userState.token}`;
    }
    
    try {
        // Make the actual API request
        const response = await fetchWithTimeout(url, {
            ...options,
            headers,
            timeout: API_CONFIG.timeout
        });
        
        // Check for HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `API request failed with status: ${response.status}`,
                response.status,
                errorData
            );
        }
        
        // Parse and return the response
        return await response.json();
    } catch (error) {
        // Handle timeout or network errors
        if (error.name === 'AbortError') {
            throw new ApiError('API request timed out', 408);
        }
        
        // Re-throw API errors
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Handle other errors
        throw new ApiError(error.message, 0);
    }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Mock API responses for development and demo
 */
function mockApiResponse(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        // Add a realistic delay
        setTimeout(() => {
            switch (true) {
                case endpoint.startsWith(ENDPOINTS.lessons):
                    handleMockLessons(endpoint, options, resolve, reject);
                    break;
                    
                case endpoint.startsWith(ENDPOINTS.progress):
                    handleMockProgress(endpoint, options, resolve, reject);
                    break;
                    
                case endpoint.startsWith(ENDPOINTS.submissions):
                    handleMockSubmissions(endpoint, options, resolve, reject);
                    break;
                    
                case endpoint.startsWith(ENDPOINTS.feedback):
                    handleMockFeedback(endpoint, options, resolve, reject);
                    break;
                    
                case endpoint.startsWith(ENDPOINTS.achievements):
                    handleMockAchievements(endpoint, options, resolve, reject);
                    break;
                    
                default:
                    reject(new ApiError('Unknown endpoint', 404));
            }
        }, 300);  // Simulate network delay
    });
}

/**
 * Handle mock lessons endpoints
 */
function handleMockLessons(endpoint, options, resolve, reject) {
    // GET /api/lessons
    if (options.method === 'GET' || !options.method) {
        resolve({ 
            success: true,
            data: lessons
        });
        return;
    }
    
    // Reject other methods
    reject(new ApiError('Method not allowed', 405));
}

/**
 * Handle mock user progress endpoints
 */
function handleMockProgress(endpoint, options, resolve, reject) {
    // GET /api/user/progress
    if ((options.method === 'GET' || !options.method) && endpoint === ENDPOINTS.progress) {
        resolve({
            success: true,
            data: {
                completedLessons: userState.completedLessons || [],
                currentLesson: userState.currentLesson,
                lastAccessed: userState.lastAccessed
            }
        });
        return;
    }
    
    // POST /api/user/progress (update progress)
    if (options.method === 'POST' && endpoint === ENDPOINTS.progress) {
        try {
            const data = JSON.parse(options.body);
            
            // Simulate saving user progress
            if (data.completedLessons) {
                // In a real system, we'd save this data to a backend DB
                resolve({
                    success: true,
                    message: 'Progress updated successfully'
                });
                return;
            }
            
            reject(new ApiError('Invalid data format', 400));
        } catch (e) {
            reject(new ApiError('Invalid JSON', 400));
        }
        return;
    }
    
    // Reject other methods
    reject(new ApiError('Method not allowed', 405));
}

/**
 * Handle mock submissions endpoints
 */
function handleMockSubmissions(endpoint, options, resolve, reject) {
    // POST /api/submissions (submit code)
    if (options.method === 'POST') {
        try {
            const data = JSON.parse(options.body);
            
            if (data.code && data.lessonId) {
                // Simulate code checking
                const lesson = lessons.find(l => l.id === data.lessonId);
                
                if (!lesson) {
                    reject(new ApiError('Lesson not found', 404));
                    return;
                }
                
                if (lesson.checkCode && typeof lesson.checkCode === 'function') {
                    const isCorrect = lesson.checkCode(data.code);
                    
                    resolve({
                        success: true,
                        data: {
                            isCorrect,
                            feedback: isCorrect 
                                ? 'Great job! Your solution works correctly.' 
                                : 'Not quite right. Try again with the provided hints.'
                        }
                    });
                    return;
                }
                
                resolve({
                    success: false,
                    message: 'Cannot check code for this lesson'
                });
                return;
            }
            
            reject(new ApiError('Invalid submission data', 400));
        } catch (e) {
            reject(new ApiError('Invalid JSON', 400));
        }
        return;
    }
    
    // Reject other methods
    reject(new ApiError('Method not allowed', 405));
}

/**
 * Handle mock feedback endpoints
 */
function handleMockFeedback(endpoint, options, resolve, reject) {
    // POST /api/feedback
    if (options.method === 'POST') {
        try {
            const data = JSON.parse(options.body);
            
            if (data.feedback && data.feedback.trim()) {
                // In a real app, we'd save this to a database
                console.log('Received feedback:', data.feedback);
                
                resolve({
                    success: true,
                    message: 'Feedback submitted successfully. Thank you!'
                });
                return;
            }
            
            reject(new ApiError('Feedback cannot be empty', 400));
        } catch (e) {
            reject(new ApiError('Invalid JSON', 400));
        }
        return;
    }
    
    // Reject other methods
    reject(new ApiError('Method not allowed', 405));
}

/**
 * Handle mock achievements endpoints
 */
function handleMockAchievements(endpoint, options, resolve, reject) {
    // GET /api/user/achievements
    if (options.method === 'GET' || !options.method) {
        resolve({
            success: true,
            data: {
                unlocked: userState.achievements || [],
                all: achievements
            }
        });
        return;
    }
    
    // POST /api/user/achievements (unlock achievement)
    if (options.method === 'POST') {
        try {
            const data = JSON.parse(options.body);
            
            if (data.achievementId) {
                // Simulate unlocking an achievement
                resolve({
                    success: true,
                    message: 'Achievement unlocked successfully'
                });
                return;
            }
            
            reject(new ApiError('Invalid achievement data', 400));
        } catch (e) {
            reject(new ApiError('Invalid JSON', 400));
        }
        return;
    }
    
    // Reject other methods
    reject(new ApiError('Method not allowed', 405));
}
