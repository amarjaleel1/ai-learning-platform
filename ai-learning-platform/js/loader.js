/**
 * Module loader and performance optimization
 * This file implements dynamic loading of modules and resources
 */

// Keep track of loaded modules
const loadedModules = new Set();

/**
 * Dynamically load a JavaScript module 
 * @param {string} path - Path to the JavaScript file
 * @returns {Promise} - Promise that resolves when the script is loaded
 */
function loadModule(path) {
    if (loadedModules.has(path)) {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.async = true;
        
        script.onload = () => {
            loadedModules.add(path);
            console.log(`Module loaded: ${path}`);
            resolve();
        };
        
        script.onerror = () => {
            reject(new Error(`Failed to load module: ${path}`));
        };
        
        document.body.appendChild(script);
    });
}

/**
 * Load multiple modules in sequence
 * @param {Array<string>} modules - Array of module paths
 * @returns {Promise} - Promise that resolves when all modules are loaded
 */
function loadModules(modules) {
    return modules.reduce((chain, modulePath) => {
        return chain.then(() => loadModule(modulePath));
    }, Promise.resolve());
}

/**
 * Load modules required for the specific view
 * @param {string} view - The current view/page
 * @returns {Promise} - Promise that resolves when required modules are loaded
 */
function loadRequiredModules(view) {
    // Base modules needed for any view
    const baseModules = [
        'js/main.js',
        'js/profile.js'
    ];
    
    // View-specific modules
    const viewModules = {
        'welcome': [
            'js/welcome.js'
        ],
        'lessons': [
            'lessons/additional_lessons.js',
            'js/lessons.js'
        ],
        'code': [
            'js/code-editor.js'
        ],
        'visualization': [
            'js/visualization.js'
        ]
    };
    
    // Determine which modules to load
    let modulesToLoad = [...baseModules];
    
    if (viewModules[view]) {
        modulesToLoad = [...modulesToLoad, ...viewModules[view]];
    }
    
    // Load the modules
    return loadModules(modulesToLoad);
}

/**
 * Initialize application with dynamic loading
 */
function initApp() {
    // Determine initial view based on URL hash or default to welcome
    const initialView = window.location.hash.substring(1) || 'welcome';
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Load required modules for initial view
    loadRequiredModules(initialView)
        .then(() => {
            // Initialize the view
            initView(initialView);
            
            // Hide loading indicator
            hideLoadingIndicator();
            
            // Set up navigation handling for future view changes
            setupNavigation();
        })
        .catch(error => {
            console.error('Failed to initialize application:', error);
            showErrorMessage('Failed to load application resources. Please refresh the page.');
        });
}

/**
 * Initialize a specific view
 * @param {string} view - The view to initialize
 */
function initView(view) {
    // Call the appropriate init function based on the view
    switch(view) {
        case 'welcome':
            if (typeof initWelcomeView === 'function') {
                initWelcomeView();
            }
            break;
        case 'lessons':
            if (typeof initLessons === 'function') {
                initLessons();
            }
            break;
        // Add other views as needed
    }
    
    // Update UI to reflect current view
    updateActiveView(view);
}

/**
 * Set up navigation handling for dynamic loading of views
 */
function setupNavigation() {
    // Handle hash changes for navigation
    window.addEventListener('hashchange', () => {
        const newView = window.location.hash.substring(1) || 'welcome';
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Load required modules for the new view
        loadRequiredModules(newView)
            .then(() => {
                // Initialize the new view
                initView(newView);
                
                // Hide loading indicator
                hideLoadingIndicator();
            })
            .catch(error => {
                console.error('Failed to load view:', error);
                showErrorMessage('Failed to load view. Please try again.');
            });
    });
    
    // Set up navigation links
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-nav');
            window.location.hash = targetView;
        });
    });
}

/**
 * Show loading indicator
 */
function showLoadingIndicator() {
    // Create loading indicator if it doesn't exist
    let loader = document.getElementById('app-loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'app-loader';
        loader.innerHTML = '<div class="loader-spinner"></div><p>Loading...</p>';
        document.body.appendChild(loader);
    }
    
    // Show the loader
    loader.style.display = 'flex';
}

/**
 * Hide loading indicator
 */
function hideLoadingIndicator() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    hideLoadingIndicator();
    
    // Create error message element if it doesn't exist
    let errorElement = document.getElementById('app-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'app-error';
        errorElement.className = 'app-error';
        errorElement.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <p id="error-message"></p>
                <button id="error-retry">Retry</button>
            </div>
        `;
        document.body.appendChild(errorElement);
        
        // Add retry handler
        document.getElementById('error-retry').addEventListener('click', () => {
            errorElement.style.display = 'none';
            initApp();
        });
    }
    
    // Update error message and show
    document.getElementById('error-message').textContent = message;
    errorElement.style.display = 'flex';
}

/**
 * Update UI to reflect the active view
 * @param {string} view - The current active view
 */
function updateActiveView(view) {
    // Update navigation highlighting
    document.querySelectorAll('[data-nav]').forEach(link => {
        if (link.getAttribute('data-nav') === view) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update main content visibility
    document.querySelectorAll('[data-view]').forEach(viewElement => {
        if (viewElement.getAttribute('data-view') === view) {
            viewElement.classList.remove('hidden');
        } else {
            viewElement.classList.add('hidden');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
