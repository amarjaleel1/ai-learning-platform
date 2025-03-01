/**
 * Main module entry point for AI Learning Platform
 * Integrates all ES6 modules and initializes the application
 */

import * as State from './modules/state.js';
import Dashboard from './modules/dashboard.js';
import Notifications from './modules/notifications.js';
import Theme from './modules/theme.js';
import { applyUIFixes, fixZIndexIssues } from './modules/ui-fixes.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading indicator
        showLoader();
        
        // First apply UI fixes to ensure proper display during loading
        fixZIndexIssues();
        applyUIFixes();
        
        // Initialize state first
        await State.initUserState();
        
        // Initialize theme
        Theme.initTheme();
        
        // Initialize lessons
        await initLessons();
        
        // Initialize dashboard
        Dashboard.initDashboard();
        
        // Initialize navigation
        initNavigation();
        
        // Hide loader after initialization
        hideLoader();
        
        // Process URL hash to load correct view
        processUrlHash();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        Notifications.showNotification(
            'Error initializing application. Please refresh the page.',
            'error'
        );
        hideLoader();
        showErrorDisplay(error);
    }
});

/**
 * Initialize navigation and handle URL routing
 */
function initNavigation() {
    // Set up nav links
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-nav');
            navigateTo(targetView);
        });
    });
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        processUrlHash();
    });
    
    // Set up start first lesson button
    const startButton = document.getElementById('start-first-lesson');
    if (startButton) {
        startButton.addEventListener('click', () => {
            navigateTo('lessons/intro');
        });
    }
}

/**
 * Navigate to a specific view
 * @param {string} target - Target view path
 */
function navigateTo(target) {
    window.location.hash = target;
}

/**
 * Process URL hash to show correct view
 */
function processUrlHash() {
    const hash = window.location.hash.substring(1) || 'welcome';
    
    // Parse the hash - format can be 'view' or 'view/id'
    const [view, id] = hash.split('/');
    
    // Show the correct view
    showView(view, id);
}

/**
 * Show a specific view and hide others
 * @param {string} viewName - Name of the view to show
 * @param {string} id - Optional ID parameter (e.g., lesson ID)
 */
function showView(viewName, id) {
    // Hide all views
    document.querySelectorAll('[data-view]').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the requested view
    const targetView = document.querySelector(`[data-view="${viewName}"]`);
    if (targetView) {
        targetView.classList.remove('hidden');
        
        // If this is the lessons view and we have an ID, load that lesson
        if (viewName === 'lessons' && id) {
            loadLesson(id);
        }
        
        // Update active nav link
        updateActiveNavLink(viewName);
    } else {
        console.error(`View not found: ${viewName}`);
        // Show the welcome view as fallback
        const welcomeView = document.querySelector('[data-view="welcome"]');
        if (welcomeView) {
            welcomeView.classList.remove('hidden');
            updateActiveNavLink('welcome');
        }
    }
}

/**
 * Update active navigation link
 * @param {string} viewName - Current active view
 */
function updateActiveNavLink(viewName) {
    document.querySelectorAll('[data-nav]').forEach(link => {
        if (link.getAttribute('data-nav') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize lessons module
 * @returns {Promise} Promise that resolves when lessons are initialized
 */
async function initLessons() {
    // This function will be replaced with an ES module import
    // For now, we're just calling the existing global function
    if (typeof window.initLessons === 'function') {
        return window.initLessons();
    }
    
    return Promise.resolve();
}

/**
 * Show application loader
 */
function showLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

/**
 * Hide application loader
 */
function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Show application error display
 * @param {Error} error - The error that occurred
 */
function showErrorDisplay(error) {
    const errorContainer = document.getElementById('app-error');
    if (errorContainer) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = 'An error occurred while loading the application. Please try refreshing the page.';
        }
        
        const retryButton = document.getElementById('error-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        errorContainer.style.display = 'flex';
    } else {
        // Fallback if error container doesn't exist
        alert('An error occurred while loading the application. Please try refreshing the page.');
    }
    
    // Log detailed error for debugging
    console.error('Application error details:', error);
}

// Export global access to state functions
window.getUserState = State.getUserState;
window.saveUserState = State.saveUserState;
window.updateCoins = State.updateCoins;

// Export Notifications API
window.showNotification = Notifications.showNotification;

// Log module loaded
console.log('ES6 Module system initialized');
