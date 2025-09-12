#!/usr/bin/env node

/**
 * Fix API Runtime Script
 * 
 * This script adds `export const runtime = 'nodejs';` to all API route files
 * to fix Edge Runtime errors in Next.js 15 with Supabase and Redis.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API route files
const routeFiles = glob.sync('app/api/**/route.ts', { cwd: __dirname + '/..' });

console.log(`🔧 Found ${routeFiles.length} API route files to fix...`);

let fixedCount = 0;
let skippedCount = 0;

routeFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if runtime export already exists
    if (content.includes("export const runtime = 'nodejs'")) {
      console.log(`⏭️  Skipping ${filePath} - already has runtime export`);
      skippedCount++;
      return;
    }
    
    // Add runtime export after imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ') && lines[i].includes('require(')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        // Skip empty lines after imports
        continue;
      } else if (insertIndex > 0 && lines[i].trim() !== '') {
        break;
      }
    }
    
    // Insert runtime export
    lines.splice(insertIndex, 0, '', "// Force Node.js runtime for API routes", "export const runtime = 'nodejs';", '');
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`✅ Fixed ${filePath}`);
    fixedCount++;
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ⏭️  Skipped: ${skippedCount} files`);
console.log(`   📁 Total: ${routeFiles.length} files`);

if (fixedCount > 0) {
  console.log(`\n🎉 Successfully added Node.js runtime export to ${fixedCount} API routes!`);
  console.log(`   This will fix Edge Runtime errors with Supabase and Redis.`);
}
