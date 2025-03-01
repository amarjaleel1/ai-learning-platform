/**
 * Touch handler module for AI Learning Platform
 * Improves touch interactions on mobile devices
 */

/**
 * Initialize touch enhancements
 */
export function initTouchHandling() {
    // Add touch class to body for CSS targeting
    document.body.classList.add('touch-device');
    
    // Check if device supports touch
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Improve scroll behavior
        improveScrolling();
        
        // Add touch feedback on interactive elements
        addTouchFeedback();
        
        // Fix double-tap zooming on buttons/links
        preventDoubleTapZoom();
        
        // Improve modal/dialog touch interactions
        improveModalTouch();
    }
    
    console.log('Touch handling initialized');
}

/**
 * Improve scrolling behavior on touch devices
 */
function improveScrolling() {
    // Add momentum scrolling to scrollable containers
    const scrollableElements = [
        '.sidebar',
        '.content',
        '.modal-body',
        '#code-editor'
    ];
    
    scrollableElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            
            // Prevent body scroll when element is at scroll boundaries
            element.addEventListener('touchstart', function(e) {
                const top = this.scrollTop;
                const totalScroll = this.scrollHeight;
                const currentScroll = top + this.offsetHeight;
                
                // If we're at the top or bottom of the container
                if (top === 0) {
                    this.scrollTop = 1;
                } else if (currentScroll === totalScroll) {
                    this.scrollTop = top - 1;
                }
            });
        });
    });
}

/**
 * Add touch feedback on interactive elements
 */
function addTouchFeedback() {
    // Add active state style for touch
    const style = document.createElement('style');
    style.textContent = `
        .touch-device button:active,
        .touch-device .lesson-item:active:not(.locked),
        .touch-device .main-nav a:active,
        .touch-device .logo:active {
            opacity: 0.7;
            transform: scale(0.98);
        }
        
        /* Increase touch targets */
        .touch-device .sidebar .lesson-item {
            padding: 12px;
        }
        
        .touch-device .button-group button {
            padding: 12px 20px;
        }
        
        .touch-device .main-nav a {
            padding: 12px 16px;
        }
        
        /* Remove hover styles that cause issues on touch */
        .touch-device button:hover,
        .touch-device .lesson-item:hover {
            transform: none;
            box-shadow: none;
        }
    `;
    document.head.appendChild(style);
    
    // Add active class on touch start and remove on touch end
    const touchTargets = [
        'button',
        '.lesson-item:not(.locked)',
        '.main-nav a',
        '.logo',
        '.start-lesson-btn',
        '.coin-requirement',
        '.toggle-slider'
    ];
    
    touchTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
        });
    });
}

/**
 * Prevent double-tap zooming on buttons/links
 */
function preventDoubleTapZoom() {
    const nonZoomElements = [
        'button',
        'a',
        '.lesson-item',
        '.logo',
        '.user-info',
        '.toggle-slider',
        '.start-lesson-btn'
    ];
    
    nonZoomElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                
                // Trigger click after a small delay to prevent zoom
                setTimeout(() => {
                    if (document.activeElement !== this) {
                        this.click();
                    }
                }, 100);
            });
        });
    });
}

/**
 * Improve modal touch interactions
 */
function improveModalTouch() {
    // Add overlay click to close for modals
    document.addEventListener('click', function(e) {
        const modal = document.querySelector('.modal.show');
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');
        
        // If click is outside modal content, close the modal
        if (modal.contains(e.target) && !modalContent.contains(e.target)) {
            // Find close button and trigger click
            const closeButton = modal.querySelector('.close-button') || 
                               modal.querySelector('.primary-button') ||
                               modal.querySelector('button');
                               
            if (closeButton) {
                closeButton.click();
            }
        }
    });
}

export default {
    initTouchHandling
};
