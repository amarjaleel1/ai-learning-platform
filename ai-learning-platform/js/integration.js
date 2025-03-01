/**
 * Integration module to connect all components of the AI Learning Platform
 * This file ensures proper initialization order and communication between modules
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application in the correct order
    initApplication();
});

/**
 * Main initialization function
 * Ensures components are initialized in the correct order with proper dependencies
 */
async function initApplication() {
    try {
        console.log('🚀 Initializing AI Learning Platform...');
        
        // Display loading indicator
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('visible');
        }
        
        // 1. Initialize utilities first
        console.log('⚙️ Loading utilities...');
        
        // 2. Initialize user state management
        console.log('👤 Loading user state...');
        await initUserState();
        
        // 3. Initialize lessons
        console.log('📚 Loading lessons...');
        await initLessons();
        
        // 4. Initialize code editor
        console.log('💻 Setting up code editor...');
        initCodeEditor();
        
        // 5. Initialize visualizations
        console.log('📊 Preparing visualizations...');
        initVisualization();
        
        // 6. Initialize UI components
        console.log('🎨 Setting up UI components...');
        setupUIComponents();
        
        // 7. Initialize dashboard
        console.log('📊 Setting up dashboard...');
        initDashboard();
        
        // 8. Set up analytics (if enabled)
        if (userState.preferences?.analyticsConsent !== false) {
            console.log('📈 Initializing analytics...');
            initAnalytics();
        }
        
        // 9. Check for achievements and daily rewards
        console.log('🏆 Checking achievements...');
        checkAchievements();
        checkDailyLogin();
        
        // 10. Initialize router and navigation
        console.log('🧭 Setting up navigation...');
        setupNavigation();
        
        // Everything is loaded, hide loader
        if (loader) {
            loader.classList.remove('visible');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
        
        console.log('✅ Application initialized successfully!');
        
        // Dispatch event that the app is ready
        window.dispatchEvent(new CustomEvent('app-ready'));
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showInitializationError(error);
    }
}

/**
 * Initialize UI components not handled by other modules
 */
function setupUIComponents() {
    // Setup theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Update theme attribute
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save preference
            localStorage.setItem('theme', newTheme);
            
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(`Switched to ${newTheme} theme`, 'info');
            }
        });
        
        // Set initial theme based on preference or system setting
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    // Setup mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sideNav = document.querySelector('.sidebar');
    
    if (menuToggle && sideNav) {
        menuToggle.addEventListener('click', () => {
            sideNav.classList.toggle('visible');
            menuToggle.setAttribute(
                'aria-expanded',
                menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (sideNav.classList.contains('visible') && 
                !sideNav.contains(event.target) && 
                event.target !== menuToggle) {
                sideNav.classList.remove('visible');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Setup footer links
    setupFooterLinks();
    
    // Setup welcome page start button
    const startButton = document.getElementById('start-first-lesson');
    if (startButton) {
        startButton.addEventListener('click', () => {
            // Find the first lesson
            if (window.lessons && window.lessons.length > 0) {
                const firstLesson = window.lessons[0];
                
                // Navigate to lessons view
                if (typeof navigateTo === 'function') {
                    navigateTo('lessons', true, { lessonId: firstLesson.id });
                } else if (typeof loadLesson === 'function') {
                    loadLesson(firstLesson.id);
                }
            }
        });
    }
}

/**
 * Set up navigation between views
 */
function setupNavigation() {
    // If we have a router, initialize it
    if (typeof initRouter === 'function') {
        initRouter();
        return;
    }
    
    // Otherwise implement basic navigation
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-nav');
            navigateToView(view);
        });
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            navigateToView(event.state.view, false);
        }
    });
    
    // Check for hash in URL
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateToView(hash);
    } else {
        // Default to welcome view or last viewed
        const lastView = userState.lastView || 'welcome';
        navigateToView(lastView);
    }
}

/**
 * Navigate to a specific view
 * @param {string} viewId - The ID of the view to show
 * @param {boolean} updateHistory - Whether to update browser history
 */
