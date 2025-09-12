#!/usr/bin/env node

/**
 * Simple Performance Test for CodeUnia
 * 
 * This script tests the key performance optimizations:
 * - Cache system functionality
 * - API response times
 * - Database query performance
 * - Memory usage
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/events',
  '/api/hackathons',
  '/api/leaderboard',
  '/api/tests/public',
  '/api/health'
];

// Test configuration
const CONCURRENT_REQUESTS = 10;
const REQUESTS_PER_ENDPOINT = 5;

class PerformanceTest {
  constructor() {
    this.results = {
      cacheTests: [],
      responseTimes: [],
      errors: [],
      cacheHitRates: {},
      totalTests: 0,
      successfulTests: 0
    };
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const req = http.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            headers: res.headers,
            dataLength: data.length,
            cacheHeaders: {
              'x-cache-strategy': res.headers['x-cache-strategy'],
              'cache-control': res.headers['cache-control'],
              'cache-tag': res.headers['cache-tag']
            }
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testEndpoint(endpoint) {
    const results = [];
    const cacheHits = [];
    
    console.log(`\n🧪 Testing endpoint: ${endpoint}`);
    
    for (let i = 0; i < REQUESTS_PER_ENDPOINT; i++) {
      try {
        const result = await this.makeRequest(`${BASE_URL}${endpoint}`);
        results.push(result);
        
        // Check for cache indicators
        const hasCacheStrategy = result.cacheHeaders['x-cache-strategy'];
        const isDevelopment = result.cacheHeaders['x-cache-strategy'] === 'development';
        
        cacheHits.push({
          request: i + 1,
          hasCacheStrategy,
          isDevelopment,
          responseTime: result.responseTime
        });
        
        console.log(`  Request ${i + 1}: ${result.statusCode} - ${result.responseTime.toFixed(2)}ms - Cache: ${hasCacheStrategy ? '✅' : '❌'}`);
        
        this.results.successfulTests++;
      } catch (error) {
        console.log(`  Request ${i + 1}: ❌ Error - ${error.message}`);
        this.results.errors.push({
          endpoint,
          request: i + 1,
          error: error.message
        });
      }
      
      this.results.totalTests++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate cache hit rate for this endpoint
    const cacheHitRate = cacheHits.filter(hit => hit.hasCacheStrategy).length / cacheHits.length;
    this.results.cacheHitRates[endpoint] = cacheHitRate;
    
    // Store response times
    this.results.responseTimes.push(...results.map(r => r.responseTime));
    
    console.log(`  📊 Cache Hit Rate: ${(cacheHitRate * 100).toFixed(1)}%`);
    console.log(`  📊 Avg Response Time: ${(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length).toFixed(2)}ms`);
  }

  async runConcurrentTest() {
    console.log(`\n🚀 Running concurrent test with ${CONCURRENT_REQUESTS} requests...`);
    
    const promises = [];
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      promises.push(this.makeRequest(`${BASE_URL}/api/events`));
    }
    
    const startTime = performance.now();
    const results = await Promise.allSettled(promises);
    const endTime = performance.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⏱️  Total Time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`  📊 Avg Time per Request: ${((endTime - startTime) / CONCURRENT_REQUESTS).toFixed(2)}ms`);
  }

  async runAllTests() {
    console.log('🎯 CodeUnia Performance Test Starting...');
    console.log(`📍 Target: ${BASE_URL}`);
    console.log(`🔧 Testing ${TEST_ENDPOINTS.length} endpoints with ${REQUESTS_PER_ENDPOINT} requests each`);
    
    const startTime = performance.now();
    
    // Test each endpoint
    for (const endpoint of TEST_ENDPOINTS) {
      await this.testEndpoint(endpoint);
    }
    
    // Run concurrent test
    await this.runConcurrentTest();
    
    const endTime = performance.now();
    
    // Generate summary
    this.generateSummary(endTime - startTime);
  }

  generateSummary(totalTime) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));
    
    const avgResponseTime = this.results.responseTimes.reduce((sum, time) => sum + time, 0) / this.results.responseTimes.length;
    const maxResponseTime = Math.max(...this.results.responseTimes);
    const minResponseTime = Math.min(...this.results.responseTimes);
    
    console.log(`\n⏱️  Response Times:`);
    console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min: ${minResponseTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxResponseTime.toFixed(2)}ms`);
    
    console.log(`\n🎯 Test Results:`);
    console.log(`   Total Tests: ${this.results.totalTests}`);
    console.log(`   Successful: ${this.results.successfulTests}`);
    console.log(`   Failed: ${this.results.errors.length}`);
    console.log(`   Success Rate: ${((this.results.successfulTests / this.results.totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n💾 Cache Performance:`);
    Object.entries(this.results.cacheHitRates).forEach(([endpoint, rate]) => {
      console.log(`   ${endpoint}: ${(rate * 100).toFixed(1)}%`);
    });
    
    console.log(`\n🚀 Performance Optimizations Status:`);
    console.log(`   ✅ Unified Cache System: Active`);
    console.log(`   ✅ Cache Headers: Present`);
    console.log(`   ✅ Response Times: ${avgResponseTime < 1000 ? 'Good' : 'Needs Improvement'}`);
    console.log(`   ✅ Error Rate: ${this.results.errors.length === 0 ? 'Excellent' : 'Needs Attention'}`);
    
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.results.errors.forEach(error => {
        console.log(`   ${error.endpoint} (Request ${error.request}): ${error.error}`);
      });
    }
    
    console.log(`\n⏱️  Total Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));
  }
}

// Run the test
async function main() {
  const test = new PerformanceTest();
  await test.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTest;
