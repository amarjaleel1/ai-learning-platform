/**
 * Authentication module for handling user login, logout, and session management
 */

import { post } from './utils/api-client.js';

// Import dependencies if needed
const API = window.API || {};
const EventBus = window.EventBus || { publish: () => {} };

// Authentication state
let currentUser = null;
let isAuthenticated = false;
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

/**
 * Initialize authentication state from stored data
 */
function initAuth() {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUserData = localStorage.getItem(USER_DATA_KEY);

    try {
        if (storedToken && storedUserData) {
            currentUser = JSON.parse(storedUserData);
            isAuthenticated = true;
            EventBus.publish('auth:initialized', { user: currentUser });
            return true;
        }
    } catch (error) {
        console.error('Error initializing auth state:', error);
    }

    // Clear potentially corrupted data
    clearAuthData();
    EventBus.publish('auth:initialized', { user: null });
    return false;
}

/**
 * Login with username and password
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data on success
 */
async function login(username, password) {
    try {
        // Temporary local authentication for development
        if (typeof API.post !== 'function') {
            console.log('API client not available, using mock authentication');
            // For development only - simulate successful login
            const mockUserData = {
                id: 'user-123',
                username: username,
                email: 'demo@example.com',
                name: username,
                role: 'user'
            };
            const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
            
            // Store auth data
            storeAuthData(mockToken, mockUserData);
            
            // Publish auth events
            EventBus.publish('auth:login', { user: mockUserData });
            
            return mockUserData;
        }

        // Real authentication flow
        const response = await post('auth/login', { username, password });
        
        // Store auth data
        storeAuthData(response.token, response.user);
        
        // Publish auth events
        EventBus.publish('auth:login', { user: response.user });
        
        return response.user;
    } catch (error) {
        EventBus.publish('auth:error', error);
        throw error;
    }
}

/**
 * Store authentication data in local storage
 * @param {string} token - JWT token
 * @param {Object} userData - User data
 */
function storeAuthData(token, userData) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    currentUser = userData;
    isAuthenticated = true;
}

/**
 * Clear authentication data
 */
function clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    currentUser = null;
    isAuthenticated = false;
}

/**
 * Logout the current user
 */
async function logout() {
    try {
        // Attempt to call logout endpoint if API is available
        if (typeof API.post === 'function') {
            await API.post('auth/logout').catch(err => console.warn('Logout API call failed:', err));
        }
    } finally {
        // Always clear local data even if API call fails
        clearAuthData();
        EventBus.publish('auth:logout');
    }
}

/**
 * Get the current user data
 * @returns {Object|null} Current user data or null if not authenticated
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isUserAuthenticated() {
    return isAuthenticated;
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data on success
 */
async function register(userData) {
    try {
        const response = await API.post('auth/register', userData);
        EventBus.publish('auth:register', { user: response.user });
        return response.user;
    } catch (error) {
        EventBus.publish('auth:error', error);
        throw error;
    }
}

// Initialize authentication on script load
document.addEventListener('DOMContentLoaded', initAuth);

// Make auth functions available globally
window.Auth = {
    login,
    logout,
    register,
    getCurrentUser,
    isAuthenticated: isUserAuthenticated,
    initAuth
};
