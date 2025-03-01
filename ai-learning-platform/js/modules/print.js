/**
 * Print module for AI Learning Platform
 * Handles printing functionality for lessons and reports
 */

/**
 * Initialize print functionality
 */
export function initPrintFunctionality() {
    // Add print stylesheet
    addPrintStyles();
    
    // Add print buttons where needed
    addPrintButtons();
    
    // Listen for print media change
    setupPrintMediaListener();
    
    console.log('Print functionality initialized');
}

/**
 * Add print-specific styles
 */
function addPrintStyles() {
    const printStyle = document.createElement('style');
    printStyle.id = 'print-styles';
    printStyle.textContent = `
        @media print {
            /* Hide non-printable elements */
            header, 
            footer, 
            nav,
            .main-nav,
            .sidebar,
            .user-info,
            .button-group,
            #coin-display,
            #code-container,
            #visualization-container,
            .hidden,
            .print-button,
            .modal,
            #app-loader,
            #app-error {
                display: none !important;
            }
            
            /* Reset layout for printing */
            body {
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #fff;
                font-size: 12pt;
                color: #000;
            }
            
            .container {
                display: block;
                width: 100%;
                height: auto;
                overflow: visible;
                margin: 0;
                padding: 0;
            }
            
            .content {
                width: 100%;
                padding: 0;
                margin: 0;
                overflow: visible;
            }
            
            /* Improve lesson content for print */
            #lesson-container {
                padding: 0;
                margin: 0;
                box-shadow: none;
            }
            
            #lesson-title {
                font-size: 18pt;
                margin-bottom: 1cm;
                text-align: center;
                color: #000;
            }
            
            #lesson-content {
                font-size: 11pt;
                line-height: 1.5;
                margin: 0;
                padding: 0;
            }
            
            /* QR code for accessing digital version */
            .print-footer {
                display: block;
                margin-top: 2cm;
                padding-top: 0.5cm;
                border-top: 1pt solid #ccc;
                text-align: center;
                font-size: 9pt;
                color: #666;
            }
            
            /* Ensure proper page breaks */
            h1, h2, h3 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            
            pre, blockquote, table {
                page-break-inside: avoid;
            }
            
            p, h2, h3 {
                orphans: 3;
                widows: 3;
            }
            
            /* Display URLs after links */
            a:after {
                content: " (" attr(href) ")";
                font-size: 90%;
                color: #666;
            }
            
            /* Show code blocks properly */
            pre {
                border: 1pt solid #ccc;
                padding: 0.5cm;
                white-space: pre-wrap;
                word-wrap: break-word;
                background-color: #f5f5f5 !important;
                color: #000 !important;
            }
            
            code {
                font-family: "Courier New", Courier, monospace;
                background-color: #f5f5f5 !important;
                color: #000 !important;
                border: 1pt solid #ddd;
                padding: 1pt 3pt;
            }
            
            /* Improve table appearance */
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 1cm 0;
            }
            
            th, td {
                border: 1pt solid #ccc;
                padding: 0.2cm;
                text-align: left;
            }
            
            th {
                background-color: #f5f5f5 !important;
            }
        }
    `;
    document.head.appendChild(printStyle);
}

/**
 * Add print buttons to the UI
 */
function addPrintButtons() {
    // Add a print button to lesson view
    const lessonContainer = document.getElementById('lesson-container');
    if (lessonContainer) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Lesson';
        printButton.setAttribute('aria-label', 'Print this lesson');
        printButton.addEventListener('click', printCurrentLesson);
        
        // Add the button at the top of the lesson container
        if (lessonContainer.firstChild) {
            lessonContainer.insertBefore(printButton, lessonContainer.firstChild);
        } else {
            lessonContainer.appendChild(printButton);
        }
    }
    
    // Add print button to dashboard
    const dashboardContainer = document.getElementById('dashboard-container');
    if (dashboardContainer) {
        const printButton = document.createElement('button');
        printButton.className = 'print-button print-dashboard-button';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Report';
        printButton.setAttribute('aria-label', 'Print progress report');
        printButton.addEventListener('click', printDashboard);
        
        // Add the button at the top of the dashboard after the title
        const title = dashboardContainer.querySelector('h2');
        if (title && title.nextSibling) {
            dashboardContainer.insertBefore(printButton, title.nextSibling);
        } else if (title) {
            dashboardContainer.insertBefore(printButton, title.nextSibling);
        }
    }
    
    // Add print styles for buttons
    const style = document.createElement('style');
    style.textContent = `
        .print-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10;
            transition: background-color 0.2s;
        }
        
        .print-button:hover {
            background-color: var(--primary-dark);
        }
        
        .print-dashboard-button {
            position: absolute;
            top: 10px;
            right: 20px;
        }
        
        @media (max-width: 600px) {
            .print-button {
                position: static;
                margin-bottom: 15px;
                width: 100%;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Print current lesson
 */
function printCurrentLesson() {
    // Add print-specific elements
    addPrintFooter();
    
    // Use the browser's print function
    window.print();
    
    // Remove print-specific elements after printing
    setTimeout(removePrintElements, 1000);
}

/**
 * Print dashboard as a report
 */
function printDashboard() {
    // Prepare dashboard for printing
    prepareDashboardForPrint();
    
    // Add print-specific elements
    addPrintFooter();
    
    // Use the browser's print function
    window.print();
    
    // Remove print-specific elements after printing
    setTimeout(removePrintElements, 1000);
}

/**
 * Add footer with metadata for printed page
 */
function addPrintFooter() {
    // Remove any existing print footer
    removePrintElements();
    
    // Create new print footer
    const footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.innerHTML = `
        <p>Printed from AI Learning Platform on ${new Date().toLocaleDateString()}</p>
        <p>Access this content online at: ${window.location.href}</p>
    `;
    
    // Add to document
    document.body.appendChild(footer);
}

/**
 * Prepare dashboard for printing
 */
function prepareDashboardForPrint() {
    // Currently just a placeholder
    // In a full implementation, this would format the dashboard data
    // for better printing, expand collapsed sections, etc.
    console.log('Preparing dashboard for printing');
}

/**
 * Remove print-specific elements
 */
function removePrintElements() {
    // Remove print footer
    document.querySelectorAll('.print-footer').forEach(el => {
        el.parentNode.removeChild(el);
    });
}

/**
 * Set up listener for print media change
 */
function setupPrintMediaListener() {
    if (window.matchMedia) {
        const mediaQueryList = window.matchMedia('print');
        
        // Modern browsers
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handlePrintMediaChange);
        } 
        // Older browsers
        else if (mediaQueryList.addListener) {
            mediaQueryList.addListener(handlePrintMediaChange);
        }
    }
}

/**
 * Handle print media change
 */
function handlePrintMediaChange(mql) {
    if (mql.matches) {
        // Entering print mode
        console.log('Preparing for print');
        // Add any last-minute print preparations here
    } else {
        // Exiting print mode
        console.log('Exiting print mode');
        // Clean up after printing
        removePrintElements();
    }
}

export default {
    initPrintFunctionality
};
