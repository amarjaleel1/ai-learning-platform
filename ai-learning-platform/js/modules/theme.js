/**
 * Theme management module for AI Learning Platform
 * Handles theme switching and preferences
 */

import { getUserState, saveUserState } from './state.js';

// Available themes
const THEMES = {
    LIGHT: 'light-theme',
    DARK: 'dark-theme'
};

/**
 * Initialize theme functionality
 */
export function initTheme() {
    // Add theme toggle button to header
    addThemeToggle();
    
    // Apply saved theme or use system preference
    applyTheme();
    
    // Listen for system theme changes
    listenForSystemThemeChanges();
}

/**
 * Add theme toggle button to the header
 */
function addThemeToggle() {
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;
    
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    
    themeToggle.addEventListener('click', toggleTheme);
    userInfo.appendChild(themeToggle);
    
    // Update icon based on current theme
    updateThemeToggleIcon();
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.classList.contains(THEMES.DARK) ? THEMES.DARK : THEMES.LIGHT;
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    
    // Save theme preference
    saveUserState({
        settings: {
            ...getUserState().settings,
            theme: newTheme
        }
    });
    
    // Apply the new theme
    applyTheme(newTheme);
}

/**
 * Apply the specified theme or the saved/system theme
 * @param {string} theme - Theme to apply (optional)
 */
export function applyTheme(theme) {
    const root = document.documentElement;
    const userState = getUserState();
    
    // Determine which theme to use
    let themeToApply = theme;
    
    if (!themeToApply) {
        // Use saved theme preference if available
        if (userState.settings?.theme) {
            themeToApply = userState.settings.theme;
        } else {
            // Fall back to system preference
            themeToApply = getSystemTheme();
            
            // Save this preference
            saveUserState({
                settings: {
                    ...userState.settings,
                    theme: themeToApply
                }
            });
        }
    }
    
    // Remove all theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add the correct theme class
    root.classList.add(themeToApply);
    
    // Update theme toggle icon
    updateThemeToggleIcon();
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            'content', 
            themeToApply === THEMES.DARK ? '#121212' : '#6200ee'
        );
    }
}

/**
 * Get the system's preferred theme
 * @returns {string} System theme preference
 */
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEMES.DARK;
    }
    return THEMES.LIGHT;
}

/**
 * Listen for changes in system theme preference
 */
function listenForSystemThemeChanges() {
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', (e) => {
                if (e.matches) {
                    applyTheme(THEMES.DARK);
                } else {
                    applyTheme(THEMES.LIGHT);
                }
            });
        } 
        // Older browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener((e) => {
                if (e.matches) {
                    applyTheme(THEMES.DARK);
                } else {
                    applyTheme(THEMES.LIGHT);
                }
            });
        }
    }
}

/**
 * Update the theme toggle icon based on current theme
 */
function updateThemeToggleIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    const isDarkTheme = document.documentElement.classList.contains(THEMES.DARK);
    
    themeToggle.innerHTML = isDarkTheme 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    themeToggle.setAttribute(
        'aria-label',
        isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'
    );
}

export default {
    initTheme,
    toggleTheme,
    applyTheme
};
