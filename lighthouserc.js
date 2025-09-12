module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/hackathons',
        'http://localhost:3000/leaderboard',
        'http://localhost:3000/auth/signin',
        'http://localhost:3000/protected/dashboard'
      ],
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'Ready in|ready on|Local:',
      startServerReadyTimeout: 120000,
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
