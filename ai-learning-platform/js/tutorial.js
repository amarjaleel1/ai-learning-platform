/**
 * Tutorial system for guiding new users through the AI Learning Platform
 */

// Flag to track if tutorial has been shown
let tutorialShown = false;

// Initialize tutorial system
function initTutorial() {
    // Check if user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    
    // Add tutorial button to header
    addTutorialButton();
    
    // If user is new and tutorial hasn't been shown yet, show it after a delay
    if (!hasSeenTutorial && !tutorialShown) {
        setTimeout(() => {
            showTutorial();
        }, 2000);
    }
}

// Add tutorial button to header
function addTutorialButton() {
    const header = document.querySelector('header');
    if (!header) return;
    
    // Create tutorial button if it doesn't exist
    if (!document.getElementById('tutorial-button')) {
        const tutorialButton = document.createElement('button');
        tutorialButton.id = 'tutorial-button';
        tutorialButton.className = 'icon-button';
        tutorialButton.title = 'Show Tutorial';
        tutorialButton.setAttribute('aria-label', 'Show tutorial');
        tutorialButton.innerHTML = '<i class="fas fa-question-circle" aria-hidden="true"></i>';
        
        tutorialButton.addEventListener('click', () => {
            showTutorial();
        });
        
        header.appendChild(tutorialButton);
    }
}

// Show the interactive tutorial
function showTutorial() {
    // Don't show tutorial if modal is already open
    if (document.querySelector('.modal')) return;
    
    // Mark tutorial as shown
    tutorialShown = true;
    
    // Define tutorial steps
    const steps = [
        {
            title: 'Welcome to AI Learning Platform!',
            content: 'This quick tour will show you how to use the platform and get the most out of your learning experience.',
            target: 'body',
            position: 'center',
            isIntro: true
        },
        {
            title: 'Lesson Navigation',
            content: 'Browse and select lessons from this sidebar. As you complete lessons, more advanced ones will unlock.',
            target: '.sidebar',
            position: 'right'
        },
        {
            title: 'Your Progress',
            content: 'This is your profile information. You earn coins by completing lessons, which can be used to unlock more content.',
            target: '.user-info',
            position: 'bottom'
        },
        {
            title: 'Learning Area',
            content: 'This is where lesson content is displayed. Read the instructions carefully before attempting exercises.',
            target: '#lesson-container',
            position: 'bottom'
        },
        {
            title: 'Coding Exercises',
            content: 'Write and test your code here. Use the buttons to run your code, check your solution, or get hints when stuck.',
            target: '#code-container',
            position: 'top'
        },
        {
            title: 'Visualizations',
            content: 'Many lessons include interactive visualizations to help you understand the concepts better.',
            target: '#visualization-container',
            position: 'top'
        },
        {
            title: 'Your Dashboard',
            content: 'View your progress, achievements and recommendations in the dashboard.',
            target: '[data-nav="dashboard"]',
            position: 'bottom'
        },
        {
            title: 'Ready to Learn!',
            content: 'That\'s it! You\'re ready to start learning AI concepts. Click on a lesson in the sidebar to get started.',
            target: 'body',
            position: 'center',
            isOutro: true
        }
    ];

    // Create tutorial overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
    
    // Start the tutorial
    let currentStep = 0;
    showStep(currentStep);
    
    // Function to show a tutorial step
    function showStep(index) {
        const step = steps[index];
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tutorial-tooltip ${step.position}`;
        
        // For intro/outro steps, use a different layout
        if (step.isIntro || step.isOutro) {
            tooltip.classList.add('tutorial-modal');
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <h3>${step.title}</h3>
                </div>
                <div class="tooltip-content">
                    <p>${step.content}</p>
                </div>
                <div class="tooltip-actions">
                    ${step.isIntro ? 
                        '<button class="next-step primary-button">Start Tour</button>' : 
                        '<button class="finish-tutorial primary-button">Start Learning</button>'}
                </div>
            `;
            tooltip.style.position = 'fixed';
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
            // Regular tooltip for normal steps
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <h4>${step.title}</h4>
                    <span class="step-counter">${index + 1}/${steps.length}</span>
                </div>
                <div class="tooltip-content">
                    <p>${step.content}</p>
                </div>
                <div class="tooltip-actions">
                    ${index > 0 ? 
                        '<button class="prev-step">Previous</button>' : 
                        ''}
                    ${index < steps.length - 1 ? 
                        '<button class="next-step">Next</button>' : 
                        '<button class="finish-tutorial">Finish</button>'}
                </div>
            `;
        }
        
        // Add tooltip to DOM
        document.body.appendChild(tooltip);
        
        // Highlight target element
        const targetElement = document.querySelector(step.target);
        if (targetElement) {
            targetElement.classList.add('tutorial-highlight');
        }
        
        // Position tooltip relative to target
        positionTooltip(tooltip, targetElement, step.position);
        
        // Add event listeners
        if (index > 0) {
            tooltip.querySelector('.prev-step').addEventListener('click', () => {
                showStep(index - 1);
            });
        }
        
        if (index < steps.length - 1) {
            tooltip.querySelector('.next-step').addEventListener('click', () => {
                showStep(index + 1);
            });
        } else {
            tooltip.querySelector('.finish-tutorial').addEventListener('click', endTutorial);
        }
    }
    
    // Position tooltip relative to target element
    function positionTooltip(tooltip, targetElement, position) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Calculate positions
        let top, left;
        
        switch (position) {
            case 'top':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.top - tooltipRect.height - 15;
                break;
            case 'right':
                left = targetRect.right + 15;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'bottom':
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                top = targetRect.bottom + 15;
                break;
            case 'left':
                left = targetRect.left - tooltipRect.width - 15;
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'center':
                left = (window.innerWidth / 2) - (tooltipRect.width / 2);
                top = (window.innerHeight / 2) - (tooltipRect.height / 2);
                break;
        }
        
        // Apply position
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        
        // Ensure tooltip is visible in viewport
        const tooltipUpdatedRect = tooltip.getBoundingClientRect();
        
        // Adjust if off-screen
        if (tooltipUpdatedRect.left < 10) {
            tooltip.style.left = '10px';
        }
        
        if (tooltipUpdatedRect.right > window.innerWidth - 10) {
            tooltip.style.left = `${window.innerWidth - tooltipUpdatedRect.width - 10}px`;
        }
        
        if (tooltipUpdatedRect.top < 10) {
            tooltip.style.top = '10px';
        }
        
        if (tooltipUpdatedRect.bottom > window.innerHeight - 10) {
            tooltip.style.top = `${window.innerHeight - tooltipUpdatedRect.height - 10}px`;
        }
    }
    
    // End the tutorial
    function endTutorial() {
        // Remove overlay
        overlay.remove();
        
        // Remove any tooltips
        const tooltip = document.querySelector('.tutorial-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Remove highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // Mark tutorial as shown
        localStorage.setItem('hasSeenTutorial', 'true');
        
        // Show completion message
        if (typeof showNotification === 'function') {
            showNotification('Tutorial completed! Start exploring the platform.', 'success');
        }
    }
    
    // Start tutorial with first step
    showStep(currentStep);
}

// Initialize tutorial when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTutorial();
});
