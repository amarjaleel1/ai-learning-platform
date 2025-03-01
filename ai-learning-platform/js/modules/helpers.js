/**
 * Helper functions for AI Learning Platform
 * Common utilities that can be used across the application
 */

/**
 * Debounce a function to avoid excessive calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
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

/**
 * Throttle a function to limit number of calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
    let lastFunc;
    let lastRan;
    return function executedFunction(...args) {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string} - Random ID
 */
export function generateId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
}

/**
 * Format time to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time
 */
export function formatTime(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString();
}

/**
 * Format date and time to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time
 */
export function formatDateTime(date) {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleString();
}

/**
 * Convert milliseconds to readable time format (HH:MM:SS)
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time
 */
export function msToTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Create element with attributes and children
 * @param {string} tag - Element tag
 * @param {Object} attrs - Element attributes
 * @param {Array|string} children - Element children
 * @returns {HTMLElement} - Created element
 */
export function createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key === 'style') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (typeof children === 'string') {
        element.textContent = children;
    } else {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Check if an element is in viewport
 * @param {HTMLElement} el - Element to check
 * @returns {boolean} - Whether element is in viewport
 */
export function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get a random item from an array
 * @param {Array} array - Array to get item from
 * @returns {*} - Random item
 */
export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Truncate text if it's longer than specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 50, suffix = '...') {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length - suffix.length) + suffix;
}

/**
 * Get platform information (OS, browser)
 * @returns {Object} - Platform information
 */
export function getPlatformInfo() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    
    let os = null;
    let browser = null;
    
    // Detect OS
    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform)) {
        os = 'Linux';
    }
    
    // Detect browser
    if (userAgent.indexOf('Firefox') !== -1) {
        browser = 'Firefox';
    } else if (userAgent.indexOf('SamsungBrowser') !== -1) {
        browser = 'Samsung Browser';
    } else if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) {
        browser = 'Opera';
    } else if (userAgent.indexOf('Edge') !== -1) {
        browser = 'Edge';
    } else if (userAgent.indexOf('Edg') !== -1) {
        browser = 'Edge (Chromium)';
    } else if (userAgent.indexOf('Chrome') !== -1) {
        browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') !== -1) {
        browser = 'Safari';
    } else if (userAgent.indexOf('Trident') !== -1) {
        browser = 'Internet Explorer';
    }
    
    return { os, browser };
}

export default {
    debounce,
    throttle,
    generateId,
    formatDate,
    formatTime,
    formatDateTime,
    msToTime,
    createElement,
    isInViewport,
    randomItem,
    shuffleArray,
    truncateText,
    getPlatformInfo
};
