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

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading indicator
        showLoader();
        
        // First apply UI fixes to ensure proper display during loading
        fixZIndexIssues();
        applyUIFixes();
        
        // Initialize network module for API calls and connection monitoring
        Network.initNetwork();
        
        // Initialize state first
        await State.initUserState();
        menu for responsive design
        // Initialize themeeMenu();
        Theme.initTheme();
        dling for mobile devices
        // Initialize mobile menu for responsive designling();
        MobileMenu.initMobileMenu();
        tionality
        // Initialize touch handling for mobile devicesnctionality();
        TouchHandler.initTouchHandling();
        
        // Initialize print functionalitysons();
        Print.initPrintFunctionality();
        
        // Initialize lessonshboard();
        await initLessons();
        
        // Initialize dashboardn();
        Dashboard.initDashboard();
        tion
        // Initialize navigation
        initNavigation();
         Process URL hash to load correct view
        // Hide loader after initializationh();
        hideLoader();
           console.log('Application initialized successfully');
        // Process URL hash to load correct view } catch (error) {
        processUrlHash();        console.error('Error initializing application:', error);
             Notifications.showNotification(
        console.log('Application initialized successfully');ease refresh the page.',
    } catch (error) {         'error'
        console.error('Error initializing application:', error);
        Notifications.showNotification(
            'Error initializing application. Please refresh the page.',
            'error'
        );
        hideLoader();
        showErrorDisplay(error);
    }ze navigation and handle URL routing
});
tion initNavigation() {
/**
 * Initialize navigation and handle URL routingch(link => {
 */ener('click', (e) => {
function initNavigation() {     e.preventDefault();
    // Set up nav links        const targetView = link.getAttribute('data-nav');
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-nav');
            navigateTo(targetView);
        });addEventListener('hashchange', () => {
    });   processUrlHash();
       });
    // Handle hash changes    
    window.addEventListener('hashchange', () => { // Set up start first lesson button
        processUrlHash();nt.getElementById('start-first-lesson');
    });
         startButton.addEventListener('click', () => {
    // Set up start first lesson buttonns/intro');
    const startButton = document.getElementById('start-first-lesson');
    if (startButton) {   }
        startButton.addEventListener('click', () => {}
            navigateTo('lessons/intro');
        });
    }Navigate to a specific view
} Target view path

/**tion navigateTo(target) {
 * Navigate to a specific view
 * @param {string} target - Target view path
 */
function navigateTo(target) {
    window.location.hash = target;show correct view
}*/
function processUrlHash() {
/** const hash = window.location.hash.substring(1) || 'welcome';
 * Process URL hash to show correct view
 */id'
function processUrlHash() {
    const hash = window.location.hash.substring(1) || 'welcome'; 
    
    // Parse the hash - format can be 'view' or 'view/id');
    const [view, id] = hash.split('/');
    
    // Show the correct view
    showView(view, id);how a specific view and hide others
}Name of the view to show

/**
 * Show a specific view and hide others
 * @param {string} viewName - Name of the view to showide all views
 * @param {string} id - Optional ID parameter (e.g., lesson ID)
 */
function showView(viewName, id) {
    // Hide all views
    document.querySelectorAll('[data-view]').forEach(view => {how the requested view
        view.classList.add('hidden');uerySelector(`[data-view="${viewName}"]`);
    });
    etView.classList.remove('hidden');
    // Show the requested view
    const targetView = document.querySelector(`[data-view="${viewName}"]`);e have an ID, load that lesson
    if (targetView) {
        targetView.classList.remove('hidden');;
        
        // If this is the lessons view and we have an ID, load that lesson
        if (viewName === 'lessons' && id) {/ Update active nav link
            loadLesson(id);   updateActiveNavLink(viewName);
        }   } else {
                console.error(`View not found: ${viewName}`);
        // Update active nav link     // Show the welcome view as fallback
        updateActiveNavLink(viewName);ment.querySelector('[data-view="welcome"]');
    } else {
        console.error(`View not found: ${viewName}`);         welcomeView.classList.remove('hidden');
        // Show the welcome view as fallback');
        const welcomeView = document.querySelector('[data-view="welcome"]');
        if (welcomeView) {
            welcomeView.classList.remove('hidden');
            updateActiveNavLink('welcome');
        }
    } active navigation link
}am {string} viewName - Current active view
*/
/**function updateActiveNavLink(viewName) {
 * Update active navigation link document.querySelectorAll('[data-nav]').forEach(link => {
 * @param {string} viewName - Current active viewe('data-nav') === viewName) {
 */
function updateActiveNavLink(viewName) {     } else {
    document.querySelectorAll('[data-nav]').forEach(link => {ove('active');
        if (link.getAttribute('data-nav') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });nitialize lessons module
} that resolves when lessons are initialized
*/
/**async function initLessons() {
 * Initialize lessons module // This function will be replaced with an ES module import
 * @returns {Promise} Promise that resolves when lessons are initialized calling the existing global function
 */ if (typeof window.initLessons === 'function') {
async function initLessons() {nitLessons();
    // This function will be replaced with an ES module import
    // For now, we're just calling the existing global function
    if (typeof window.initLessons === 'function') {
        return window.initLessons();
    }
    /**
    return Promise.resolve();Show application loader
}
ction showLoader() {
/**ment.getElementById('app-loader');
 * Show application loader
 */yle.display = 'flex';
function showLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'flex';/**
    }Hide application loader
}

/** const loader = document.getElementById('app-loader');
 * Hide application loader
 */
function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'none';
    }pplication error display
}m {Error} error - The error that occurred

/**error) {
 * Show application error displayrror');
 * @param {Error} error - The error that occurred
 */rrorMessage = document.getElementById('error-message');
function showErrorDisplay(error) {f (errorMessage) {
    const errorContainer = document.getElementById('app-error');    errorMessage.textContent = 'An error occurred while loading the application. Please try refreshing the page.';
    if (errorContainer) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {'error-retry');
            errorMessage.textContent = 'An error occurred while loading the application. Please try refreshing the page.';
        }       retryButton.addEventListener('click', () => {
                    window.location.reload();
        const retryButton = document.getElementById('error-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {       
                window.location.reload();        errorContainer.style.display = 'flex';
            });
        }esn't exist
        ing the application. Please try refreshing the page.');
        errorContainer.style.display = 'flex';
    } else {    
        // Fallback if error container doesn't existor debugging
        alert('An error occurred while loading the application. Please try refreshing the page.');
    }}
    
    // Log detailed error for debugging
    console.error('Application error details:', error);window.getUserState = State.getUserState;













console.log('ES6 Module system initialized');// Log module loadedwindow.showNotification = Notifications.showNotification;// Export Notifications APIwindow.updateCoins = State.updateCoins;window.saveUserState = State.saveUserState;window.getUserState = State.getUserState;// Export global access to state functions}window.saveUserState = State.saveUserState;
window.updateCoins = State.updateCoins;

// Export Notifications API
window.showNotification = Notifications.showNotification;

// Log module loaded
console.log('ES6 Module system initialized');
