/**
 * Navigation Fix for AI Learning Platform
 * This script resolves navigation issues and ensures proper functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation fix script loaded');
    
    // Fix 1: Ensure app loader disappears
    setTimeout(function() {
        const appLoader = document.getElementById('app-loader');
        if (appLoader) {
            appLoader.style.display = 'none';
            console.log('Loader hidden by timeout');
        }
    }, 2000);

    // Fix 2: Navigation item click handling
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        // Remove any existing listeners to prevent duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-nav');
            console.log('Navigation clicked:', target);
            
            // Hide all views
            document.querySelectorAll('[data-view]').forEach(view => {
                view.classList.add('hidden');
            });
            
            // Show target view
            const targetView = document.querySelector(`[data-view="${target}"]`);
            if (targetView) {
                targetView.classList.remove('hidden');
                console.log('Showing view:', target);
            } else {
                console.error(`Target view [data-view="${target}"] not found`);
            }
            
            // Update active state in nav
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to top for better experience
            window.scrollTo(0, 0);
        });
    });
    
    // Fix 3: Code editor focus issues
    const codeEditor = document.getElementById('code-editor');
    if (codeEditor) {
        codeEditor.addEventListener('click', function() {
            this.focus();
            console.log('Code editor focused');
        });
        
        // Fix tab key handling in code editor
        codeEditor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // Insert tab at cursor position
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                
                // Move cursor after the inserted tab
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    }
    
    // Fix 4: Lesson item click handling
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        // Remove any existing listeners to prevent duplicates
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Handle locked lessons
        if (newItem.classList.contains('locked')) {
            newItem.addEventListener('click', function(e) {
                e.preventDefault();
                alert('This lesson is locked. Complete previous lessons or earn more coins to unlock it.');
                console.log('Locked lesson clicked');
            });
        } else {
            // Regular lesson click handling
            newItem.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get lesson ID
                const lessonId = this.getAttribute('data-lesson-id');
                console.log('Loading lesson:', lessonId);
                
                // Update active state
                lessonItems.forEach(li => li.classList.remove('active'));
                this.classList.add('active');
                
                // Show lesson content (implement your lesson loading logic here)
                // For example:
                if (window.loadLesson && typeof window.loadLesson === 'function') {
                    window.loadLesson(lessonId);
                } else {
                    console.error('loadLesson function not found');
                    // Fallback: Try to show a lesson container with matching ID
                    document.querySelectorAll('.lesson-content').forEach(content => {
                        content.classList.add('hidden');
                    });
                    
                    const lessonContent = document.getElementById(`lesson-${lessonId}`);
                    if (lessonContent) {
                        lessonContent.classList.remove('hidden');
                    }
                }
            });
        }
        
        // Ensure keyboard accessibility
        newItem.setAttribute('tabindex', '0');
        newItem.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Fix 5: Start First Lesson button
    const startButton = document.getElementById('start-first-lesson');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Find and click the first unlocked lesson
            const firstLesson = document.querySelector('.lesson-item:not(.locked)');
            if (firstLesson) {
                console.log('Starting first lesson');
                firstLesson.click();
            } else {
                console.error('No unlocked lessons found');
            }
        });
    }
    
    // Fix 6: Run Code button handling
    const runCodeButton = document.getElementById('run-code');
    if (runCodeButton) {
        runCodeButton.addEventListener('click', function() {
            console.log('Run code button clicked');
            
            // Show a temporary loader
            const visualizationContainer = document.getElementById('visualization-container');
            if (visualizationContainer) {
                visualizationContainer.classList.remove('hidden');
            }
            
            // Make sure the app doesn't get stuck in loading state
            const runningIndicator = document.createElement('div');
            runningIndicator.className = 'running-indicator';
            runningIndicator.textContent = 'Running...';
            runningIndicator.style.position = 'fixed';
            runningIndicator.style.top = '10px';
            runningIndicator.style.right = '10px';
            runningIndicator.style.padding = '10px';
            runningIndicator.style.background = 'var(--primary-color)';
            runningIndicator.style.color = 'white';
            runningIndicator.style.borderRadius = '5px';
            runningIndicator.style.zIndex = '9999';
            document.body.appendChild(runningIndicator);
            
            // Set a timeout to remove the indicator
            setTimeout(() => {
                document.body.removeChild(runningIndicator);
            }, 3000);
        });
    }

    // Fix 7: Handle modal closing
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the closest modal parent
            const modal = this.closest('.modal') || this.closest('.analytics-overlay');
            if (modal) {
                modal.classList.remove('show');
                console.log('Modal closed');
            }
        });
    });

    // Fix 8: Make sure all links with href="#" have proper handling
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Preventing default on empty link:', this);
        });
    });

    console.log('Navigation fixes applied');
});

// Additional window load event to ensure loader is hidden
window.addEventListener('load', function() {
    setTimeout(function() {
        const appLoader = document.getElementById('app-loader');
        if (appLoader) {
            appLoader.style.display = 'none';
            console.log('Loader hidden by window.load event');
        }
    }, 2000); // Fallback timeout of 2 seconds
});
