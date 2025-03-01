/**
 * Accessibility tests for AI Learning Platform using Puppeteer and axe-core
 */

const puppeteer = require('puppeteer');
const { AxeBuilder } = require('@axe-core/puppeteer');

(async () => {
  try {
    console.log('Starting accessibility tests...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Collection of pages to test
    const pagesToTest = [
      { name: 'Welcome Page', url: 'http://localhost:3000/#welcome' },
      { name: 'Lessons Page', url: 'http://localhost:3000/#lessons' },
      { name: 'Dashboard Page', url: 'http://localhost:3000/#dashboard' },
    ];
    
    // Track issues
    let totalViolations = 0;
    
    // Helper function to wait for loaders to disappear
    const waitForLoaderToDisappear = async () => {
      try {
        await page.waitForSelector('#app-loader', { hidden: true, timeout: 5000 });
      } catch (e) {
        const loaderVisible = await page.evaluate(() => {
          const loader = document.getElementById('app-loader');
          return loader && window.getComputedStyle(loader).display !== 'none';
        });
        
        if (loaderVisible) {
          throw new Error('Page is still loading after timeout');
        }
      }
    };
    
    // Run accessibility tests for each page
    for (const pageInfo of pagesToTest) {
      console.log(`Testing ${pageInfo.name} at ${pageInfo.url}`);
      
      // Navigate to the page
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
      await waitForLoaderToDisappear();
      
      // Wait for main content to be visible
      await page.waitForTimeout(1000); // Allow animations to complete
      
      // Run axe analysis
      console.log(`Running axe analysis for ${pageInfo.name}...`);
      const results = await new AxeBuilder(page).analyze();
      
      // Log the violations
      if (results.violations.length > 0) {
        console.log(`\n${pageInfo.name} has ${results.violations.length} accessibility violations:`);
        
        results.violations.forEach((violation, index) => {
          console.log(`\n${index + 1}. ${violation.impact} impact: ${violation.help}`);
          console.log(`   ${violation.helpUrl}`);
          console.log(`   Affected elements:`);
          
          violation.nodes.forEach(node => {
            console.log(`   - ${node.html}`);
            if (node.failureSummary) {
              console.log(`     ${node.failureSummary.replace(/\n/g, '\n     ')}`);
            }
          });
        });
        
        totalViolations += results.violations.length;
      } else {
        console.log(`✓ ${pageInfo.name} has no accessibility violations!`);
      }
    }
    
    // Summary
    console.log(`\n==== Accessibility Test Summary ====`);
    console.log(`Pages tested: ${pagesToTest.length}`);
    console.log(`Total violations found: ${totalViolations}`);
    
    if (totalViolations > 0) {
      console.warn('\nAccessibility issues were found. Please fix them to ensure your platform is accessible to all users.');
      // In CI, you might want to fail the job if there are violations
      // process.exitCode = 1;
    } else {
      console.log('\n✓ All pages passed accessibility tests!');
    }
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error('Accessibility test suite error:', error);
    process.exitCode = 1;
  }
})();
