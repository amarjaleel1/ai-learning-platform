/**
 * Dashboard functionality to display user progress and stats
 */

// Initialize the dashboard
function initDashboard() {
    document.addEventListener('DOMContentLoaded', () => {
        // Set up dashboard link if it exists
        const dashboardLink = document.querySelector('[data-nav="dashboard"]');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                showDashboard();
            });
        }
    });
}

// Show the dashboard view
function showDashboard() {
    // Navigate to dashboard view if router exists
    if (typeof navigateTo === 'function') {
        navigateTo('dashboard');
    } else {
        // Fallback to showing the dashboard directly
        const views = document.querySelectorAll('[data-view]');
        views.forEach(view => view.classList.add('hidden'));
        
        const dashboardView = document.querySelector('[data-view="dashboard"]');
        if (dashboardView) {
            dashboardView.classList.remove('hidden');
        }
    }
    
    // Update dashboard content
    updateDashboard();
}

// Update dashboard with user data
function updateDashboard() {
    const dashboardContainer = document.getElementById('dashboard-container');
    if (!dashboardContainer) return;
    
    // Ensure user state exists
    if (!userState) return;
    
    // Create dashboard content
    dashboardContainer.innerHTML = `
        <h2>Your Learning Dashboard</h2>
        
        <div class="dashboard-grid">
            <div class="dashboard-card summary-card">
                <h3>Progress Summary</h3>
                <div class="progress-overview">
                    <div class="circular-progress">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path class="circle"
                                stroke-dasharray="${calculateProgressPercentage()}, 100"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" class="percentage">${calculateProgressPercentage()}%</text>
                        </svg>
                    </div>
                    <div class="progress-stats">
                        <p><strong>${userState.completedLessons ? userState.completedLessons.length : 0}</strong> lessons completed</p>
                        <p><strong>${lessons ? lessons.length : 0}</strong> total lessons</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card stats-card">
                <h3>Your Stats</h3>
                <div class="stats-container">
                    <div class="stat-item">
                        <i class="fas fa-coins"></i>
                        <div class="stat-details">
                            <span class="stat-value">${userState.coins || 0}</span>
                            <span class="stat-label">Coins Earned</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-fire"></i>
                        <div class="stat-details">
                            <span class="stat-value">${userState.streak || 0}</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-trophy"></i>
                        <div class="stat-details">
                            <span class="stat-value">${userState.achievements ? userState.achievements.length : 0}</span>
                            <span class="stat-label">Achievements</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card recent-lessons">
                <h3>Recently Completed Lessons</h3>
                <div class="recent-lessons-list">
                    ${generateRecentLessonsList()}
                </div>
            </div>
            
            <div class="dashboard-card recommendations">
                <h3>Recommended Next Steps</h3>
                <div class="recommendations-list">
                    ${generateRecommendationsList()}
                </div>
            </div>
        </div>
        
        <div class="dashboard-section achievements-section">
            <h3>Your Achievements</h3>
            <div id="achievements-list" class="achievements-grid">
                ${generateAchievementsList()}
            </div>
        </div>
        
        <div class="dashboard-section analytics-section">
            <h3>Learning Analytics</h3>
            <div id="analytics-container">
                ${generateAnalytics()}
            </div>
        </div>
    `;
    
    // Set up event listeners for dashboard elements
    setupDashboardEventListeners();
}

// Calculate progress percentage
function calculateProgressPercentage() {
    if (!userState || !lessons) return 0;
    
    const completedCount = userState.completedLessons ? userState.completedLessons.length : 0;
    const totalLessons = lessons.length;
    
    if (totalLessons === 0) return 0;
    
    return Math.round((completedCount / totalLessons) * 100);
}

// Generate HTML for recent lessons list
function generateRecentLessonsList() {
    if (!userState || !userState.completedLessons || !lessons) {
        return '<p>No completed lessons yet.</p>';
    }
    
    // Get completed lessons with most recent first
    const completedLessons = [...userState.completedLessons];
    const recentLessons = completedLessons.slice(-3).reverse(); // Get last 3
    
    if (recentLessons.length === 0) {
        return '<p>No completed lessons yet.</p>';
    }
    
    let html = '<ul class="lessons-list">';
    
    recentLessons.forEach(lessonId => {
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
            html += `
                <li class="lesson-item completed" data-lesson-id="${lesson.id}">
                    <i class="fas fa-check-circle"></i>
                    <span>${lesson.title}</span>
                </li>
            `;
        }
    });
    
    html += '</ul>';
    
    if (completedLessons.length > 3) {
        html += `<p class="view-all"><a href="#" id="view-all-completed">View all ${completedLessons.length} completed lessons</a></p>`;
    }
    
    return html;
}

// Generate HTML for recommendations
function generateRecommendationsList() {
    if (!userState || !lessons) {
        return '<p>Start your learning journey!</p>';
    }
    
    // Find uncompleted lessons
    const completedLessons = userState.completedLessons || [];
    const uncompletedLessons = lessons.filter(lesson => 
        !completedLessons.includes(lesson.id) && 
        (lesson.requiredCoins || 0) <= (userState.coins || 0)
    );
    
    if (uncompletedLessons.length === 0) {
        return '<p>You\'ve completed all available lessons! Check back soon for more content.</p>';
    }
    
    // Take first 3 uncompleted lessons as recommendations
    const recommendations = uncompletedLessons.slice(0, 3);
    
    let html = '<ul class="recommendations-list">';
    
    recommendations.forEach(lesson => {
        html += `
            <li class="recommendation-item" data-lesson-id="${lesson.id}">
                <div class="recommendation-content">
                    <h4>${lesson.title}</h4>
                    <p>${lesson.shortDescription || 'Continue your learning journey.'}</p>
                </div>
                <button class="start-lesson-btn" data-lesson-id="${lesson.id}">Start</button>
            </li>
        `;
    });
    
    html += '</ul>';
    
    return html;
}

