/**
 * Dashboard module for the AI Learning Platform
 * Shows user progress, statistics and learning path visualization
 */

import { getUserState } from './state.js';

// Initialize the dashboard when the module is loaded
let initialized = false;

/**
 * Initialize the dashboard view
 */
export function initDashboard() {
    if (initialized) return;
    initialized = true;

    createDashboardDOM();
    updateDashboardStats();
    
    // Listen for state changes to update dashboard stats
    window.addEventListener('state-updated', updateDashboardStats);
    
    console.log('Dashboard initialized');
}

/**
 * Create the dashboard DOM elements
 */
function createDashboardDOM() {
    // Get the content element where we'll add the dashboard
    const content = document.querySelector('.content');
    
    if (!content) {
        console.error('Content element not found');
        return;
    }
    
    // Create dashboard container
    const dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'dashboard-container';
    dashboardContainer.className = 'dashboard-container hidden';
    dashboardContainer.setAttribute('data-view', 'dashboard');
    dashboardContainer.setAttribute('aria-label', 'User dashboard and progress');
    dashboardContainer.setAttribute('role', 'region');
    
    // Create dashboard content
    dashboardContainer.innerHTML = `
        <h2>Your Learning Dashboard</h2>
        
        <div class="dashboard-grid">
            <div class="dashboard-card overview-card">
                <h3><i class="fas fa-tachometer-alt" aria-hidden="true"></i> Overview</h3>
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value" id="dashboard-completed-lessons">0</div>
                        <div class="stat-label">Lessons Completed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="dashboard-total-coins">0</div>
                        <div class="stat-label">Coins Earned</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="dashboard-streak">0</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="dashboard-achievements">0</div>
                        <div class="stat-label">Achievements</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card progress-card">
                <h3><i class="fas fa-chart-line" aria-hidden="true"></i> Progress</h3>
                <div class="progress-stats">
                    <div class="progress-container">
                        <div class="progress-bar" id="dashboard-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <div class="progress-percentage">
                        <span id="dashboard-progress-percent">0</span>% Complete
                    </div>
                </div>
                
                <div class="category-progress">
                    <h4>Progress by Category</h4>
                    <div id="category-progress-container">
                        <!-- Will be populated dynamically -->
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card recent-activity">
                <h3><i class="fas fa-history" aria-hidden="true"></i> Recent Activity</h3>
                <ul id="activity-list" class="activity-list">
                    <!-- Will be populated dynamically -->
                </ul>
            </div>
            
            <div class="dashboard-card recommendations">
                <h3><i class="fas fa-lightbulb" aria-hidden="true"></i> Recommended Next</h3>
                <div id="recommendations-container">
                    <!-- Will be populated dynamically -->
                </div>
            </div>
        </div>
        
        <div class="learning-path">
            <h3>Your Learning Path</h3>
            <div class="learning-path-visualization" id="learning-path-viz">
                <!-- Will contain SVG visualization -->
            </div>
        </div>
    `;
    
    // Add dashboard to content
    content.appendChild(dashboardContainer);
    
    // Add CSS for dashboard
    addDashboardStyles();
}

/**
 * Update dashboard statistics based on current user state
 */
function updateDashboardStats() {
    // Get current user state
    const state = getUserState();
    
    if (!state) {
        console.error('User state not available');
        return;
    }
    
    // Update overview stats
    document.getElementById('dashboard-completed-lessons').textContent = state.completedLessons.length || 0;
    document.getElementById('dashboard-total-coins').textContent = state.coins || 0;
    document.getElementById('dashboard-streak').textContent = state.streak || 0;
    document.getElementById('dashboard-achievements').textContent = state.achievements?.length || 0;
    
    // Update progress bar
    const progressPercent = calculateOverallProgress(state);
    const progressBar = document.getElementById('dashboard-progress-bar');
    progressBar.style.width = `${progressPercent}%`;
    progressBar.setAttribute('aria-valuenow', progressPercent);
    document.getElementById('dashboard-progress-percent').textContent = progressPercent;
    
    // Update category progress
    updateCategoryProgress(state);
    
    // Update recent activity
    updateRecentActivity(state);
    
    // Update recommendations
    updateRecommendations(state);
    
    // Update learning path visualization
    updateLearningPathVisualization(state);
}

