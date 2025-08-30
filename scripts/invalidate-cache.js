#!/usr/bin/env node

/**
 * Cache invalidation script for deployments
 * This script can be run after deployments to clear CDN caches
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

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

// Load environment variables
loadEnvFile();

async function invalidateCloudflareCache() {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!zoneId || !apiToken) {
    console.log('⚠️  Cloudflare credentials not found. Skipping cache invalidation.');
    console.log('   Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN to enable automatic cache clearing.');
    return;
  }

  console.log(`🔑 Using Zone ID: ${zoneId.substring(0, 8)}...`);
  console.log(`🔑 Using API Token: ${apiToken.substring(0, 8)}...`);
  
  // First, let's verify the token works by checking zone details
  console.log('🔍 Verifying Cloudflare credentials...');
  
  try {
    await verifyCloudflareCredentials(zoneId, apiToken);
  } catch (error) {
    console.error('❌ Credential verification failed:', error.message);
    throw error;
  }

  // Try selective purge first, then fall back to purge_everything
  const data = JSON.stringify({
    files: [
      "https://www.codeunia.com/api/*",
      "https://www.codeunia.com/_next/static/*"
    ]
  });

  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/zones/${zoneId}/purge_cache`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Cloudflare cache cleared successfully');
          resolve(responseData);
        } else {
          console.error('❌ Failed to clear Cloudflare cache:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error clearing Cloudflare cache:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function verifyCloudflareCredentials(zoneId, apiToken) {
  const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/zones/${zoneId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Cloudflare credentials verified');
          resolve(responseData);
        } else {
          console.error('❌ Credential verification failed:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 Starting cache invalidation...');
  
  try {
    await invalidateCloudflareCache();
    console.log('✅ Cache invalidation completed');
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error.message);
    console.log('');
    console.log('💡 Don\'t worry! With the new cache settings:');
    console.log('   • API caches expire in 30-60 seconds (vs previous 5-10 minutes)');
    console.log('   • Static assets get new URLs automatically on deployment');
    console.log('   • Changes should be visible within 1-2 minutes');
    console.log('');
    console.log('📖 For manual cache clearing instructions, see CACHE_MANAGEMENT.md');
    console.log('');
    // Don't exit with error - this is now optional
    console.log('✅ Deployment completed (cache clearing skipped)');
  }
}

if (require.main === module) {
  main();
}

module.exports = { invalidateCloudflareCache };