/**
 * Main application initialization and coordination
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator
    const appLoader = document.getElementById('app-loader');
    if (appLoader) {
        appLoader.classList.add('visible');
    }

    // Initialize components in sequence
    initializeApplication()
        .then(() => {
            console.log('Application initialized successfully');
            hideLoading();
        })
        .catch(error => {
            console.error('Application initialization failed:', error);
            showError('Failed to initialize the application. Please try again later.');
        });
});

// Application initialization sequence
async function initializeApplication() {
    try {
        // 1. Initialize configuration and utilities
        console.log('Loading configuration...');
        await initializeConfig();
        
        // 2. Load user state
        console.log('Loading user state...');
        await initUserState();
        
        // 3. Initialize lessons
        console.log('Loading lessons...');
        await initLessons();
        
        // 4. Initialize UI components
        console.log('Setting up UI...');
        initCodeEditor();
        await setupUIComponents();
        
        // 5. Set up navigation
        console.log('Setting up navigation...');
        setupNavigation();
        
        // 6. Initialize analytics (if enabled)
        if (userState.preferences?.analyticsConsent !== false) {
            console.log('Initializing analytics...');
            initAnalytics();
        }
        
        // 7. Check daily login and achievements
        checkDailyLogin();
        checkAchievements();
        
        // 8. Load last viewed lesson or welcome screen
        await loadInitialContent();
        
        return true;
    } catch (error) {
        console.error('Initialization error:', error);
        throw error;
    }
}

// Initialize configuration
async function initializeConfig() {
    return new Promise(resolve => {
        // Load any configuration from server or local storage
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                window.appConfig = { ...window.appConfig, ...config };
            } catch (e) {
                console.error('Error parsing stored config:', e);
            }
        }
        
        resolve();
    });
}

// Set up UI components not handled by other modules
async function setupUIComponents() {
    return new Promise(resolve => {
        // Setup theme
        const preferredTheme = localStorage.getItem('theme') || 
                              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', preferredTheme);
        
        // Setup theme toggle if it exists
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
        
        // Initialize other UI components
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.body.classList.toggle('menu-open');
            });
        }
        
        resolve();
    });
}

// Set up SPA navigation
function setupNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('[data-nav]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-nav');
            navigateToView(view);
        });
    });
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            showView(event.state.view, false);
        }
    });
    
    // Check for deep linking on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateToView(hash);
    }
}

// Navigate to a view
function navigateToView(view) {
    showView(view);
    
    // Update URL without reloading page
    const url = `#${view}`;
    history.pushState({ view: view }, '', url);
}

// Show a specific view, hiding others
function showView(viewId, updateUserState = true) {
    // Hide all views
    const views = document.querySelectorAll('[data-view]');
    views.forEach(v => v.classList.add('hidden'));
    
    // Show requested view
    const viewToShow = document.querySelector(`[data-view="${viewId}"]`);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
        
        // Update active navigation
        const navLinks = document.querySelectorAll('[data-nav]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-nav') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update user state if needed
        if (updateUserState && typeof saveUserState === 'function') {
            saveUserState({ lastView: viewId });
        }
        
        // Track view in analytics
        if (typeof trackEvent === 'function') {
            trackEvent('view_changed', { view: viewId });
        }
        
        // Close mobile menu if open
        document.body.classList.remove('menu-open');
    }
}

// Load initial content based on user state
async function loadInitialContent() {
    // If user was in the middle of a lesson, load it
    if (userState.currentLesson) {
        const lessonView = document.querySelector('[data-view="lessons"]');
        if (lessonView) {
            showView('lessons');
            loadLesson(userState.currentLesson);
        }
    } else {
        // Otherwise show welcome screen
        showView('welcome');
    }
}

// Handle daily login check
function checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (!userState.lastLoginDate || userState.lastLoginDate !== today) {
        // It's a new day, check for streak
        let isConsecutiveDay = false;
        
        if (userState.lastLoginDate) {
            const lastDate = new Date(userState.lastLoginDate);
            const currentDate = new Date();
            
            // Check if yesterday
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

// Show daily reward popup
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

// Show loading indicator
function showLoading() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('visible');
    }
}

// Hide loading indicator
function hideLoading() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.remove('visible');
        
        // Completely remove after animation completes
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

// Show error message
function showError(message) {
    hideLoading();
    
    const errorContainer = document.getElementById('app-error');
    const errorMessage = document.getElementById('error-message');
    
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'flex';
        
        // Add retry button handler
        document.getElementById('error-retry').addEventListener('click', () => {
            window.location.reload();
        });
    } else {
        // Fallback to alert if error container not found
        alert(`Error: ${message}`);
    }
}

// Export global functions
window.navigateToView = navigateToView;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
