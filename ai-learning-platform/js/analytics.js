/**
 * Analytics module for tracking user interaction with the platform
 * This is strictly for enhancing user experience and improving content
 * No personal data is collected or sent to external servers
 */

// Analytics data stored locally
let analyticsData = {
    lessonViews: {},
    timeSpent: {},
    codeSubmissions: 0,
    correctSubmissions: 0,
    hintRequests: 0,
    sessionsCount: 0,
    lastSessionDate: null,
    averageCompletionTime: {}
};

// Initialize analytics
function initAnalytics() {
    // Load previous analytics data if available
    const savedData = localStorage.getItem('ai_learning_analytics');
    if (savedData) {
        try {
            analyticsData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error parsing analytics data:', e);
        }
    }
    
    // Record session start
    analyticsData.sessionsCount++;
    analyticsData.lastSessionDate = new Date().toISOString();
    
    // Save updated analytics
    saveAnalytics();
    
    // Send initial tracking info
    trackEvent('session_start', {
        session_count: analyticsData.sessionsCount
    });
    
    // Set up unload event to track session duration
    let sessionStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        trackEvent('session_end', { 
            duration_seconds: sessionDuration 
        });
    });
}

// Track when a lesson is viewed
function trackLessonView(lessonId) {
    if (!lessonId) return;
    
    // Initialize if this is the first view for this lesson
    if (!analyticsData.lessonViews[lessonId]) {
        analyticsData.lessonViews[lessonId] = 0;
        analyticsData.timeSpent[lessonId] = 0;
    }
    
    // Increment view count
    analyticsData.lessonViews[lessonId]++;
    
    // Start timing for this lesson
    startLessonTimer(lessonId);
    
    // Save updated analytics
    saveAnalytics();
    
    // Send tracking event
    trackEvent('lesson_view', {
        lesson_id: lessonId,
        view_count: analyticsData.lessonViews[lessonId]
    });
}

// Track time spent on lessons
let lessonStartTime = null;
let currentLessonId = null;

function startLessonTimer(lessonId) {
    // If we were timing a different lesson, record the time spent there first
    if (currentLessonId && currentLessonId !== lessonId && lessonStartTime) {
        const timeSpent = Math.round((Date.now() - lessonStartTime) / 1000);
        analyticsData.timeSpent[currentLessonId] += timeSpent;
    }
    
    // Start timing this lesson
    currentLessonId = lessonId;
    lessonStartTime = Date.now();
}

// Record completion time for a lesson
function trackLessonCompletion(lessonId, timeInSeconds) {
    if (!lessonId) return;
    
    // Initialize if first completion
    if (!analyticsData.averageCompletionTime[lessonId]) {
        analyticsData.averageCompletionTime[lessonId] = {
            count: 0,
            totalTime: 0,
            average: 0
        };
    }
    
    const data = analyticsData.averageCompletionTime[lessonId];
    data.count++;
    data.totalTime += timeInSeconds;
    data.average = Math.round(data.totalTime / data.count);
    
    // Save updated analytics
    saveAnalytics();
    
    // Send tracking event
    trackEvent('lesson_complete', {
        lesson_id: lessonId,
        time_seconds: timeInSeconds
    });
}

// Track code submissions
function trackCodeSubmission(lessonId, isCorrect) {
    analyticsData.codeSubmissions++;
    
    if (isCorrect) {
        analyticsData.correctSubmissions++;
    }
    
    // Save updated analytics
    saveAnalytics();
    
    // Send tracking event
    trackEvent('code_submission', {
        lesson_id: lessonId,
        is_correct: isCorrect,
        submission_count: analyticsData.codeSubmissions
    });
}

// Track hint requests
function trackHintRequest(lessonId) {
    analyticsData.hintRequests++;
    
    // Save updated analytics
    saveAnalytics();
    
    // Send tracking event
    trackEvent('hint_request', {
        lesson_id: lessonId,
        hint_count: analyticsData.hintRequests
    });
}

// Save analytics data to localStorage
function saveAnalytics() {
    try {
        localStorage.setItem('ai_learning_analytics', JSON.stringify(analyticsData));
    } catch (e) {
        console.error('Error saving analytics data:', e);
    }
}

// Send analytics event to tracking service (if user has consented)
function trackEvent(eventName, eventData = {}) {
    // Check if user has consented to analytics
    if (!userState?.preferences?.analyticsConsent) {
        return;
    }
    
    // In a real application, you would send this data to your analytics service
    // For this example, we'll just log it to the console
    console.log('ANALYTICS EVENT:', eventName, eventData);
    
    // Example of sending to a hypothetical analytics endpoint:
    /*
    fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            userId: userState.anonymousId || 'anonymous'
        })
    }).catch(err => console.error('Analytics error:', err));
    */
}

// Generate analytics report
function generateAnalyticsReport() {
    // Calculate total time spent learning (in minutes)
    const totalTimeSpent = Object.values(analyticsData.timeSpent)
        .reduce((total, time) => total + time, 0) / 60;
    
    // Calculate success rate
    const successRate = analyticsData.codeSubmissions > 0 
        ? ((analyticsData.correctSubmissions / analyticsData.codeSubmissions) * 100).toFixed(1) 
        : 0;
    
    // Find most viewed lesson
    let mostViewedLesson = null;
    let mostViews = 0;
    
    Object.entries(analyticsData.lessonViews).forEach(([lessonId, views]) => {
        if (views > mostViews) {
            mostViews = views;
            mostViewedLesson = lessonId;
        }
    });
    
    // Get most viewed lesson title
    let mostViewedTitle = 'None';
    if (mostViewedLesson) {
        const lesson = lessons.find(l => l.id === mostViewedLesson);
        if (lesson) {
            mostViewedTitle = lesson.title;
        }
    }
    
    // Create report HTML
    const report = document.createElement('div');
    report.className = 'analytics-report';
    report.innerHTML = `
        <h3>Your Learning Stats</h3>
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-value">${totalTimeSpent.toFixed(1)}</div>
                <div class="stat-label">Minutes Learning</div>
            </div>
            <div class="stat">
                <div class="stat-value">${analyticsData.correctSubmissions}</div>
                <div class="stat-label">Exercises Completed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${successRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat">
                <div class="stat-value">${analyticsData.sessionsCount}</div>
                <div class="stat-label">Learning Sessions</div>
            </div>
        </div>
        <div class="most-viewed">
            <p>Most studied: <strong>${mostViewedTitle}</strong> (${mostViews} views)</p>
        </div>
        <p class="analytics-note">These stats are stored locally and help you track your progress.</p>
    `;
    
    return report;
}

// Reset analytics data (for privacy or testing)
function resetAnalytics() {
    analyticsData = {
        lessonViews: {},
        timeSpent: {},
        codeSubmissions: 0,
        correctSubmissions: 0,
        hintRequests: 0,
        sessionsCount: 0,
        lastSessionDate: null,
        averageCompletionTime: {}
    };
    
    saveAnalytics();
}

// Export analytics functions
window.initAnalytics = initAnalytics;
window.trackLessonView = trackLessonView;
window.trackLessonCompletion = trackLessonCompletion;
window.trackCodeSubmission = trackCodeSubmission;
window.trackHintRequest = trackHintRequest;
window.generateAnalyticsReport = generateAnalyticsReport;
window.resetAnalytics = resetAnalytics;
