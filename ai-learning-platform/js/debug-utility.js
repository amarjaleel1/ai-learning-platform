/**
 * Debugging Utility for AI Learning Platform
 * Use this script to diagnose and fix common issues
 */

(function() {
    console.log('Debug utility loaded');
    
    // Create global debug object
    window.AIPlatformDebug = {
        version: '1.0.0',
        
        // Check for common issues
        runDiagnostics: function() {
            console.group('Running AI Platform diagnostics');
            this.checkDOMElements();
            this.checkEventListeners();
            this.checkUserState();
            this.checkNavigation();
            console.groupEnd();
        },
        
        // Check if all required DOM elements exist
        checkDOMElements: function() {
            console.group('Checking required DOM elements');
            
            const requiredElements = [
                'app-loader', 'lesson-container', 'lesson-title', 'lesson-content',
                'code-editor', 'run-code', 'get-hint', 'lesson-list',
                'visualization-container', 'visualization-canvas'
            ];
            
            let allFound = true;
            
            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    console.log(`✓ Found #${id}`);
                } else {
                    console.error(`✗ Missing #${id}`);
                    allFound = false;
                }
            });
            
            if (allFound) {
                console.log('All required DOM elements found');
            } else {
                console.warn('Some required DOM elements are missing');
            }
            
            console.groupEnd();
        },
        
        // Check if event listeners are working
        checkEventListeners: function() {
            console.group('Checking event listeners');
            
            // Create a test event
            const testEvent = new Event('test-event');
            let eventWorking = false;
            
            // Create a test element
            const testElement = document.createElement('div');
            testElement.id = 'event-test-element';
            testElement.style.display = 'none';
            document.body.appendChild(testElement);
            
            // Add test event listener
            testElement.addEventListener('test-event', function() {
                eventWorking = true;
            });
            
            // Dispatch test event
            testElement.dispatchEvent(testEvent);
            
            if (eventWorking) {
                console.log('✓ Event listeners are working');
            } else {
                console.error('✗ Event listeners are not working');
            }
            
            // Clean up
            document.body.removeChild(testElement);
            
            console.groupEnd();
        },
        
        // Check user state management
        checkUserState: function() {
            console.group('Checking user state');
            
            if (typeof window.userState !== 'undefined') {
                console.log('✓ User state object exists');
                console.log('Current state:', window.userState);
            } else {
                console.error('✗ User state object is missing');
            }
            
            console.groupEnd();
        },
        
        // Check navigation system
        checkNavigation: function() {
            console.group('Checking navigation system');
            
            const navElements = document.querySelectorAll('[data-nav]');
            if (navElements.length > 0) {
                console.log(`✓ Found ${navElements.length} navigation elements`);
                
                // Test navigation functionality
                const navLinks = Array.from(navElements);
                if (navLinks.length > 0) {
                    const firstNav = navLinks[0];
                    const targetView = firstNav.getAttribute('data-nav');
                    console.log(`Testing navigation to "${targetView}"`);
                    
                    // Store current state
                    const views = document.querySelectorAll('[data-view]');
                    const initialStates = Array.from(views).map(view => ({
                        id: view.getAttribute('data-view'),
                        hidden: view.classList.contains('hidden')
                    }));
                    
                    // Simulate click
                    firstNav.click();
                    
                    // Check if navigation worked
                    setTimeout(() => {
                        const targetElement = document.querySelector(`[data-view="${targetView}"]`);
                        if (targetElement && !targetElement.classList.contains('hidden')) {
                            console.log(`✓ Navigation to "${targetView}" successful`);
                        } else {
                            console.error(`✗ Navigation to "${targetView}" failed`);
                            console.log('Applying navigation fix...');
                            this.fix.navigation();
                        }
                    }, 100);
                }
            } else {
                console.error('✗ No navigation elements found');
            }
            
            console.groupEnd();
        },
        
        // Fix common issues
        fix: {
            // Fix navigation click handlers
            navigation: function() {
                console.log('Applying navigation fix...');
                
                document.querySelectorAll('[data-nav]').forEach(link => {
                    // Clean existing listeners by cloning
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    
                    // Add new listener
                    newLink.addEventListener('click', function(e) {
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
                            console.log('Navigation: showing view', target);
                        }
                    });
                });
                
                console.log('Navigation fix applied');
            },
            
            // Fix loader that doesn't disappear
            loader: function() {
                console.log('Hiding loader...');
                const appLoader = document.getElementById('app-loader');
                if (appLoader) {
                    appLoader.style.display = 'none';
                    console.log('Loader hidden');
                }
            },
            
            // Fix lesson list click handlers
            lessonList: function() {
                console.log('Applying lesson list fix...');
                
                document.querySelectorAll('.lesson-item').forEach(item => {
                    // Clean existing listeners
                    const newItem = item.cloneNode(true);
                    item.parentNode.replaceChild(newItem, item);
                    
                    // Add new listener
                    newItem.addEventListener('click', function() {
                        const lessonId = this.getAttribute('data-lesson-id');
                        console.log('Loading lesson:', lessonId);
                        
                        if (window.loadLesson && typeof window.loadLesson === 'function') {
                            window.loadLesson(lessonId);
                        } else {
                            console.error('loadLesson function not defined');
                        }
                    });
                });
                
                console.log('Lesson list fix applied');
            },
            
            // Fix HTML issues in the document
            fixHTMLIssues: function() {
                console.log('Checking for HTML issues...');
                
                // Check for duplicate IDs
                const allIds = {};
                document.querySelectorAll('[id]').forEach(el => {
                    const id = el.getAttribute('id');
                    if (allIds[id]) {
                        console.error(`Found duplicate ID: ${id}`);
                        // Generate new unique ID
                        const newId = `${id}-${Math.floor(Math.random() * 10000)}`;
                        el.setAttribute('id', newId);
                        console.log(`Changed duplicate ID to: ${newId}`);
                    } else {
                        allIds[id] = true;
                    }
                });
                
                // Check for unclosed tags by parsing HTML structure
                const html = document.documentElement.outerHTML;
                const tagPattern = /<([a-zA-Z0-9]+)[^>]*>(?!.*?<\/\1>)/g;
                let match;
                while ((match = tagPattern.exec(html)) !== null) {
                    console.warn(`Potentially unclosed tag: ${match[1]}`);
                }
                
                console.log('HTML check completed');
            },
            
            // Fix broken links and script references
            fixReferences: function() {
                console.log('Checking for broken script references...');
                
                document.querySelectorAll('script[src]').forEach(script => {
                    const src = script.getAttribute('src');
                    fetch(src)
                        .then(response => {
                            if (!response.ok) {
                                console.error(`Broken script reference: ${src}`);
                            }
                        })
                        .catch(error => {
                            console.error(`Cannot load script: ${src}`, error);
                        });
                });
                
                document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                    const href = link.getAttribute('href');
                    fetch(href)
                        .then(response => {
                            if (!response.ok) {
                                console.error(`Broken CSS reference: ${href}`);
                            }
                        })
                        .catch(error => {
                            console.error(`Cannot load stylesheet: ${href}`, error);
                        });
                });
                
                console.log('Reference check completed');
            }
        },
        
        // Apply all fixes
        fixAll: function() {
            console.group('Applying all fixes');
            this.fix.navigation();
            this.fix.loader();
            this.fix.lessonList();
            this.fix.fixHTMLIssues();
            this.fix.fixReferences();
            console.groupEnd();
            console.log('All fixes applied - please refresh the page to see if issues are resolved');
        }
    };
    
    // Automatically run diagnostics
    setTimeout(() => {
        console.log('Running automatic diagnostics...');
        window.AIPlatformDebug.runDiagnostics();
    }, 2000);
    
    // Log instructions
    console.log('Debug utility ready. Run AIPlatformDebug.runDiagnostics() to check for issues');
    console.log('Use AIPlatformDebug.fixAll() to apply all fixes');
    console.log('Available fixes: navigation, loader, lessonList, fixHTMLIssues, fixReferences');
})();
