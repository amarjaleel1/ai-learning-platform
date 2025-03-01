/**
 * Synthetic tests for AI Learning Platform using Puppeteer
 * These tests will run in GitHub Actions to verify basic functionality
 */

const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Starting browser tests...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',  // Use new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Basic logging
    page.on('console', message => {
      if (message.type() === 'error' || message.type() === 'warning') {
        console.log(`Browser console ${message.type()}: ${message.text()}`);
      }
    });

    // Collect test results
    const testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Helper function for tests
    const runTest = async (name, testFn) => {
      try {
        console.log(`Running test: ${name}`);
        await testFn();
        console.log(`✓ Test passed: ${name}`);
        testResults.passed++;
        testResults.tests.push({ name, status: 'passed' });
      } catch (error) {
        console.error(`✗ Test failed: ${name}`);
        console.error(error);
        testResults.failed++;
        testResults.tests.push({ name, status: 'failed', error: error.message });
      }
    };

    // Helper function to wait for loaders to disappear
    const waitForLoaderToDisappear = async () => {
      try {
        await page.waitForSelector('#app-loader', { hidden: true, timeout: 5000 });
      } catch (e) {
        // If timeout, check if loader exists and is visible
        const loaderVisible = await page.evaluate(() => {
          const loader = document.getElementById('app-loader');
          return loader && window.getComputedStyle(loader).display !== 'none';
        });
        
        if (loaderVisible) {
          throw new Error('Page is still loading after timeout');
        }
      }
    };

    // Start tests
    // ===========================

    // Test 1: Platform loads correctly
    await runTest('Platform loads', async () => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await waitForLoaderToDisappear();
      
      // Check page title
      const title = await page.title();
      if (!title.includes('AI Learning Platform')) {
        throw new Error(`Unexpected page title: ${title}`);
      }
      
      // Check for critical UI elements
      await page.waitForSelector('header');
      await page.waitForSelector('.logo');
      
      // Check if logo text exists
      const logoText = await page.$eval('.logo h1', el => el.textContent);
      if (!logoText.includes('AI Learning')) {
        throw new Error('Logo text not found');
      }
    });

    // Test 2: Navigation works
    await runTest('Navigation works', async () => {
      // Click on Dashboard link
      await page.click('[data-nav="dashboard"]');
      await page.waitForSelector('[data-view="dashboard"]', { visible: true });
      
      // Verify the correct view is shown
      const dashboardVisible = await page.evaluate(() => {
        const dashboard = document.querySelector('[data-view="dashboard"]');
        return dashboard && !dashboard.classList.contains('hidden');
      });
      
      if (!dashboardVisible) {
        throw new Error('Dashboard view is not visible after navigation');
      }
      
      // Navigate back to welcome
      await page.click('[data-nav="welcome"]');
      await page.waitForSelector('[data-view="welcome"]', { visible: true });
    });

    // Test 3: Theme toggle works
    await runTest('Theme toggle works', async () => {
      // Check if theme toggle exists
      const themeToggleExists = await page.evaluate(() => {
        return !!document.querySelector('.theme-toggle');
      });
      
      if (!themeToggleExists) {
        throw new Error('Theme toggle button not found');
      }
      
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark-theme');
      });
      
      // Click theme toggle
      await page.click('.theme-toggle');
      
      // Check if theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark-theme');
      });
      
      if (newTheme === initialTheme) {
        throw new Error('Theme did not change after toggle');
      }
      
      // Reset theme to original state
      await page.click('.theme-toggle');
    });

    // Test 4: Lessons list loads
    await runTest('Lessons list loads', async () => {
      // Navigate to lessons view
      await page.click('[data-nav="lessons"]');
      await page.waitForSelector('[data-view="lessons"]', { visible: true });
      
      // Check if there are lessons in the sidebar
      const lessonCount = await page.evaluate(() => {
        const lessons = document.querySelectorAll('#lesson-list .lesson-item');
        return lessons.length;
      });
      
      if (lessonCount === 0) {
        throw new Error('No lessons found in the sidebar');
      }
      
      console.log(`Found ${lessonCount} lessons`);
    });

    // Test 5: Lesson navigation works
    await runTest('Lesson navigation works', async () => {
      // Click on the first lesson
      await page.evaluate(() => {
        const firstLesson = document.querySelector('#lesson-list .lesson-item:not(.locked)');
        if (firstLesson) firstLesson.click();
      });
      
      // Wait for lesson content to load
      await page.waitForSelector('#lesson-title', { visible: true });
      
      // Verify lesson content is displayed
      const lessonTitle = await page.$eval('#lesson-title', el => el.textContent);
      const lessonContent = await page.$eval('#lesson-content', el => el.innerHTML.length > 0);
      
      if (!lessonTitle || !lessonContent) {
        throw new Error('Lesson content did not load properly');
      }
      
      console.log(`Loaded lesson: "${lessonTitle}"`);
    });

    // Test 6: Code editor functionality
    await runTest('Code editor functionality', async () => {
      // Check if the code editor exists
      const codeEditorExists = await page.evaluate(() => {
        const editor = document.getElementById('code-editor');
        return !!editor && !editor.classList.contains('hidden');
      });
      
      if (!codeEditorExists) {
        console.log('Code editor not available for this lesson, skipping test');
        return;
      }
      
      // Type some code into the editor
      await page.type('#code-editor', '// This is a test\nconsole.log("Hello, world!");');
      
      // Check if the code was added
      const editorContent = await page.$eval('#code-editor', el => el.value);
      if (!editorContent.includes('Hello, world')) {
        throw new Error('Code editor did not update with typed content');
      }
    });

    // Test 7: Responsive design checks
    await runTest('Responsive design', async () => {
      // Test mobile view
      await page.setViewport({ width: 480, height: 800 });
      await page.waitForTimeout(500);  // Wait for resize effects
      
      // Check if mobile menu exists
      const mobileMenuExists = await page.evaluate(() => {
        return !!document.getElementById('mobile-menu-toggle');
      });
      
      if (!mobileMenuExists) {
        throw new Error('Mobile menu toggle not found in mobile viewport');
      }
      
      // Test tablet view
      await page.setViewport({ width: 768, height: 1024 });
      await page.waitForTimeout(500);
      
      // Reset to desktop view
      await page.setViewport({ width: 1280, height: 800 });
      await page.waitForTimeout(500);
    });

    // Test 8: Browser local storage works
    await runTest('Local storage works', async () => {
      // Check if localStorage is accessible
      const localStorageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test-key', 'test-value');
          const value = localStorage.getItem('test-key');
          localStorage.removeItem('test-key');
          return value === 'test-value';
        } catch (e) {
          return false;
        }
      });
      
      if (!localStorageWorks) {
        throw new Error('LocalStorage is not working properly');
      }
      
      // Check if user state is being saved
      const userStateExists = await page.evaluate(() => {
        return !!localStorage.getItem('userState');
      });
      
      if (!userStateExists) {
        throw new Error('User state not found in localStorage');
      }
    });

    // Finish tests and show summary
    console.log('\n==== Test Results Summary ====');
    console.log(`Total: ${testResults.passed + testResults.failed}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.failed > 0) {
      console.log('\nFailed tests:');
      testResults.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`- ${test.name}: ${test.error}`);
        });
      
      // Exit with error code for CI
      process.exitCode = 1;
    }

    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error('Test suite error:', error);
    process.exitCode = 1;
  }
})();
