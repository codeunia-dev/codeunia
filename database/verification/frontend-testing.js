// Frontend Testing Script
// Run this in browser console to test application functionality

console.log('🧪 Starting Frontend Testing...');

// Test Results Object
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const result = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${result}: ${testName}${details ? ` - ${details}` : ''}`);
  
  testResults.tests.push({
    name: testName,
    passed,
    details
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 1: Check if application is loaded
function testApplicationLoad() {
  const title = document.title;
  const hasCodeunia = title.includes('Codeunia');
  logTest('Application Load', hasCodeunia, `Title: ${title}`);
  return hasCodeunia;
}

// Test 2: Check for navigation elements
function testNavigation() {
  const nav = document.querySelector('nav') || document.querySelector('[role="navigation"]');
  const hasNav = !!nav;
  logTest('Navigation Elements', hasNav, hasNav ? 'Navigation found' : 'No navigation found');
  return hasNav;
}

// Test 3: Check for authentication elements
function testAuthElements() {
  const signInBtn = document.querySelector('a[href*="signin"], button:contains("Sign In")');
  const signUpBtn = document.querySelector('a[href*="signup"], button:contains("Sign Up")');
  const hasAuthElements = !!(signInBtn || signUpBtn);
  logTest('Authentication Elements', hasAuthElements, hasAuthElements ? 'Auth buttons found' : 'No auth buttons found');
  return hasAuthElements;
}

// Test 4: Check for leaderboard elements
function testLeaderboardElements() {
  const leaderboardLink = document.querySelector('a[href*="leaderboard"]');
  const hasLeaderboard = !!leaderboardLink;
  logTest('Leaderboard Elements', hasLeaderboard, hasLeaderboard ? 'Leaderboard link found' : 'No leaderboard link found');
  return hasLeaderboard;
}

// Test 5: Check for test elements
function testTestElements() {
  const testsLink = document.querySelector('a[href*="tests"]');
  const hasTests = !!testsLink;
  logTest('Test Elements', hasTests, hasTests ? 'Tests link found' : 'No tests link found');
  return hasTests;
}

// Test 6: Check for profile elements
function testProfileElements() {
  const profileLink = document.querySelector('a[href*="profile"]');
  const hasProfile = !!profileLink;
  logTest('Profile Elements', hasProfile, hasProfile ? 'Profile link found' : 'No profile link found');
  return hasProfile;
}

// Test 7: Check for responsive design
function testResponsiveDesign() {
  const viewport = document.querySelector('meta[name="viewport"]');
  const hasViewport = !!viewport;
  logTest('Responsive Design', hasViewport, hasViewport ? 'Viewport meta tag found' : 'No viewport meta tag found');
  return hasViewport;
}

// Test 8: Check for performance optimizations
function testPerformanceOptimizations() {
  const dynamicImports = document.querySelectorAll('script[src*="chunks"]');
  const hasDynamicImports = dynamicImports.length > 0;
  logTest('Performance Optimizations', hasDynamicImports, `Found ${dynamicImports.length} dynamic imports`);
  return hasDynamicImports;
}

// Test 9: Check for error handling
function testErrorHandling() {
  const errorBoundary = document.querySelector('[data-error-boundary]');
  const hasErrorHandling = !!errorBoundary;
  logTest('Error Handling', hasErrorHandling, hasErrorHandling ? 'Error boundary found' : 'No error boundary found');
  return hasErrorHandling;
}

// Test 10: Check for accessibility
function testAccessibility() {
  const ariaLabels = document.querySelectorAll('[aria-label]');
  const hasAccessibility = ariaLabels.length > 0;
  logTest('Accessibility', hasAccessibility, `Found ${ariaLabels.length} aria-labels`);
  return hasAccessibility;
}

// Test 11: Check for dark mode support
function testDarkMode() {
  const darkModeScript = document.querySelector('script:contains("dark")');
  const hasDarkMode = !!darkModeScript;
  logTest('Dark Mode Support', hasDarkMode, hasDarkMode ? 'Dark mode script found' : 'No dark mode script found');
  return hasDarkMode;
}

// Test 12: Check for SEO elements
function testSEOElements() {
  const metaDescription = document.querySelector('meta[name="description"]');
  const hasSEO = !!metaDescription;
  logTest('SEO Elements', hasSEO, hasSEO ? 'Meta description found' : 'No meta description found');
  return hasSEO;
}

// Test 13: Check for favicon
function testFavicon() {
  const favicon = document.querySelector('link[rel="icon"]');
  const hasFavicon = !!favicon;
  logTest('Favicon', hasFavicon, hasFavicon ? 'Favicon found' : 'No favicon found');
  return hasFavicon;
}

// Test 14: Check for loading states
function testLoadingStates() {
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="skeleton"]');
  const hasLoadingStates = loadingElements.length > 0;
  logTest('Loading States', hasLoadingStates, `Found ${loadingElements.length} loading elements`);
  return hasLoadingStates;
}

// Test 15: Check for form validation
function testFormValidation() {
  const forms = document.querySelectorAll('form');
  const hasForms = forms.length > 0;
  logTest('Form Validation', hasForms, `Found ${forms.length} forms`);
  return hasForms;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Frontend Tests...\n');
  
  testApplicationLoad();
  testNavigation();
  testAuthElements();
  testLeaderboardElements();
  testTestElements();
  testProfileElements();
  testResponsiveDesign();
  testPerformanceOptimizations();
  testErrorHandling();
  testAccessibility();
  testDarkMode();
  testSEOElements();
  testFavicon();
  testLoadingStates();
  testFormValidation();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Print failed tests
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
  }
  
  return testResults;
}

// Manual testing functions
function testPageNavigation() {
  console.log('🧭 Testing Page Navigation...');
  
  const links = document.querySelectorAll('a[href^="/"]');
  console.log(`Found ${links.length} internal links`);
  
  links.forEach((link, index) => {
    if (index < 10) { // Test first 10 links
      console.log(`  ${index + 1}. ${link.href} - ${link.textContent.trim()}`);
    }
  });
}

function testUserInteraction() {
  console.log('👆 Testing User Interactions...');
  
  const buttons = document.querySelectorAll('button');
  const inputs = document.querySelectorAll('input');
  const forms = document.querySelectorAll('form');
  
  console.log(`Found ${buttons.length} buttons, ${inputs.length} inputs, ${forms.length} forms`);
}

// Export for use in browser console
window.runFrontendTests = runAllTests;
window.testPageNavigation = testPageNavigation;
window.testUserInteraction = testUserInteraction;

console.log('📝 Testing functions loaded. Run runFrontendTests() to start testing.'); 