function navigateToView(viewId, updateHistory = true) {
    // Hide all views
    document.querySelectorAll('[data-view]').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the requested view
    const viewToShow = document.querySelector(`[data-view="${viewId}"]`);
    if (!viewToShow) {
        console.error(`View not found: ${viewId}`);
        navigateToView('welcome');
        return;
    }
    
    viewToShow.classList.remove('hidden');
    
    // Update active navigation
    document.querySelectorAll('[data-nav]').forEach(link => {
        if (link.getAttribute('data-nav') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update browser history if needed
    if (updateHistory) {
        history.pushState({ view: viewId }, '', `#${viewId}`);
    }
    
    // Update user state
    if (typeof saveUserState === 'function') {
        saveUserState({ lastView: viewId });
    }
    
    // Perform view-specific initializations
    switch (viewId) {
        case 'lessons':
            // If we're showing the lessons view, make sure the lesson list is updated
            if (typeof updateLessonList === 'function') {
                updateLessonList();
            }
            break;
        
        case 'dashboard':
            // If we're showing the dashboard, update it with latest data
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            break;
    }
    
    // Track page view in analytics
    if (typeof trackEvent === 'function') {
        trackEvent('page_view', { page: viewId });
    }
}

/**
 * Setup footer links
 */
function setupFooterLinks() {
    // Show privacy policy
    const privacyLink = document.querySelector('a[href="#privacy"]');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyPolicy();
        });
    }
    
    // Show terms of service
    const termsLink = document.querySelector('a[href="#terms"]');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTermsOfService();
        });
    }
    
    // Show analytics settings
    const analyticsSettingsLink = document.getElementById('show-analytics-settings');
    if (analyticsSettingsLink) {
        analyticsSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAnalyticsSettings();
        });
    }
}

/**
 * Show privacy policy modal
 */
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'modal privacy-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Privacy Policy</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Your Privacy Matters</h4>
                <p>The AI Learning Platform is committed to protecting your privacy.</p>
                
                <h4>Data Storage</h4>
                <p>All your learning progress is stored locally in your browser. We do not send your personal data to any server.</p>
                
                <h4>Analytics</h4>
                <p>If you've enabled analytics, we collect anonymous usage data to improve the platform. This includes:</p>
                <ul>
                    <li>Which lessons are viewed</li>
                    <li>How much time is spent on lessons</li>
                    <li>Completion rates</li>
                </ul>
                <p>No personally identifiable information is collected.</p>
                
                <h4>Cookies</h4>
                <p>We use local storage rather than cookies to remember your preferences and progress.</p>
            </div>
            <div class="modal-footer">
                <button class="close-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

/**
 * Show terms of service modal
 */
function showTermsOfService() {
    const modal = document.createElement('div');
    modal.className = 'modal terms-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Terms of Service</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Usage Agreement</h4>
                <p>By using the AI Learning Platform, you agree to these terms.</p>
                
                <h4>Educational Purpose</h4>
                <p>This platform is provided for educational purposes only.</p>
                
                <h4>Content Usage</h4>
                <p>The lessons and exercises on this platform are for personal learning.</p>
                
                <h4>Code of Conduct</h4>
                <p>Users are expected to:</p>
                <ul>
                    <li>Respect the platform and other users</li>
                    <li>Not attempt to circumvent any restrictions</li>
                    <li>Not use the platform for illegal purposes</li>
                </ul>
                
                <h4>Disclaimer</h4>
                <p>This platform is provided "as is" without warranty of any kind.</p>
            </div>
            <div class="modal-footer">
                <button class="close-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

/**
 * Show analytics settings modal
 */
function showAnalyticsSettings() {
    const analyticsEnabled = userState.preferences?.analyticsConsent !== false;
    
    const modal = document.createElement('div');
    modal.className = 'modal analytics-settings-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Data Settings</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>We use analytics to improve the platform. This data is anonymous and stored locally.</p>
                
                <div class="setting-option">
                    <label for="analytics-toggle">Analytics</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="analytics-toggle" ${analyticsEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <p class="setting-description">
                    When enabled, we collect anonymous usage data like which lessons you view and how much time you spend on them.
                </p>
                
                <div class="data-actions">
                    <button id="reset-analytics" class="secondary-button">Reset Analytics Data</button>
                    <button id="export-user-data" class="secondary-button">Export My Data</button>
                </div>
            </div>
            <div class="modal-footer">
                <button id="save-settings" class="primary-button">Save Settings</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#save-settings').addEventListener('click', () => {
        // Save analytics preference
        const analyticsToggle = document.getElementById('analytics-toggle');
        
        if (!userState.preferences) {
            userState.preferences = {};
        }
        
        userState.preferences.analyticsConsent = analyticsToggle.checked;
        
        // Save user state
        if (typeof saveUserState === 'function') {
            saveUserState();
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('Settings saved successfully', 'success');
        }
        
        // If analytics was just enabled, initialize it
        if (analyticsToggle.checked && typeof initAnalytics === 'function') {
            initAnalytics();
        }
        
        // Close modal
        document.body.removeChild(modal);
    });
    
    // Reset analytics button
    modal.querySelector('#reset-analytics').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
            if (typeof resetAnalytics === 'function') {
                resetAnalytics();
                
                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification('Analytics data has been reset', 'info');
                }
            }
        }
    });
    
    // Export user data button
    modal.querySelector('#export-user-data').addEventListener('click', () => {
        exportUserData();
    });
}