/**
 * Calculate overall progress percentage
 * @param {Object} state - User state
 * @returns {number} Progress percentage (0-100)
 */
function calculateOverallProgress(state) {
    // Get all available lessons
    if (!window.lessons || !Array.isArray(window.lessons)) {
        return 0;
    }
    
    const totalLessons = window.lessons.length;
    if (totalLessons === 0) return 0;
    
    const completedLessons = state.completedLessons?.length || 0;
    return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Update category progress section
 * @param {Object} state - User state
 */
function updateCategoryProgress(state) {
    const container = document.getElementById('category-progress-container');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Get all lessons
    if (!window.lessons || !Array.isArray(window.lessons)) {
        container.innerHTML = '<p>No category data available</p>';
        return;
    }
    
    // Get categories and calculate progress
    const categories = {};
    window.lessons.forEach(lesson => {
        const category = lesson.category || 'Uncategorized';
        
        if (!categories[category]) {
            categories[category] = {
                total: 0,
                completed: 0
            };
        }
        
        categories[category].total++;
        
        if (state.completedLessons?.includes(lesson.id)) {
            categories[category].completed++;
        }
    });
    
    // Create progress bars for each category
    Object.entries(categories).forEach(([category, data]) => {
        const percent = Math.round((data.completed / data.total) * 100);
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-item';
        categoryElement.innerHTML = `
            <div class="category-name">${category}</div>
            <div class="category-progress-container">
                <div class="category-progress-bar" style="width: ${percent}%"></div>
            </div>
            <div class="category-percent">${percent}%</div>
            <div class="category-fraction">${data.completed}/${data.total}</div>
        `;
        
        container.appendChild(categoryElement);
    });
}

/**
 * Update recent activity list
 * @param {Object} state - User state
 */
function updateRecentActivity(state) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // Clear list
    activityList.innerHTML = '';
    
    // TODO: In future versions, activity should be stored in state.activities
    // For now, just show completed lessons as activity
    
    const recentCompletions = state.completedLessons?.slice(0, 5) || [];
    
    if (recentCompletions.length === 0) {
        activityList.innerHTML = '<li class="no-activity">No recent activity</li>';
        return;
    }
    
    // Get lesson details for the completed lessons
    recentCompletions.forEach(lessonId => {
        const lesson = window.lessons?.find(l => l.id === lessonId);
        if (!lesson) return;
        
        const listItem = document.createElement('li');
        listItem.className = 'activity-item';
        listItem.innerHTML = `
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            <div class="activity-content">
                <div class="activity-title">Completed "${lesson.title}"</div>
                <div class="activity-date">Recently</div>
            </div>
        `;
        
        activityList.appendChild(listItem);
    });
}

/**
 * Update recommendations section
 * @param {Object} state - User state
 */
function updateRecommendations(state) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Find uncompleted lessons that the user has enough coins for
    const uncompletedLessons = window.lessons?.filter(lesson => 
        !state.completedLessons?.includes(lesson.id) && 
        (lesson.requiredCoins || 0) <= state.coins
    ) || [];
    
    if (uncompletedLessons.length === 0) {
        container.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    // Show up to 3 recommended lessons
    const recommendedLessons = uncompletedLessons.slice(0, 3);
    
    recommendedLessons.forEach(lesson => {
        const lessonElement = document.createElement('div');
        lessonElement.className = 'recommended-lesson';
        lessonElement.innerHTML = `
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-meta">
                ${lesson.category ? `<span class="lesson-category">${lesson.category}</span>` : ''}
                ${lesson.difficulty ? `<span class="lesson-difficulty">${lesson.difficulty}</span>` : ''}
            </div>
            <button class="start-lesson-btn" data-lesson-id="${lesson.id}">Start Lesson</button>
        `;
        
        // Add click event to start lesson button
        lessonElement.querySelector('.start-lesson-btn').addEventListener('click', () => {
            // Navigate to lesson
            window.location.hash = `lessons/${lesson.id}`;
        });
        
        container.appendChild(lessonElement);
    });
}

