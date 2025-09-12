/**
 * K6 Load Testing Configuration for CodeUnia
 * 
 * This script simulates 1000+ concurrent users hitting critical endpoints:
 * - Registration flow
 * - Login flow  
 * - Event fetching
 * - API endpoints
 * 
 * Usage:
 * 1. Install K6: https://k6.io/docs/getting-started/installation/
 * 2. Run: k6 run tests/load/k6-load-test.js
 * 3. For high load: k6 run --vus 1000 --duration 5m tests/load/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const cacheHitRate = new Counter('cache_hits');
const cacheMissRate = new Counter('cache_misses');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const VUS = parseInt(__ENV.VUS) || 100;
const DURATION = __ENV.DURATION || '2m';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '3m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
    error_rate: ['rate<0.05'],         // Custom error rate under 5%
    response_time: ['p(90)<1500'],     // 90% of requests under 1.5s
  },
};

// Test data
const testUsers = [
  { email: 'test1@codeunia.com', password: 'Test123!@#' },
  { email: 'test2@codeunia.com', password: 'Test123!@#' },
  { email: 'test3@codeunia.com', password: 'Test123!@#' },
  { email: 'test4@codeunia.com', password: 'Test123!@#' },
  { email: 'test5@codeunia.com', password: 'Test123!@#' },
];

const testEvents = [
  'hackathon-2024',
  'ai-workshop-2024',
  'web-dev-bootcamp',
  'data-science-summit',
  'blockchain-conference',
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const event = testEvents[Math.floor(Math.random() * testEvents.length)];
  
  // Test 1: Registration Flow (High Load)
  testRegistrationFlow(user);
  sleep(1);
  
  // Test 2: Login Flow
  testLoginFlow(user);
  sleep(1);
  
  // Test 3: Event Fetching (Cache Testing)
  testEventFetching();
  sleep(1);
  
  // Test 4: API Endpoints
  testAPIEndpoints();
  sleep(1);
  
  // Test 5: Protected Routes
  testProtectedRoutes();
  sleep(2);
}

function testRegistrationFlow(user) {
  const payload = {
    email: `${user.email}_${Date.now()}`,
    password: user.password,
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    company: 'Test Company',
    current_position: 'Developer'
  };
  
  const response = http.post(`${BASE_URL}/api/register`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(response, {
    'registration status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'registration response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  // Check cache headers
  if (response.headers['X-Cache-Strategy']) {
    cacheHitRate.add(1);
  } else {
    cacheMissRate.add(1);
  }
}

function testLoginFlow(user) {
  const payload = {
    email: user.email,
    password: user.password,
  };
  
  const response = http.post(`${BASE_URL}/api/auth/signin`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(response, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'login response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
}

function testEventFetching() {
  // Test events API with caching
  const response = http.get(`${BASE_URL}/api/events`);
  
  const success = check(response, {
    'events status is 200': (r) => r.status === 200,
    'events response time < 1s': (r) => r.timings.duration < 1000,
    'events has data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.events && Array.isArray(data.events);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  // Check cache performance
  if (response.headers['X-Cache-Strategy']) {
    cacheHitRate.add(1);
  } else {
    cacheMissRate.add(1);
  }
}

function testAPIEndpoints() {
  const endpoints = [
    '/api/hackathons',
    '/api/leaderboard',
    '/api/tests/public',
    '/api/events/featured',
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${BASE_URL}${endpoint}`);
  
  const success = check(response, {
    'API status is 200': (r) => r.status === 200,
    'API response time < 1.5s': (r) => r.timings.duration < 1500,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
}

function testProtectedRoutes() {
  // Test protected routes (should return 401 without auth)
  const protectedRoutes = [
    '/api/user/registrations',
    '/api/user/events',
    '/protected/profile',
  ];
  
  const route = protectedRoutes[Math.floor(Math.random() * protectedRoutes.length)];
  const response = http.get(`${BASE_URL}${route}`);
  
  const success = check(response, {
    'protected route returns 401': (r) => r.status === 401,
    'protected route response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
}

export function handleSummary(data) {
  const metrics = data.metrics || {};
  const thresholds = data.thresholds || {};
  
  return {
    'load-test-results.json': JSON.stringify({
      timestamp: new Date().toISOString(),
      test_config: {
        base_url: BASE_URL,
        virtual_users: VUS,
        duration: DURATION,
      },
      metrics: {
        total_requests: metrics.http_reqs?.values?.count || 0,
        failed_requests: metrics.http_req_failed?.values?.count || 0,
        error_rate: metrics.error_rate?.values?.rate || 0,
        avg_response_time: metrics.http_req_duration?.values?.avg || 0,
        p95_response_time: metrics.http_req_duration?.values?.['p(95)'] || 0,
        cache_hits: metrics.cache_hits?.values?.count || 0,
        cache_misses: metrics.cache_misses?.values?.count || 0,
        cache_hit_rate: (metrics.cache_hits?.values?.count || 0) / 
                       ((metrics.cache_hits?.values?.count || 0) + (metrics.cache_misses?.values?.count || 0)) || 0,
      },
      thresholds: {
        response_time_p95: thresholds['http_req_duration']?.ok || false,
        error_rate: thresholds['http_req_failed']?.ok || false,
        custom_error_rate: thresholds['error_rate']?.ok || false,
      },
      summary: {
        passed: Object.values(thresholds).every(t => t.ok),
        total_checks: Object.keys(thresholds).length,
        passed_checks: Object.values(thresholds).filter(t => t.ok).length,
      }
    }, null, 2),
  };
}
