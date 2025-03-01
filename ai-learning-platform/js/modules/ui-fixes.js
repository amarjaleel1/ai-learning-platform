/**
 * UI Fixes module for AI Learning Platform
 * Contains fixes for various GUI issues
 */

import { debounce } from './helpers.js';

/**
 * Fix all UI-related issues
 */
export function applyUIFixes() {
    // Fix sidebar height issues
    fixSidebarHeight();
    
    // Fix modal positioning
    fixModalPositioning();
    
    // Fix canvas scaling
    fixCanvasScaling();
    
    // Fix code editor overflow
    fixCodeEditorOverflow();
    
    // Fix scrollbar issues on mobile 
    fixMobileScrolling();
    
    // Fix focus issues
    improveKeyboardAccessibility();
    
    // Listen for window resize events
    window.addEventListener('resize', debounce(() => {
        fixSidebarHeight();
        fixCanvasScaling();
        fixCodeEditorOverflow();
    }, 250));
    
    console.log('UI fixes applied');
}

/**
 * Fix sidebar height issues on different screen sizes
 */
function fixSidebarHeight() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Reset any inline height to recalculate
    sidebar.style.height = '';
    
    if (window.innerWidth <= 900) {
        // On mobile/tablet, limit height with scrolling
        sidebar.style.maxHeight = '300px';
    } else {
        // On desktop, make sidebar fill available height
        const header = document.querySelector('header');
        const nav = document.querySelector('.main-nav');
        const footer = document.querySelector('footer');
        
        const headerHeight = header ? header.offsetHeight : 0;
        const navHeight = nav ? nav.offsetHeight : 0;
        const footerHeight = footer ? footer.offsetHeight : 0;
        
        const availableHeight = window.innerHeight - headerHeight - navHeight - footerHeight;
        sidebar.style.height = `${availableHeight}px`;
    }
}

/**
 * Fix modal positioning issues
 */
function fixModalPositioning() {
    // Override modal styles for better mobile display
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 600px) {
            .modal-content {
                width: 95%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-body {
                max-height: 60vh;
                overflow-y: auto;
            }
        }
        
        /* Fix for modal content overflowing screen */
        .modal {
            align-items: center;
            overflow-y: auto;
            padding: 20px 0;
        }
        
        /* Fix modal animation causing scrollbar jumps */
        html, body {
            scrollbar-gutter: stable;
        }
    `;
    document.head.appendChild(style);
    
    // Fix iOS modal positioning
    document.addEventListener('touchmove', function(e) {
        const modal = document.querySelector('.modal.show');
        if (modal && !modal.contains(e.target)) {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * Fix canvas scaling issues
 */
function fixCanvasScaling() {
    const canvas = document.getElementById('visualization-canvas');
    if (!canvas) return;
    
    // Set canvas rendering size to match display size
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 2; // Account for borders
    
    if (canvas.width !== containerWidth) {
        // Maintain aspect ratio but fit within container width
        const aspectRatio = canvas.height / canvas.width;
        const newWidth = containerWidth;
        const newHeight = containerWidth * aspectRatio;
        
        // Update canvas display size
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        
        // Optional: Update canvas buffer size if visualization requires it
        // Note: This will clear the canvas content
        // canvas.width = newWidth;
        // canvas.height = newHeight;
    }
}

/**
 * Fix code editor overflow issues
 */
function fixCodeEditorOverflow() {
    const editor = document.getElementById('code-editor');
    if (!editor) return;
    
    // Ensure editor height adapts to content
    const minHeight = 200; // Minimum height in pixels
    
    // Reset height to recalculate
    editor.style.height = `${minHeight}px`;
    
    // Calculate new height based on content (with a maximum)
    const newHeight = Math.min(Math.max(editor.scrollHeight, minHeight), 500);
    editor.style.height = `${newHeight}px`;
    
    // Ensure horizontal scroll works properly
    editor.style.whiteSpace = 'pre';
    editor.style.overflowX = 'auto';
    
    // Improve tab handling
    editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Insert a tab at cursor position
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            
            // Move caret to proper position
            this.selectionStart = this.selectionEnd = start + 4;
        }
    });
}

/**
 * Fix scrolling issues on mobile devices
 */
function fixMobileScrolling() {
    // Prevent overscroll/bounce in mobile browsers
    document.body.style.overscrollBehavior = 'none';
    
    // Fix for iOS momentum scrolling
    const style = document.createElement('style');
    style.textContent = `
        .sidebar, .content {
            -webkit-overflow-scrolling: touch;
        }
        
        /* Fix for iOS input zoom */
        @media screen and (max-width: 600px) {
            input, textarea, select {
                font-size: 16px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Improve keyboard accessibility for better focus management
 */
function improveKeyboardAccessibility() {
    // Make sure all interactive elements are focusable
    const interactiveElements = [
        '.lesson-item:not(.locked)',
        '.button-group button',
        '.modal button',
        'a[href]'
    ];
    
    interactiveElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    });
    
    // Trap focus inside modals when open
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        const modal = document.querySelector('.modal.show');
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    // Add visible focus styles
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
        *:focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(focusStyle);
}

/**
 * Fix Z-index issues
 */
export function fixZIndexIssues() {
    const zIndexStyle = document.createElement('style');
    zIndexStyle.textContent = `
        /* Ensure proper layering */
        header { z-index: 10; }
        .main-nav { z-index: 9; }
        .modal { z-index: 1000; }
        .notification-container { z-index: 1001; }
        .app-loader, .app-error { z-index: 1002; }
    `;
    document.head.appendChild(zIndexStyle);
}

export default {
    applyUIFixes,
    fixZIndexIssues
};
