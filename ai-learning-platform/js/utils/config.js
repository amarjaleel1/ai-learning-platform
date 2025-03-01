/**
 * Configuration settings for the AI Learning Platform
 */

const CONFIG = {
    // API settings
    apiBaseUrl: 'https://api.ailearningplatform.com/v1',
    
    // Application settings
    appName: 'AI Learning Platform',
    version: '1.0.0',
    
    // User settings
    defaultUserName: 'Guest',
    startingCoins: 100,
    
    // Lesson settings
    lessonCompletionCoins: 50,
    
    // Feature flags
    enableAnalytics: true,
    enableOfflineMode: true,
    
    // UI settings
    theme: {
        light: {
            primary: '#3498db',
            secondary: '#2ecc71',
            background: '#ffffff',
            text: '#333333'
        },
        dark: {
            primary: '#2980b9',
            secondary: '#27ae60',
            background: '#2c3e50',
            text: '#ecf0f1'
        }
    }
};

// Make config available globally for legacy code
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Export as ES6 module
export default CONFIG;