/**
 * Update learning path visualization
 * @param {Object} state - User state
 */
function updateLearningPathVisualization(state) {
    const container = document.getElementById('learning-path-viz');
    if (!container) return;
    
    // For now, just use a placeholder
    // In a real implementation, this would be a more complex visualization
    container.innerHTML = '<p class="placeholder">Learning path visualization will be implemented in a future update.</p>';
}

/**
 * Add CSS styles for dashboard
 */
function addDashboardStyles() {
    // Check if styles are already added
    if (document.getElementById('dashboard-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dashboard-styles';
    
    styleElement.textContent = `
        .dashboard-container {
            padding: 20px;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .dashboard-card {
            background: var(--white, #ffffff);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        
        .dashboard-card h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary-color, #6200ee);
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 10px;
            background-color: var(--surface-color, #f5f5f5);
            border-radius: 8px;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color, #6200ee);
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-secondary, #666);
        }
        
        .progress-stats {
            margin-bottom: 20px;
        }
        
        .progress-container {
            height: 10px;
            background-color: var(--surface-color, #f5f5f5);
            border-radius: 5px;
            margin-bottom: 8px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background-color: var(--primary-color, #6200ee);
            border-radius: 5px;
            transition: width 0.5s ease;
        }
        
        .progress-percentage {
            text-align: right;
            font-size: 0.9rem;
            color: var(--text-secondary, #666);
        }
        
        .category-progress {
            margin-top: 20px;
        }
        
        .category-progress h4 {
            margin-bottom: 10px;
            font-size: 1rem;
            color: var(--text-primary, #333);
        }
        
        .category-item {
            display: grid;
            grid-template-columns: 120px 1fr 60px 60px;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .category-name {
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .category-progress-container {
            height: 8px;
            background-color: var(--surface-color, #f5f5f5);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .category-progress-bar {
            height: 100%;
            background-color: var(--primary-color, #6200ee);
            border-radius: 4px;
        }
        
        .category-percent, .category-fraction {
            font-size: 0.8rem;
            color: var(--text-secondary, #666);
            text-align: right;
        }
        
        .activity-list {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }
        
        .activity-item {
            display: flex;
            gap: 10px;
            padding: 10px;
            border-bottom: 1px solid var(--border-color, #e0e0e0);
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-item i {
            color: var(--success, #2ecc71);
            margin-top: 3px;
        }
        
        .activity-title {
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .activity-date {
            font-size: 0.8rem;
            color: var(--text-secondary, #666);
        }
        
        .no-activity {
            color: var(--text-secondary, #666);
            font-style: italic;
            padding: 10px;
        }
        
        .recommended-lesson {
            background-color: var(--surface-color, #f5f5f5);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .lesson-title {
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .lesson-meta {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .lesson-category {
            background-color: var(--primary-color, #6200ee);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        
        .lesson-difficulty {
            background-color: var(--info, #3498db);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8rem;
        }
        
        .start-lesson-btn {
            background-color: var(--primary-color, #6200ee);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s ease;
        }
        
        .start-lesson-btn:hover {
            background-color: var(--primary-dark, #3700b3);
        }
        
        .learning-path {
            margin-top: 20px;
        }
        
        .learning-path h3 {
            margin-bottom: 15px;
            color: var(--primary-color, #6200ee);
        }
        
        .learning-path-visualization {
            background-color: var(--white, #ffffff);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .placeholder {
            color: var(--text-secondary, #666);
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
            
            .category-item {
                grid-template-columns: 100px 1fr 50px 50px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Make module available
export default {
    initDashboard
};
