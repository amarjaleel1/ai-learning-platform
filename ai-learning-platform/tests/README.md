# Automated Testing for AI Learning Platform

This directory contains automated tests for the AI Learning Platform, designed to validate functionality and accessibility across different browsers and devices.

## Test Types

### Browser Functionality Tests

These tests use Puppeteer to automate a Chrome browser and verify that core platform functionality works correctly:

- Platform loads correctly
- Navigation between views works
- Theme toggle functionality
- Lessons list loads
- Lesson navigation works
- Code editor functionality 
- Responsive design checks
- Local storage works correctly

### Accessibility Tests

These tests use axe-core combined with Puppeteer to scan pages for accessibility issues:

- Checks all major pages (Welcome, Lessons, Dashboard)
- Evaluates against WCAG standards
- Provides detailed reports of any violations
- Suggests fixes for accessibility problems

## Running Tests Locally

To run tests on your local machine:

```bash
# Install dependencies
npm install

# Start the server in one terminal
npm start

# Run all tests
npm test

# Run only browser tests
npm run test:browser

# Run only accessibility tests
npm run test:accessibility
```

## CI/CD Integration

These tests are integrated into the GitHub Actions workflow. The workflow:

1. Sets up a Node.js environment
2. Installs dependencies
3. Starts the server
4. Runs browser tests
5. Runs accessibility tests
6. Verifies the server is running correctly

Test failures in the CI pipeline will prevent merges to the main branch, ensuring that only working code is merged.

## Adding New Tests

To add a new test:

1. For browser tests, add a new `runTest()` call in `puppeteer-tests.js`
2. For accessibility tests, add new pages to test in the `pagesToTest` array in `accessibility-tests.js`

## Test Reports

When running tests in the GitHub Actions environment, test results are displayed in the workflow run log. For local development, results are printed to the console.
