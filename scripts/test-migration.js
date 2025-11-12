#!/usr/bin/env node

/**
 * Test Migration Script
 * 
 * This script tests the migration logic without actually executing it.
 * It validates the migration script structure and configuration.
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing CodeUnia Migration Script\n')

// Test 1: Check if migration files exist
console.log('📋 Test 1: Checking migration files...')
const sqlMigrationPath = path.join(__dirname, '../supabase/migrations/20241111000002_migrate_existing_events_to_codeunia.sql')
const jsMigrationPath = path.join(__dirname, 'migrate-codeunia-company.js')
const readmePath = path.join(__dirname, 'MIGRATION_README.md')

const files = [
  { path: sqlMigrationPath, name: 'SQL Migration' },
  { path: jsMigrationPath, name: 'JS Migration Script' },
  { path: readmePath, name: 'Migration README' },
]

let allFilesExist = true
files.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`  ✅ ${file.name} exists`)
  } else {
    console.log(`  ❌ ${file.name} missing`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Test failed: Some migration files are missing')
  process.exit(1)
}

// Test 2: Validate SQL migration structure
console.log('\n📋 Test 2: Validating SQL migration structure...')
const sqlContent = fs.readFileSync(sqlMigrationPath, 'utf8')

const requiredSqlSections = [
  'CREATE CODEUNIA COMPANY',
  'MIGRATE EXISTING EVENTS',
  'MIGRATE EXISTING HACKATHONS',
  'UPDATE CODEUNIA COMPANY STATISTICS',
  'VERIFY DATA INTEGRITY',
  'CREATE SUMMARY REPORT',
]

let allSectionsPresent = true
requiredSqlSections.forEach(section => {
  if (sqlContent.includes(section)) {
    console.log(`  ✅ Section "${section}" found`)
  } else {
    console.log(`  ❌ Section "${section}" missing`)
    allSectionsPresent = false
  }
})

if (!allSectionsPresent) {
  console.log('\n❌ Test failed: SQL migration is missing required sections')
  process.exit(1)
}

// Test 3: Validate JS migration exports
console.log('\n📋 Test 3: Validating JS migration exports...')
try {
  const migration = require('./migrate-codeunia-company.js')
  
  const requiredExports = [
    'runMigration',
    'createCodeUniaCompany',
    'migrateEvents',
    'migrateHackathons',
    'updateCompanyStatistics',
    'verifyDataIntegrity',
    'generateSummaryReport',
  ]
  
  let allExportsPresent = true
  requiredExports.forEach(exportName => {
    if (typeof migration[exportName] === 'function') {
      console.log(`  ✅ Export "${exportName}" found`)
    } else {
      console.log(`  ❌ Export "${exportName}" missing or not a function`)
      allExportsPresent = false
    }
  })
  
  if (!allExportsPresent) {
    console.log('\n❌ Test failed: JS migration is missing required exports')
    process.exit(1)
  }
} catch (error) {
  console.log(`  ❌ Failed to load migration script: ${error.message}`)
  console.log('\n❌ Test failed: Could not load JS migration')
  process.exit(1)
}

// Test 4: Validate CodeUnia company data
console.log('\n📋 Test 4: Validating CodeUnia company data...')
const jsContent = fs.readFileSync(jsMigrationPath, 'utf8')

const requiredCompanyFields = [
  'slug: \'codeunia\'',
  'name: \'CodeUnia\'',
  'verification_status: \'verified\'',
  'subscription_tier: \'enterprise\'',
  'status: \'active\'',
]

let allFieldsPresent = true
requiredCompanyFields.forEach(field => {
  if (jsContent.includes(field)) {
    console.log(`  ✅ Company field "${field}" found`)
  } else {
    console.log(`  ❌ Company field "${field}" missing`)
    allFieldsPresent = false
  }
})

if (!allFieldsPresent) {
  console.log('\n❌ Test failed: CodeUnia company data is incomplete')
  process.exit(1)
}

// Test 5: Check SQL migration for key operations
console.log('\n📋 Test 5: Checking SQL migration operations...')

const requiredOperations = [
  'INSERT INTO companies',
  'UPDATE events',
  'UPDATE hackathons',
  'is_codeunia_event = true',
  'approval_status',
  'INSERT INTO event_moderation_log',
]

let allOperationsPresent = true
requiredOperations.forEach(operation => {
  if (sqlContent.includes(operation)) {
    console.log(`  ✅ Operation "${operation}" found`)
  } else {
    console.log(`  ❌ Operation "${operation}" missing`)
    allOperationsPresent = false
  }
})

if (!allOperationsPresent) {
  console.log('\n❌ Test failed: SQL migration is missing required operations')
  process.exit(1)
}

// Test 6: Validate README completeness
console.log('\n📋 Test 6: Validating README documentation...')
const readmeContent = fs.readFileSync(readmePath, 'utf8')

const requiredReadmeSections = [
  '## Overview',
  '## Migration Methods',
  '## Prerequisites',
  '## Running the Migration',
  '## Rollback',
  '## Troubleshooting',
  '## Post-Migration Checklist',
]

let allReadmeSectionsPresent = true
requiredReadmeSections.forEach(section => {
  if (readmeContent.includes(section)) {
    console.log(`  ✅ README section "${section}" found`)
  } else {
    console.log(`  ❌ README section "${section}" missing`)
    allReadmeSectionsPresent = false
  }
})

if (!allReadmeSectionsPresent) {
  console.log('\n❌ Test failed: README is missing required sections')
  process.exit(1)
}

// All tests passed
console.log('\n╔════════════════════════════════════════════════════════════╗')
console.log('║                  ALL TESTS PASSED ✅                       ║')
console.log('╠════════════════════════════════════════════════════════════╣')
console.log('║ The migration script is ready to use!                     ║')
console.log('║                                                            ║')
console.log('║ To run the migration:                                      ║')
console.log('║   • SQL: npx supabase db push                              ║')
console.log('║   • JS:  node scripts/migrate-codeunia-company.js          ║')
console.log('║                                                            ║')
console.log('║ For more information, see:                                 ║')
console.log('║   scripts/MIGRATION_README.md                              ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

process.exit(0)
