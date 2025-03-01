/**
 * Main module entry point for AI Learning Platform
 * Integrates all ES6 modules and initializes the application
 */

import * as State from './modules/state.js';
import Dashboard from './modules/dashboard.js';
import Notifications from './modules/notifications.js';
import Theme from './modules/theme.js';
import { applyUIFixes, fixZIndexIssues } from './modules/ui-fixes.js';
import MobileMenu from './modules/mobile-menu.js';
import TouchHandler from './modules/touch-handler.js';
import Print from './modules/print.js';
import Network from './modules/network.js';
import * as Helpers from './utils/helpers.js';
import CONFIG from './utils/config.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing application...');
    try {
        // Show loading indicator
        showLoader();
        console.log('Loader displayed');
        
        // First apply UI fixes to ensure proper display during loading
        fixZIndexIssues();
        applyUIFixes();
        
        // Initialize network module for API calls and connection monitoring
        Network.initNetwork();
        
        // Initialize state first
        await State.initUserState();
        
        // Initialize theme
        Theme.initTheme();
        
        // Initialize mobile menu for responsive design
        MobileMenu.initMobileMenu();
        
        // Initialize touch handling for mobile devices
        TouchHandler.initTouchHandling();
        
        // Initialize print functionality
        Print.initPrintFunctionality();
        
        // Initialize lessons
        console.log('Initializing lessons...');
        await initLessons();
        
        // Initialize dashboard
        Dashboard.initDashboard();
        
        // Initialize navigation
        initNavigation();
        
        // Process URL hash to load correct view
        processUrlHash();
        
        // Hide loader after initialization
        console.log('Initialization complete, hiding loader');
        hideLoader();
        
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
    console.log(`Showing view: ${viewName}${id ? ' with ID: ' + id : ''}`);
    
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
            if (typeof loadLesson === 'function') {
                loadLesson(id);
            } else {
                console.error('loadLesson function not found');
            }
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
        } else {
            console.error('Welcome view not found either');
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
        console.log('Calling window.initLessons()');
        return window.initLessons();
    } else {
        console.warn('window.initLessons function not found, skipping lesson initialization');
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
        console.log('Loader element found and displayed');
    } else {
        console.error('Loader element not found');
    }
}

/**
 * Hide application loader
 */
function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'none';
        console.log('Loader hidden');
    } else {
        console.error('Loader element not found when trying to hide');
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

// Fix for welcome page
document.addEventListener('DOMContentLoaded', () => {
    // Make sure welcome page is visible initially if no hash
    if (!window.location.hash) {
        const welcomeView = document.querySelector('[data-view="welcome"]');
        if (welcomeView) {
            document.querySelectorAll('[data-view]').forEach(view => {
                view.classList.add('hidden');
            });
            welcomeView.classList.remove('hidden');
        }
    }
});

// Export global access to state functions
window.saveUserState = State.saveUserState;
window.updateCoins = State.updateCoins;
window.getUserState = State.getUserState;

// Export Notifications API
window.showNotification = Notifications.showNotification;

// Log module loaded
console.log('ES6 Module system initialized');
