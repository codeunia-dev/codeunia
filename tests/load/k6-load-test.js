/**
 * K6 Load Testing Script for CodeUnia
 * Tests critical endpoints under various load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const cacheHitRate = new Counter('cache_hits');
const cacheMissRate = new Counter('cache_misses');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    error_rate: ['rate<0.05'],         // Custom error rate below 5%
  },
};

// Base URL - can be overridden with environment variable
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { username: 'testuser1', email: 'test1@example.com' },
  { username: 'testuser2', email: 'test2@example.com' },
  { username: 'testuser3', email: 'test3@example.com' },
];

const testEvents = [
  { title: 'Load Test Event 1', description: 'Test event for load testing' },
  { title: 'Load Test Event 2', description: 'Another test event' },
  { title: 'Load Test Event 3', description: 'Third test event' },
];

// Helper function to make requests with error tracking
function makeRequest(method, url, payload = null, params = {}) {
  const response = http.request(method, url, payload, params);
  
  // Track custom metrics
  errorRate.add(response.status >= 400);
  responseTime.add(response.timings.duration);
  
  return response;
}

// Test scenarios
export default function() {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const event = testEvents[Math.floor(Math.random() * testEvents.length)];
  
  // Scenario 1: Public endpoints (most common)
  testPublicEndpoints();
  
  // Scenario 2: API endpoints
  testAPIEndpoints();
  
  // Scenario 3: Authentication flow (less frequent)
  if (Math.random() < 0.3) {
    testAuthFlow(user);
  }
  
  // Scenario 4: Event operations (moderate frequency)
  if (Math.random() < 0.5) {
    testEventOperations(event);
  }
  
  sleep(1);
}

function testPublicEndpoints() {
  const endpoints = [
    '/',
    '/about',
    '/hackathons',
    '/leaderboard',
    '/opportunities',
    '/blog',
    '/contact'
  ];
  
  endpoints.forEach(endpoint => {
    const response = makeRequest('GET', `${BASE_URL}${endpoint}`);
    
    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000,
      [`${endpoint} has content`]: (r) => r.body.length > 0,
    });
    
    // Check for cache headers
    if (response.headers['x-cache'] === 'HIT') {
      cacheHitRate.add(1);
    } else if (response.headers['x-cache'] === 'MISS') {
      cacheMissRate.add(1);
    }
  });
}

function testAPIEndpoints() {
  const apiEndpoints = [
    '/api/events',
    '/api/hackathons',
    '/api/featured',
    '/api/leaderboard',
    '/api/stats',
    '/api/health'
  ];
  
  apiEndpoints.forEach(endpoint => {
    const response = makeRequest('GET', `${BASE_URL}${endpoint}`);
    
    check(response, {
      [`API ${endpoint} status is 200`]: (r) => r.status === 200,
      [`API ${endpoint} response time < 1s`]: (r) => r.timings.duration < 1000,
      [`API ${endpoint} returns JSON`]: (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
    
    // Check for API cache headers
    if (response.headers['x-api-cache'] === 'HIT') {
      cacheHitRate.add(1);
    } else if (response.headers['x-api-cache'] === 'MISS') {
      cacheMissRate.add(1);
    }
  });
}

function testAuthFlow(user) {
  // Test signup
  const signupPayload = JSON.stringify({
    email: user.email,
    password: 'testpassword123',
    username: user.username
  });
  
  const signupResponse = makeRequest('POST', `${BASE_URL}/api/auth/signup`, signupPayload, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(signupResponse, {
    'Signup response time < 3s': (r) => r.timings.duration < 3000,
    'Signup returns valid response': (r) => r.status === 200 || r.status === 400, // 400 for existing user
  });
  
  // Test signin
  const signinPayload = JSON.stringify({
    email: user.email,
    password: 'testpassword123'
  });
  
  const signinResponse = makeRequest('POST', `${BASE_URL}/api/auth/signin`, signinPayload, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(signinResponse, {
    'Signin response time < 2s': (r) => r.timings.duration < 2000,
    'Signin returns valid response': (r) => r.status === 200 || r.status === 401,
  });
}

function testEventOperations(event) {
  // Test event creation (would require auth in real scenario)
  const eventPayload = JSON.stringify({
    title: event.title,
    description: event.description,
    start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_date: new Date(Date.now() + 172800000).toISOString(),  // Day after tomorrow
    location: 'Test Location',
    max_participants: 100,
    registration_fee: 0,
    category: 'workshop'
  });
  
  const createResponse = makeRequest('POST', `${BASE_URL}/api/events`, eventPayload, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(createResponse, {
    'Event creation response time < 3s': (r) => r.timings.duration < 3000,
    'Event creation returns valid response': (r) => r.status === 200 || r.status === 401, // 401 without auth
  });
  
  // Test event listing with filters
  const listResponse = makeRequest('GET', `${BASE_URL}/api/events?page=1&limit=10&category=workshop`);
  
  check(listResponse, {
    'Event list response time < 1s': (r) => r.timings.duration < 1000,
    'Event list returns JSON': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data.events) || Array.isArray(data);
      } catch {
        return false;
      }
    },
  });
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting K6 load test for CodeUnia');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Test if the application is accessible
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`Application not accessible at ${BASE_URL}`);
  }
  
  console.log('Application is accessible, starting load test...');
  return { baseUrl: BASE_URL };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Tested against: ${data.baseUrl}`);
}