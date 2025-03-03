const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Starting browser tests');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('Navigating to the app');
    
    // Navigate to the app
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Checking page title');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    if (!title.includes('AI Learning Platform')) {
      throw new Error(`Unexpected title: ${title}`);
    }
    
    // Check if navigation links exist
    console.log('Checking navigation elements');
    const navLinks = await page.$$('.main-nav a');
    if (navLinks.length < 1) {
      throw new Error('Navigation links not found');
    }
    console.log(`Found ${navLinks.length} navigation links`);
    
    // Click on lessons link
    console.log('Testing navigation to Lessons');
    await page.click('a[data-nav="lessons"]');
    await page.waitForTimeout(500);
    
    // Take a screenshot
    console.log('Taking screenshot');
    await page.screenshot({ path: 'tests/browser-test-result.png' });
    
    await browser.close();
    console.log('Browser tests completed successfully');
  } catch (error) {
    console.error(`Browser tests failed: ${error.message}`);
    process.exit(1);
  }
})();
