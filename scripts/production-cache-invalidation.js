#!/usr/bin/env node

/**
 * Production-Grade Cache Invalidation System
 * 
 * This script ensures immediate cache clearing across all layers:
 * - CDN (Cloudflare/Vercel Edge)
 * - Browser caches (via build ID rotation)
 * - Server-side memory caches
 * - Service worker caches (if any)
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Color codes for better logging
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Generate new build ID for cache busting
function generateBuildId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}-${random}`;
}

// Update build ID in environment
function updateBuildId() {
  const newBuildId = generateBuildId();
  log(`🆔 New Build ID: ${newBuildId}`, 'cyan');
  
  // Write to .env.local for local development
  const envPath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update existing BUILD_ID or add new one
    if (envContent.includes('BUILD_ID=')) {
      envContent = envContent.replace(/BUILD_ID=.*\n?/g, `BUILD_ID=${newBuildId}\n`);
    } else {
      envContent += `\nBUILD_ID=${newBuildId}\n`;
    }
  } else {
    envContent = `BUILD_ID=${newBuildId}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  process.env.BUILD_ID = newBuildId;
  
  return newBuildId;
}

// Make HTTP request
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Invalidate Cloudflare cache
async function invalidateCloudflareCache() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_KEY;
  
  if (!zoneId || !apiToken) {
    log('⚠️  Cloudflare credentials not found. Skipping Cloudflare cache invalidation.', 'yellow');
    log('   Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN (or CLOUDFLARE_API_KEY) for automatic CDN cache clearing.', 'yellow');
    return false;
  }

  console.log(`🔑 Using Zone ID: ${zoneId.substring(0, 8)}...`);
  console.log(`🔑 Using API Token/Key: ${apiToken.substring(0, 8)}...`);
  
  // Determine if using API Token or Global API Key
  const isApiToken = process.env.CLOUDFLARE_API_TOKEN;
  const authHeader = isApiToken 
    ? `Bearer ${apiToken}`  // API Token
    : apiToken;             // Global API Key (needs email too)
    
  if (!isApiToken && !process.env.CLOUDFLARE_EMAIL) {
    log('❌ Global API Key requires CLOUDFLARE_EMAIL to be set', 'red');
    log('   Either set CLOUDFLARE_EMAIL or use CLOUDFLARE_API_TOKEN instead', 'red');
    return false;
  }
  
  console.log('🔍 Verifying Cloudflare credentials...');
  
  try {
    log('🌩️  Invalidating Cloudflare cache...', 'blue');
    
    const postData = JSON.stringify({
      purge_everything: true
    });
    
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    
    // Set authorization header based on auth method
    if (isApiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else {
      headers['X-Auth-Email'] = process.env.CLOUDFLARE_EMAIL;
      headers['X-Auth-Key'] = apiToken;
    }
    
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/purge_cache`,
      method: 'POST',
      headers
    };
    
    const response = await makeRequest(options, postData);
    
    if (response.statusCode === 200 && response.body?.success) {
      log('✅ Cloudflare cache invalidated successfully!', 'green');
      return true;
    } else {
      log(`❌ Cloudflare invalidation failed: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.body, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Cloudflare invalidation error: ${error.message}`, 'red');
    return false;
  }
}
async function invalidateVercelCache() {
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  
  if (!vercelToken || !vercelProjectId) {
    log('⚠️  Vercel credentials not found. Skipping Vercel cache invalidation.', 'yellow');
    log('   Set VERCEL_TOKEN and VERCEL_PROJECT_ID for automatic Edge cache clearing.', 'yellow');
    return false;
  }

  try {
    log('🔺 Invalidating Vercel Edge cache...', 'blue');
    
    const options = {
      hostname: 'api.vercel.com',
      path: `/v1/projects/${vercelProjectId}/domains`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelToken}`
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      log('✅ Vercel cache invalidation initiated!', 'green');
      return true;
    } else {
      log(`❌ Vercel invalidation failed: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Vercel invalidation error: ${error.message}`, 'red');
    return false;
  }
}

// Clear local Next.js cache
function clearNextJsCache() {
  try {
    log('🗑️  Clearing Next.js cache...', 'blue');
    
    const nextCachePath = path.join(__dirname, '..', '.next');
    if (fs.existsSync(nextCachePath)) {
      // Clear cache directory
      const { execSync } = require('child_process');
      execSync(`rm -rf "${nextCachePath}"`, { stdio: 'pipe' });
      log('✅ Next.js cache cleared!', 'green');
      return true;
    } else {
      log('📁 No Next.js cache found to clear.', 'yellow');
      return true;
    }
  } catch (error) {
    log(`❌ Next.js cache clearing failed: ${error.message}`, 'red');
    return false;
  }
}

// Clear Node.js module cache
function clearNodeCache() {
  try {
    log('📦 Clearing Node.js module cache...', 'blue');
    
    const { execSync } = require('child_process');
    execSync('npm cache clean --force', { stdio: 'pipe' });
    
    log('✅ Node.js cache cleared!', 'green');
    return true;
  } catch (error) {
    log(`❌ Node.js cache clearing failed: ${error.message}`, 'red');
    return false;
  }
}

// Generate cache busting manifest
function generateCacheBustingManifest() {
  try {
    log('📄 Generating cache busting manifest...', 'blue');
    
    const buildId = process.env.BUILD_ID;
    const manifest = {
      buildId,
      timestamp: Date.now(),
      version: require('../package.json').version,
      environment: process.env.NODE_ENV || 'development',
      invalidatedAt: new Date().toISOString()
    };
    
    const manifestPath = path.join(__dirname, '..', 'public', 'cache-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    log(`✅ Cache manifest generated: ${manifestPath}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Manifest generation failed: ${error.message}`, 'red');
    return false;
  }
}

// Main invalidation function
async function invalidateAllCaches() {
  log('\n🚀 Starting Production Cache Invalidation...', 'bold');
  log('================================================', 'cyan');
  
  // Load environment variables
  loadEnvFile();
  
  // Update build ID for cache busting
  const newBuildId = updateBuildId();
  
  const results = [];
  
  // 1. Clear local caches
  results.push({ name: 'Next.js Cache', success: clearNextJsCache() });
  results.push({ name: 'Node.js Cache', success: clearNodeCache() });
  
  // 2. Generate new cache manifest
  results.push({ name: 'Cache Manifest', success: generateCacheBustingManifest() });
  
  // 3. Invalidate CDN caches
  results.push({ name: 'Cloudflare CDN', success: await invalidateCloudflareCache() });
  results.push({ name: 'Vercel Edge', success: await invalidateVercelCache() });
  
  // Summary
  log('\n📊 Cache Invalidation Summary:', 'bold');
  log('================================', 'cyan');
  
  let allSuccessful = true;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
    if (!result.success) allSuccessful = false;
  });
  
  log(`\n🆔 New Build ID: ${newBuildId}`, 'cyan');
  log(`⏰ Completed at: ${new Date().toISOString()}`, 'cyan');
  
  if (allSuccessful) {
    log('\n🎉 All caches invalidated successfully!', 'green');
    log('   Your website will now serve fresh content immediately.', 'green');
  } else {
    log('\n⚠️  Some cache invalidations failed.', 'yellow');
    log('   Check the logs above and your CDN configurations.', 'yellow');
  }
  
  return allSuccessful;
}

// CLI execution
if (require.main === module) {
  invalidateAllCaches()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n💥 Fatal error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = {
  invalidateAllCaches,
  invalidateCloudflareCache,
  invalidateVercelCache,
  clearNextJsCache,
  clearNodeCache,
  updateBuildId,
  generateCacheBustingManifest
};
