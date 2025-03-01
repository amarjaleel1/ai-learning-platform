/**
 * Utility helper functions for the AI Learning Platform
 */

// DOM helper functions
function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Data manipulation helpers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Export these functions for use in both legacy and ES6 modules
if (typeof window !== 'undefined') {
    // Expose to global scope for legacy scripts
    window.showElement = showElement;
    window.hideElement = hideElement;
    window.setElementText = setElementText;
    window.debounce = debounce;
    window.formatDate = formatDate;
    window.generateUniqueId = generateUniqueId;
}

// Export as ES6 module
export {
    showElement,
    hideElement,
    setElementText,
    debounce,
    formatDate,
    generateUniqueId
};
