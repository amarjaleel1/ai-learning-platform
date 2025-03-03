/**
 * Navigation bug fixes
 * This script addresses navigation issues that might prevent proper flow between sections
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fix for links not working properly
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-nav');
            
            // Hide all views
            document.querySelectorAll('[data-view]').forEach(view => {
                view.classList.add('hidden');
            });
            
            // Show target view
            const targetView = document.querySelector(`[data-view="${target}"]`);
            if (targetView) {
                targetView.classList.remove('hidden');
            }
            
            // Update active state in nav
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            // Scroll to top for better experience
            window.scrollTo(0, 0);
        });
    });
    
    // Fix for lesson items click handling
    const lessonItems = document.querySelectorAll('.lesson-item');
    lessonItems.forEach(item => {
        // Ensure keyboard accessibility works
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Simulate click
                this.click();
            }
        });
        
        // Fix for locked lessons
        if (item.classList.contains('locked')) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                // Show message about locked content
                alert('This lesson is locked. Complete previous lessons or earn more coins to unlock it.');
            });
        }
    });
    
    // Fix for the "Start Your First Lesson" button
    const startButton = document.getElementById('start-first-lesson');
    if (startButton) {
        startButton.addEventListener('click', function() {
            // Find the first unlocked lesson and activate it
            const firstLesson = document.querySelector('.lesson-item:not(.locked)');
            if (firstLesson) {
                firstLesson.click();
            }
        });
    }
    
    // Make sure the code editor is properly initialized
    const codeEditor = document.getElementById('code-editor');
    if (codeEditor) {
        // Fix potential focus issues
        codeEditor.addEventListener('click', function() {
            this.focus();
        });
        
        // Ensure tab key works properly in the code editor
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
    
    // Fix for the run code button
    const runCodeButton = document.getElementById('run-code');
    if (runCodeButton) {
        runCodeButton.addEventListener('click', function() {
            // Make sure the app doesn't get stuck in loading state
            const appLoader = document.getElementById('app-loader');
            if (appLoader) {
                // Set a timeout to ensure loader gets removed even if there's an error
                setTimeout(() => {
                    appLoader.style.display = 'none';
                }, 3000);
            }
        });
    }
});
