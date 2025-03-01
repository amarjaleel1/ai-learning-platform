/**
 * Mobile menu handler for AI Learning Platform
 * Improves navigation on mobile devices
 */

export function initMobileMenu() {
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        setupMobileMenu();
        setupSidebarToggle();
    }
    
    // Listen for resize events to adapt
    window.addEventListener('resize', debounce(() => {
        const nowMobile = window.innerWidth <= 768;
        
        if (nowMobile && !isMobile) {
            // Switched to mobile
            setupMobileMenu();
            setupSidebarToggle();
        } else if (!nowMobile && document.getElementById('mobile-menu-toggle')) {
            // Switched to desktop, cleanup mobile UI
            cleanupMobileMenu();
        }
    }, 250));
}

/**
 * Setup mobile menu features
 */
function setupMobileMenu() {
    // Skip if already set up
    if (document.getElementById('mobile-menu-toggle')) return;
    
    // Add a toggle button to the header
    const header = document.querySelector('header');
    const userInfo = document.querySelector('.user-info');
    
    if (!header || !userInfo) return;
    
    const menuToggle = document.createElement('button');
    menuToggle.id = 'mobile-menu-toggle';
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Insert before user info
    header.insertBefore(menuToggle, userInfo);
    
    // Get the navigation element
    const nav = document.querySelector('.main-nav');
    
    if (!nav) return;
    
    // Initially hide the menu on mobile
    nav.classList.add('mobile-hidden');
    
    // Add toggle functionality
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
        menuToggle.setAttribute('aria-expanded', nav.classList.contains('mobile-open'));
        
        // Change icon
        menuToggle.innerHTML = nav.classList.contains('mobile-open') ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('mobile-open');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Add mobile menu styles
    addMobileMenuStyles();
}

/**
 * Setup sidebar toggle for mobile
 */
function setupSidebarToggle() {
    // Skip if already set up
    if (document.getElementById('sidebar-toggle')) return;
    
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (!sidebar || !content) return;
    
    // Create toggle button
    const sidebarToggle = document.createElement('button');
    sidebarToggle.id = 'sidebar-toggle';
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.setAttribute('aria-label', 'Toggle lessons sidebar');
    sidebarToggle.innerHTML = '<i class="fas fa-book"></i> Lessons';
    
    // Add to the top of content
    content.insertBefore(sidebarToggle, content.firstChild);
    
    // Initially collapse sidebar on mobile
    sidebar.classList.add('sidebar-collapsed');
    
    // Toggle functionality
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-collapsed');
        sidebar.classList.toggle('sidebar-expanded');
        
        sidebarToggle.setAttribute('aria-expanded', sidebar.classList.contains('sidebar-expanded'));
        
        // Change text
        sidebarToggle.innerHTML = sidebar.classList.contains('sidebar-expanded') ?
            '<i class="fas fa-times"></i> Close' :
            '<i class="fas fa-book"></i> Lessons';
    });
    
    // Close sidebar when clicking a lesson
    sidebar.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
                sidebarToggle.innerHTML = '<i class="fas fa-book"></i> Lessons';
                sidebarToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/**
 * Clean up mobile menu when switching back to desktop
 */
function cleanupMobileMenu() {
    // Remove mobile toggle button
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.parentElement.removeChild(menuToggle);
    }
    
    // Remove sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.parentElement.removeChild(sidebarToggle);
    }
    
    // Reset navigation and sidebar classes
    const nav = document.querySelector('.main-nav');
    if (nav) {
        nav.classList.remove('mobile-hidden', 'mobile-open');
    }
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('sidebar-collapsed', 'sidebar-expanded');
    }
}

/**
 * Add mobile menu styles
 */
function addMobileMenuStyles() {
    if (document.getElementById('mobile-menu-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'mobile-menu-styles';
    
    styleElement.textContent = `
        /* Mobile menu styles */
        @media screen and (max-width: 768px) {
            .mobile-menu-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
                background: none;
                color: white;
                border: none;
                cursor: pointer;
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
                padding: 0;
                margin-right: 10px;
            }
            
            .main-nav.mobile-hidden {
                display: none;
            }
            
            .main-nav.mobile-open {
                display: block;
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                background-color: var(--primary-dark);
                z-index: 100;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .main-nav.mobile-open ul {
                flex-direction: column;
                width: 100%;
            }
            
            .main-nav.mobile-open li {
                width: 100%;
            }
            
            .main-nav.mobile-open a {
                padding: 12px 20px;
                width: 100%;
                text-align: left;
            }
            
            /* Sidebar toggle */
            .sidebar-toggle {
                display: block;
                width: 100%;
                padding: 10px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 4px;
                margin-bottom: 15px;
                text-align: center;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .sidebar.sidebar-collapsed {
                display: none;
            }
            
            .sidebar.sidebar-expanded {
                display: block;
                position: fixed;
                top: 60px;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 90;
                width: 100%;
                max-height: calc(100vh - 60px);
                background-color: var(--white);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                animation: slideInFromLeft 0.3s ease-out;
            }
            
            @keyframes slideInFromLeft {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(0);
                }
            }
        }
        
        @media screen and (min-width: 769px) {
            .mobile-menu-toggle,
            .sidebar-toggle {
                display: none !important;
            }
            
            .main-nav {
                display: block !important;
            }
            
            .sidebar {
                display: block !important;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Simple debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

export default {
    initMobileMenu
};
