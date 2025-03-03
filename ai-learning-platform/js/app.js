/**
 * Main application initialization and coordination
 */

import { loadLesson } from './lessons.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading indicator
    showLoading();

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
        await initializeConfig();
        await initializeUserState();
        await initializeLessons();
        await initializeUIComponents();
        await initializeNavigation();
        await initializeAnalytics();
        await initializeDashboard();
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

// Initialize user state
async function initializeUserState() {
    console.log('Loading user state...');
    await initUserState();
}

// Initialize lessons
async function initializeLessons() {
    console.log('Loading lessons...');
    await initLessons();
}

// Initialize UI components
async function initializeUIComponents() {
    console.log('Setting up UI...');
    initCodeEditor();
    await setupUIComponents();
}

// Initialize navigation
async function initializeNavigation() {
    console.log('Setting up navigation...');
    setupNavigation();
}

// Initialize analytics
async function initializeAnalytics() {
    if (userState.preferences?.analyticsConsent !== false) {
        console.log('Initializing analytics...');
        initAnalytics();
    }
}

// Initialize dashboard
async function initializeDashboard() {
    console.log('Initializing dashboard...');
    initDashboard();
}

// Load initial content based on user state
async function loadInitialContent() {
    if (userState.currentLesson) {
        const lessonView = document.querySelector('[data-view="lessons"]');
        if (lessonView) {
            showView('lessons');
            loadLesson(userState.currentLesson);
        }
    } else {
        showView('welcome');
    }
}

// Set up UI components not handled by other modules
async function setupUIComponents() {
    return new Promise(resolve => {
        const preferredTheme = localStorage.getItem('theme') || 
                              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', preferredTheme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
        
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
    const navLinks = document.querySelectorAll('[data-nav]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-nav');
            navigateToView(view);
        });
    });
    
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            showView(event.state.view, false);
        }
    });
    
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateToView(hash);
    }
}

// Navigate to a view
function navigateToView(view) {
    showView(view);
    const url = `#${view}`;
    history.pushState({ view: view }, '', url);
}

// Show a specific view, hiding others
function showView(viewId, updateUserState = true) {
    const views = document.querySelectorAll('[data-view]');
    views.forEach(v => v.classList.add('hidden'));
    
    const viewToShow = document.querySelector(`[data-view="${viewId}"]`);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
        
        const navLinks = document.querySelectorAll('[data-nav]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-nav') === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        if (updateUserState && typeof saveUserState === 'function') {
            saveUserState({ lastView: viewId });
        }
        
        if (typeof trackEvent === 'function') {
            trackEvent('view_changed', { view: viewId });
        }
        
        document.body.classList.remove('menu-open');
    }
}

// Handle daily login check
function checkDailyLogin() {
    const today = new Date().toISOString().split('T')[0];
    
    if (!userState.lastLoginDate || userState.lastLoginDate !== today) {
        let isConsecutiveDay = false;
        
        if (userState.lastLoginDate) {
            const lastDate = new Date(userState.lastLoginDate);
            const currentDate = new Date();
            
            lastDate.setDate(lastDate.getDate() + 1);
            isConsecutiveDay = lastDate.toISOString().split('T')[0] === today;
        }
        
        if (isConsecutiveDay) {
            userState.streak = (userState.streak || 0) + 1;
        } else {
            userState.streak = 1;
        }
        
        userState.lastLoginDate = today;
        saveUserState();
        
        setTimeout(() => {
            showDailyReward(userState.streak);
        }, 1500);
    }
}

// Show daily reward popup
function showDailyReward(streakDays) {
    let reward = 5;
    
    if (streakDays > 1) {
        reward += Math.min(streakDays, 5);
    }
    
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
    
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
    
    document.getElementById('claim-reward').addEventListener('click', () => {
        awardCoins(reward, 'daily login reward');
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

// Show loading indicator
function showLoading() {
    let loader = document.getElementById('app-loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'app-loader';
        loader.innerHTML = '<div class="loader-spinner"></div><p>Loading...</p>';
        document.body.appendChild(loader);
    }
    
    loader.style.display = 'flex';
}

// Hide loading indicator
function hideLoading() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    hideLoading();
    
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
        
        document.getElementById('error-retry').addEventListener('click', () => {
            errorElement.style.display = 'none';
            initializeApplication();
        });
    }
    
    document.getElementById('error-message').textContent = message;
    errorElement.style.display = 'flex';
}

// Export global functions
window.navigateToView = navigateToView;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