/**
 * Export user data as JSON file
 */
function exportUserData() {
    // Create a data object with all user data
    const userData = {
        userState: userState,
        analyticsData: window.analyticsData || {},
        preferences: userState.preferences || {},
        timestamp: new Date().toISOString(),
        platform: 'AI Learning Platform'
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(userData, null, 2);
    
    // Create a Blob with the data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_learning_data_${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Your data has been exported', 'success');
    }
}

/**
 * Initialize the visualization module
 * This is a wrapper to ensure the visualization is initialized only once
 */
function initVisualization() {
    // If visualization canvas doesn't exist, no need to initialize
    const canvas = document.getElementById('visualization-canvas');
    if (!canvas) return;
    
    // If the canvas already has a context, it's already initialized
    if (canvas._initialized) return;
    
    // Mark as initialized to prevent duplicate initialization
    canvas._initialized = true;
    
    // Set up canvas and context
    const ctx = canvas.getContext('2d');
    
    // Create initial visualization state
    window.visualizationState = {
        type: null,
        data: null,
        animation: null,
        step: 0
    };
    
    console.log('Visualization system initialized');
}

/**
 * Check for and show a daily login reward
 */
function checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (!userState.lastLoginDate || userState.lastLoginDate !== today) {
        // It's a new day, check for streak
        let isConsecutiveDay = false;
        
        if (userState.lastLoginDate) {
            const lastDate = new Date(userState.lastLoginDate);
            const currentDate = new Date();
            
            // Check if last login was yesterday
            lastDate.setDate(lastDate.getDate() + 1);
            isConsecutiveDay = lastDate.toISOString().split('T')[0] === today;
        }
        
        // Update streak
        if (isConsecutiveDay) {
            userState.streak = (userState.streak || 0) + 1;
        } else {
            userState.streak = 1;
        }
        
        // Update login date
        userState.lastLoginDate = today;
        
        // Save changes
        saveUserState();
        
        // Show login reward after short delay
        setTimeout(() => {
            showDailyReward(userState.streak);
        }, 1500);
    }
}

/**
 * Show daily login reward modal
 * @param {number} streakDays - Number of consecutive login days
 */
function showDailyReward(streakDays) {
    // Base reward is 5 coins
    let reward = 5;
    
    // Bonus for streak
    if (streakDays > 1) {
        reward += Math.min(streakDays, 5); // Max +5 bonus for 5+ day streak
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal daily-reward-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="reward-header">
                <i class="fas fa-calendar-check"></i>
                <h3>Daily Login Reward</h3>
            </div>
            <div class="reward-body">
                <p>Welcome back! You've earned:</p>
                <div class="coins-reward">
                    <i class="fas fa-coins"></i>
                    <span>${reward} coins</span>
                </div>
                ${streakDays > 1 ? `
                    <div class="streak-bonus">
                        <i class="fas fa-fire"></i>
                        <span>${streakDays} day streak!</span>
                    </div>
                ` : ''}
            </div>
            <button class="primary-button" id="claim-reward">Claim Reward</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
    
    // Add event listener to claim button
    document.getElementById('claim-reward').addEventListener('click', () => {
        // Award the coins
        awardCoins(reward, 'daily login reward');
        
        // Close modal with animation
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

/**
 * Show initialization error message
 * @param {Error} error - The error that occurred
 */
function showInitializationError(error) {
    // Hide loader
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.remove('visible');
    }
    
    // Show error in UI
    const errorContainer = document.createElement('div');
    errorContainer.className = 'initialization-error';
    errorContainer.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>We couldn't initialize the application. Please try refreshing the page.</p>
            <p class="error-details">Error: ${error.message}</p>
            <button id="retry-button">Retry</button>
        </div>
    `;
    
    document.body.appendChild(errorContainer);
    
    // Add retry button functionality
    document.getElementById('retry-button').addEventListener('click', () => {
        window.location.reload();
    });
}

// Make important functions available globally
window.initApplication = initApplication;
window.navigateToView = navigateToView;
window.showPrivacyPolicy = showPrivacyPolicy;
window.showTermsOfService = showTermsOfService;
window.showAnalyticsSettings = showAnalyticsSettings;
window.exportUserData = exportUserData;
