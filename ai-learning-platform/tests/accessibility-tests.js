/**
 * Accessibility tests for AI Learning Platform using Puppeteer and axe-core
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

(async () => {
  try {
    console.log('Starting accessibility tests');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    console.log('Navigating to the app');
    
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Running axe accessibility tests');
    const results = await new AxePuppeteer(page).analyze();
    
    console.log('Accessibility test results:');
    console.log(`  Passes: ${results.passes.length}`);
    console.log(`  Violations: ${results.violations.length}`);
    
    if (results.violations.length > 0) {
      console.log('\nAccessibility violations:');
      results.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.help}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Description: ${violation.description}`);
        console.log(`  Nodes affected: ${violation.nodes.length}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/accessibility-test-result.png' });
    
    await browser.close();
    console.log('Accessibility tests completed');
    
    // Exit with error code if critical violations exist
    const criticalViolations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    if (criticalViolations.length > 0) {
      console.error(`${criticalViolations.length} critical accessibility violations found`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Accessibility tests failed: ${error.message}`);
    process.exit(1);
  }
})();