// Generate HTML for achievements list
function generateAchievementsList() {
    if (!userState || !userState.achievements || userState.achievements.length === 0) {
        return '<p>No achievements unlocked yet. Keep learning to earn achievements!</p>';
    }
    
    let html = '<div class="achievements-grid">';
    
    // Ensure achievements array exists
    if (typeof achievements === 'undefined') {
        return '<p>Loading achievements...</p>';
    }
    
    // Get unlocked achievements
    const unlockedAchievements = userState.achievements.map(id => 
        achievements.find(a => a.id === id)
    ).filter(Boolean);
    
    unlockedAchievements.forEach(achievement => {
        html += `
            <div class="achievement-item">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-details">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add progress stat
    const totalAchievements = achievements.length;
    const unlockedCount = unlockedAchievements.length;
    const percentage = Math.round((unlockedCount / totalAchievements) * 100);
    
    html += `
        <div class="achievements-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <p>${unlockedCount}/${totalAchievements} achievements (${percentage}%)</p>
        </div>
    `;
    
    return html;
}

// Generate HTML for analytics
function generateAnalytics() {
    // If the generateAnalyticsReport function exists, use it
    if (typeof generateAnalyticsReport === 'function') {
        const reportElement = generateAnalyticsReport();
        return reportElement.outerHTML;
    }
    
    // Otherwise create a simple analytics display
    let html = '<div class="analytics-content">';
    
    // Calculate some basic stats
    const completedLessons = userState.completedLessons ? userState.completedLessons.length : 0;
    const joinDate = userState.createdAt ? new Date(userState.createdAt) : new Date();
    const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24)) || 1;
    const lessonsPerDay = (completedLessons / daysSinceJoin).toFixed(2);
    
    html += `
        <div class="analytics-grid">
            <div class="analytics-card">
                <div class="analytics-value">${completedLessons}</div>
                <div class="analytics-label">Lessons Completed</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-value">${daysSinceJoin}</div>
                <div class="analytics-label">Days Learning</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-value">${lessonsPerDay}</div>
                <div class="analytics-label">Avg. Lessons/Day</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-value">${userState.streak || 0}</div>
                <div class="analytics-label">Current Streak</div>
            </div>
        </div>
    `;
    
    html += '</div>';
    
    return html;
}

// Set up event listeners for dashboard elements
function setupDashboardEventListeners() {
    // Start lesson buttons
    document.querySelectorAll('.start-lesson-btn').forEach(button => {
        button.addEventListener('click', () => {
            const lessonId = button.getAttribute('data-lesson-id');
            if (lessonId && typeof loadLesson === 'function') {
                // Navigate to lessons view and load the lesson
                if (typeof navigateTo === 'function') {
                    navigateTo('lessons', true, { lessonId });
                } else {
                    loadLesson(lessonId);
                }
            }
        });
    });
    
    // Recent lesson items
    document.querySelectorAll('.lesson-item[data-lesson-id]').forEach(item => {
        item.addEventListener('click', () => {
            const lessonId = item.getAttribute('data-lesson-id');
            if (lessonId && typeof loadLesson === 'function') {
                // Navigate to lessons view and load the lesson
                if (typeof navigateTo === 'function') {
                    navigateTo('lessons', true, { lessonId });
                } else {
                    loadLesson(lessonId);
                }
            }
        });
    });
    
    // View all completed lessons
    const viewAllBtn = document.getElementById('view-all-completed');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showAllCompletedLessons();
        });
    }
}

// Show modal with all completed lessons
function showAllCompletedLessons() {
    if (!userState || !userState.completedLessons || !lessons) return;
    
    const completedLessons = userState.completedLessons.map(id => 
        lessons.find(l => l.id === id)
    ).filter(Boolean);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal completed-lessons-modal';
    
    let html = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Completed Lessons</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
    `;
    
    if (completedLessons.length === 0) {
        html += '<p>You haven\'t completed any lessons yet.</p>';
    } else {
        html += '<ul class="completed-lessons-list">';
        completedLessons.forEach(lesson => {
            html += `
                <li class="completed-lesson-item" data-lesson-id="${lesson.id}">
                    <i class="fas fa-check-circle"></i>
                    <span>${lesson.title}</span>
                    <button class="review-lesson-btn" data-lesson-id="${lesson.id}">Review</button>
                </li>
            `;
        });
        html += '</ul>';
    }
    
    html += `
            </div>
            <div class="modal-footer">
                <button class="close-btn">Close</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    // Add modal event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Add review button event listeners
    modal.querySelectorAll('.review-lesson-btn').forEach(button => {
        button.addEventListener('click', () => {
            const lessonId = button.getAttribute('data-lesson-id');
            if (lessonId && typeof loadLesson === 'function') {
                // Navigate to lessons view and load the lesson
                if (typeof navigateTo === 'function') {
                    navigateTo('lessons', true, { lessonId });
                } else {
                    loadLesson(lessonId);
                }
                document.body.removeChild(modal);
            }
        });
    });
}

// Export dashboard functions
window.initDashboard = initDashboard;
window.updateDashboard = updateDashboard;
window.showDashboard = showDashboard;
