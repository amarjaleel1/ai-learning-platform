/**
 * Lessons module for AI Learning Platform
 * Handles lesson loading, display, and navigation
 */

import { getUserState, saveUserState, updateCoins } from './state.js';

// Current lesson state
let currentLessonId = null;
let lessons = [];
let categories = {};

/**
 * Initialize lessons module
 * @returns {Promise} - Promise that resolves when lessons are initialized
 */
export function initLessons() {
    return new Promise((resolve, reject) => {
        try {
            // Load lesson data
            loadLessonData()
                .then(() => {
                    // Setup lesson navigation
                    setupLessonNavigation();
                    
                    // Process current URL to load correct lesson
                    processLessonUrl();
                    
                    resolve();
                })
                .catch(error => {
                    console.error("Error loading lesson data:", error);
                    reject(error);
                });
        } catch (error) {
            console.error("Error initializing lessons:", error);
            reject(error);
        }
    });
}

/**
 * Load all lesson data
 * @returns {Promise} - Promise that resolves when lessons are loaded
 */
function loadLessonData() {
    return new Promise((resolve, reject) => {
        try {
            // For now, we'll use the global window.lessons array
            // Eventually, this should be replaced with a fetch call to load from API
            if (window.lessons && Array.isArray(window.lessons)) {
                lessons = window.lessons;
                
                // Try to load additional lessons if they exist
                if (typeof window.addAdditionalLessons === 'function') {
                    window.addAdditionalLessons();
                    lessons = window.lessons; // Update with additional lessons
                }
                
                // Process lesson categories
                processCategoryData();
                
                // Populate lesson list
                populateLessonList();
                
                resolve();
            } else {
                reject(new Error("No lesson data found"));
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Process lesson categories
 */
function processCategoryData() {
    // Create category map
    categories = {};
    
    lessons.forEach(lesson => {
        const category = lesson.category || 'Uncategorized';
        
        if (!categories[category]) {
            categories[category] = [];
        }
        
        categories[category].push(lesson);
    });
}

/**
 * Setup lesson navigation handlers
 */
function setupLessonNavigation() {
    // Handle clicks on lesson items
    document.getElementById('lesson-list').addEventListener('click', function(event) {
        const lessonItem = event.target.closest('.lesson-item');
        
        if (lessonItem) {
            const lessonId = lessonItem.getAttribute('data-lesson-id');
            
            if (lessonId && !lessonItem.classList.contains('locked')) {
                navigateToLesson(lessonId);
            } else if (lessonItem.classList.contains('locked')) {
                showLessonLockedMessage(lessonId);
            }
        }
    });
}

/**
 * Show message when trying to access a locked lesson
 * @param {string} lessonId - The ID of the locked lesson
 */
function showLessonLockedMessage(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const userCoins = getUserState().coins || 0;
    const requiredCoins = lesson.requiredCoins || 0;
    const coinsNeeded = requiredCoins - userCoins;
    
    if (typeof window.showNotification === 'function') {
        window.showNotification(
            `This lesson requires ${requiredCoins} coins. You need ${coinsNeeded} more coins to unlock it.`,
            'warning'
        );
        
        // Add shake animation to coins display
        const coinDisplay = document.getElementById('coin-display');
        if (coinDisplay) {
            coinDisplay.classList.add('coin-shortage');
            setTimeout(() => {
                coinDisplay.classList.remove('coin-shortage');
            }, 1000);
        }
    } else {
        alert(`This lesson requires ${requiredCoins} coins. You need ${coinsNeeded} more coins to unlock it.`);
    }
}

/**
 * Navigate to a specific lesson
 * @param {string} lessonId - The ID of the lesson to navigate to
 */
export function navigateToLesson(lessonId) {
    // Update URL
    window.location.hash = `lessons/${lessonId}`;
}

/**
 * Process URL to load correct lesson
 */
function processLessonUrl() {
    const hash = window.location.hash.substring(1);
    
    if (hash.startsWith('lessons/')) {
        const lessonId = hash.split('/')[1];
        if (lessonId) {
            loadLesson(lessonId);
        }
    }
}

/**
 * Populate the lesson list in the sidebar
 */
function populateLessonList() {
    const lessonListElement = document.getElementById('lesson-list');
    if (!lessonListElement) return;
    
    // Clear existing lessons
    lessonListElement.innerHTML = '';
    
    // Get user state to check completed lessons and available coins
    const userState = getUserState();
    const completedLessons = userState.completedLessons || [];
    const userCoins = userState.coins || 0;
    
    // Create lesson list, grouped by category
    Object.entries(categories).forEach(([category, categoryLessons]) => {
        // Add category header
        const categoryHeader = document.createElement('li');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = category;
        lessonListElement.appendChild(categoryHeader);
        
        // Add lessons in this category
        categoryLessons.forEach((lesson, index) => {
            const lessonItem = document.createElement('li');
            lessonItem.className = 'lesson-item';
            lessonItem.setAttribute('data-lesson-id', lesson.id);
            
            // Mark as completed if in user's completed list
            if (completedLessons.includes(lesson.id)) {
                lessonItem.classList.add('completed');
            }
            
            // Mark as locked if user doesn't have enough coins
            if (lesson.requiredCoins && userCoins < lesson.requiredCoins) {
                lessonItem.classList.add('locked');
                
                // Add coin requirement
                const coinRequirement = document.createElement('span');
                coinRequirement.className = 'coin-requirement';
                coinRequirement.innerHTML = `<i class="fas fa-coins"></i> ${lesson.requiredCoins}`;
                lessonItem.appendChild(coinRequirement);
            }
            
            // Add lesson title
            lessonItem.appendChild(document.createTextNode(lesson.title));
            
            // Add to list
            lessonListElement.appendChild(lessonItem);
        });
    });
}

/**
 * Load and display a specific lesson
 * @param {string} lessonId - The ID of the lesson to load
 */
export function loadLesson(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
        console.error(`Lesson ${lessonId} not found`);
        return;
    }
    
    // Check if lesson is locked
    const userState = getUserState();
    const userCoins = userState.coins || 0;
    
    if (lesson.requiredCoins && userCoins < lesson.requiredCoins) {
        showLessonLockedMessage(lessonId);
        return;
    }
    
    // Save current lesson ID
    currentLessonId = lessonId;
    
    // Display the lesson
    displayLesson(lesson);
    
    // Update active lesson in sidebar
    updateActiveLessonInSidebar(lessonId);
    
    // Prepare visualization if needed
    if (lesson.hasVisualization && typeof window.prepareVisualization === 'function') {
        window.prepareVisualization(lesson);
    }
    
    // Get the current lesson object
    const currentLesson = getCurrentLesson();
    if (currentLesson) {
        updateVisualizationWithResult(currentLesson.id, document.getElementById('code-editor').value);
    }
}

/**
 * Display the lesson content
 * @param {Object} lesson - The lesson object to display
 */
function displayLesson(lesson) {
    const titleElement = document.getElementById('lesson-title');
    const contentElement = document.getElementById('lesson-content');
    const codeContainer = document.getElementById('code-container');
    
    if (titleElement) titleElement.textContent = lesson.title;
    
    if (contentElement) {
        // Set HTML content - this is trusted content from our lesson files
        contentElement.innerHTML = lesson.content;
        
        // Apply syntax highlighting to code blocks
        if (window.Prism) {
            contentElement.querySelectorAll('pre code').forEach((block) => {
                window.Prism.highlightElement(block);
            });
        }
    }
    
    // Show/hide code container based on whether this lesson has code exercises
    if (codeContainer) {
        if (lesson.hasCodeExercise) {
            codeContainer.classList.remove('hidden');
            
            // Set starter code in editor if available
            const codeEditor = document.getElementById('code-editor');
            if (codeEditor && lesson.starterCode) {
                codeEditor.value = lesson.starterCode;
            }
        } else {
            codeContainer.classList.add('hidden');
        }
    }
}

/**
 * Update which lesson is marked active in the sidebar
 * @param {string} lessonId - The ID of the active lesson
 */
function updateActiveLessonInSidebar(lessonId) {
    // Remove active class from all lessons
    document.querySelectorAll('#lesson-list .lesson-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current lesson
    const activeLessonItem = document.querySelector(`.lesson-item[data-lesson-id="${lessonId}"]`);
    if (activeLessonItem) {
        activeLessonItem.classList.add('active');
        
        // Scroll to the active lesson in the sidebar
        activeLessonItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Mark the current lesson as completed
 * @returns {Promise} Promise that resolves when lesson is marked as completed
 */
export function markCurrentLessonCompleted() {
    return new Promise((resolve, reject) => {
        try {
            if (!currentLessonId) {
                reject(new Error("No active lesson"));
                return;
            }
            
            const userState = getUserState();
            
            // Check if lesson is already completed
            const completedLessons = userState.completedLessons || [];
            if (completedLessons.includes(currentLessonId)) {
                resolve(userState); // Already completed, no need to update
                return;
            }
            
            // Get the lesson to determine reward
            const lesson = lessons.find(l => l.id === currentLessonId);
            if (!lesson) {
                reject(new Error("Lesson not found"));
                return;
            }
            
            // Award coins for completion
            const reward = lesson.reward || 10; // Default reward is 10 coins
            
            // Update completed lessons list
            const updatedCompletedLessons = [...completedLessons, currentLessonId];
            
            // Add 'just-completed' class to the lesson item for animation
            const lessonItem = document.querySelector(`.lesson-item[data-lesson-id="${currentLessonId}"]`);
            if (lessonItem) {
                lessonItem.classList.add('just-completed', 'completed');
                setTimeout(() => {
                    lessonItem.classList.remove('just-completed');
                }, 2000);
            }
            
            // Update user state with the completed lesson
            saveUserState({ completedLessons: updatedCompletedLessons })
                .then(() => {
                    // Add coins separately for better UI feedback
                    return updateCoins(reward, `Completed lesson: ${lesson.title}`);
                })
                .then(updatedState => {
                    // Show completion notification
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(
                            `Lesson completed! You earned ${reward} coins.`,
                            'success'
                        );
                    }
                    
                    resolve(updatedState);
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get the current lesson object
 * @returns {Object|null} The current lesson object or null if no lesson is active
 */
export function getCurrentLesson() {
    if (!currentLessonId) return null;
    return lessons.find(l => l.id === currentLessonId) || null;
}

/**
 * Get all lessons
 * @returns {Array} Array of all lesson objects
 */
export function getAllLessons() {
    return [...lessons]; // Return a copy to prevent external modification
}

/**
 * Get lessons by category
 * @param {string} category - The category to get lessons for
 * @returns {Array} Array of lesson objects in the specified category
 */
export function getLessonsByCategory(category) {
    return categories[category] ? [...categories[category]] : [];
}

/**
 * Update visualization with result
 * @param {string} lessonId - The ID of the lesson
 * @param {string} code - The code to visualize
 */
function updateVisualizationWithResult(lessonId, code) {
    // Placeholder implementation for updating visualization
    console.log(`Updating visualization for lesson ${lessonId} with code: ${code}`);
}

// Export the module
export default {
    initLessons,
    loadLesson,
    navigateToLesson,
    markCurrentLessonCompleted,
    getCurrentLesson,
    getAllLessons,
    getLessonsByCategory
};
