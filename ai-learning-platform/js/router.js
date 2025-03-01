/**
 * Simple router for handling navigation in the single page application
 */

// Route definitions
const routes = {
    'welcome': {
        title: 'Welcome - AI Learning Platform',
        init: initWelcomeView
    },
    'lessons': {
        title: 'Lessons - AI Learning Platform',
        init: initLessonsView
    },
    'dashboard': {
        title: 'Dashboard - AI Learning Platform',
        init: initDashboardView
    },
    'profile': {
        title: 'Profile - AI Learning Platform',
        init: initProfileView
    },
    'about': {
        title: 'About - AI Learning Platform',
        init: initAboutView
    }
};

// Current active route
let currentRoute = null;

/**
 * Initialize the router
 */
function initRouter() {
    // Set up navigation links
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-nav');
            navigateTo(route);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
    
    // Initial route from URL or default
    const initialRoute = getRouteFromUrl() || 'welcome';
    navigateTo(initialRoute, false); // Don't push state for initial load
}

/**
 * Navigate to specified route
 * @param {string} routeName - Name of the route
 * @param {boolean} pushState - Whether to push state to history
 * @param {Object} params - Additional parameters to pass to the route
 */
function navigateTo(routeName, pushState = true, params = {}) {
    // Get the route configuration
    const route = routes[routeName];
    if (!route) {
        console.error(`Route not found: ${routeName}`);
        navigateTo('welcome');
        return;
    }
    
    // Hide all views
    document.querySelectorAll('[data-view]').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the selected view
    const view = document.querySelector(`[data-view="${routeName}"]`);
    if (view) {
        view.classList.remove('hidden');
    }
    
    // Update active navigation links
    document.querySelectorAll('[data-nav]').forEach(link => {
        if (link.getAttribute('data-nav') === routeName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update document title
    document.title = route.title || 'AI Learning Platform';
    
    // Initialize the view if needed
    if (typeof route.init === 'function') {
        route.init(params);
    }
    
    // Update browser history if needed
    if (pushState) {
        const url = `#${routeName}`;
        history.pushState({ route: routeName, params }, route.title, url);
    }
    
    // Update current route
    currentRoute = routeName;
    
    // Track page view if analytics is available
    if (typeof trackEvent === 'function') {
        trackEvent('page_view', { page: routeName });
    }
    
    // Close mobile menu if open
    document.body.classList.remove('menu-open');
    
    // Save the last route in user state if available
    if (typeof saveUserState === 'function') {
        saveUserState({ lastRoute: routeName });
    }
}

/**
 * Handle browser back/forward buttons
 * @param {PopStateEvent} event - The popstate event
 */
function handlePopState(event) {
    if (event.state && event.state.route) {
        navigateTo(event.state.route, false, event.state.params);
    } else {
        // Fallback to parsing URL if no state
        const route = getRouteFromUrl() || 'welcome';
        navigateTo(route, false);
    }
}

/**
 * Extract route from URL hash
 * @returns {string|null} - The route name or null if not found
 */
function getRouteFromUrl() {
    const hash = window.location.hash.substring(1);
    return hash || null;
}

/**
 * Initialize the welcome view
 */
function initWelcomeView() {
    // This is handled by welcome.js, but we could put additional setup here
}

/**
 * Initialize the lessons view
 * @param {Object} params - Parameters for the view
 */
function initLessonsView(params) {
    if (params && params.lessonId) {
        // If a specific lesson was requested, load it
        loadLesson(params.lessonId);
    } else if (userState && userState.currentLesson) {
        // Load the last viewed lesson
        loadLesson(userState.currentLesson);
    } else {
        // No lesson specified, show lesson list
        updateLessonList();
    }
}

/**
 * Initialize the dashboard view
 */
function initDashboardView() {
    // Update dashboard with latest user progress
    updateDashboard();
}

/**
 * Initialize the profile view
 */
function initProfileView() {
    // Update profile with user data
    updateProfileView();
}

/**
 * Initialize the about view
 */
function initAboutView() {
    // No special initialization needed
}

// Export router functions
window.initRouter = initRouter;
window.navigateTo = navigateTo;
