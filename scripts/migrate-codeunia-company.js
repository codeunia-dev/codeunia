#!/usr/bin/env node

/**
 * CodeUnia Company Migration Script
 * 
 * This script migrates existing events and hackathons to the CodeUnia company.
 * It performs the following operations:
 * 1. Creates the CodeUnia company record
 * 2. Migrates all existing events to CodeUnia company
 * 3. Migrates all existing hackathons to CodeUnia company
 * 4. Sets is_codeunia_event flag for existing events
 * 5. Sets approval_status to approved for existing events
 * 6. Verifies data integrity after migration
 * 
 * Usage:
 *   node scripts/migrate-codeunia-company.js
 * 
 * Environment Variables Required:
 *   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// CodeUnia company data
const CODEUNIA_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
const CODEUNIA_COMPANY = {
  id: CODEUNIA_COMPANY_ID,
  slug: 'codeunia',
  name: 'CodeUnia',
  legal_name: 'CodeUnia Technologies',
  email: 'contact@codeunia.com',
  website: 'https://codeunia.com',
  industry: 'Education Technology',
  company_size: 'startup',
  description: 'CodeUnia is a platform that connects developers, students, and companies through hackathons, events, and learning opportunities. We empower the next generation of developers by providing access to quality education, mentorship, and real-world projects.',
  linkedin_url: 'https://linkedin.com/company/codeunia',
  twitter_url: 'https://twitter.com/codeunia',
  logo_url: '/images/codeunia-logo.png',
  banner_url: '/images/codeunia-banner.png',
  verification_status: 'verified',
  verified_at: new Date().toISOString(),
  subscription_tier: 'enterprise',
  status: 'active',
}

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('   Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Log with timestamp
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '📍'
  }[type] || 'ℹ️'
  
  console.log(`[${timestamp}] ${prefix} ${message}`)
}

/**
 * Step 1: Create or update CodeUnia company
 */
async function createCodeUniaCompany() {
  log('Creating CodeUnia company...', 'step')
  
  try {
    // Check if company already exists
    const { data: existing, error: checkError } = await supabase
      .from('companies')
      .select('id, slug, name')
      .eq('slug', 'codeunia')
      .single()
    
    if (existing) {
      log(`CodeUnia company already exists (ID: ${existing.id})`, 'info')
      return existing.id
    }
    
    // Create new company
    const { data, error } = await supabase
      .from('companies')
      .insert([CODEUNIA_COMPANY])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create company: ${error.message}`)
    }
    
    log(`CodeUnia company created successfully (ID: ${data.id})`, 'success')
    return data.id
  } catch (error) {
    log(`Error creating CodeUnia company: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Step 2: Migrate existing events to CodeUnia
 */
async function migrateEvents(companyId) {
  log('Migrating existing events to CodeUnia...', 'step')
  
  try {
    // Count events without company_id
    const { count: orphanedCount, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .is('company_id', null)
    
    if (countError) {
      throw new Error(`Failed to count events: ${countError.message}`)
    }
    
    log(`Found ${orphanedCount} events to migrate`, 'info')
    
    if (orphanedCount === 0) {
      log('No events to migrate', 'info')
      return 0
    }
    
    // Update events
    const { data, error } = await supabase
      .from('events')
      .update({
        company_id: companyId,
        is_codeunia_event: true,
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .is('company_id', null)
      .select('id')
    
    if (error) {
      throw new Error(`Failed to migrate events: ${error.message}`)
    }
    
    const migratedCount = data?.length || 0
    log(`Migrated ${migratedCount} events to CodeUnia company`, 'success')
    return migratedCount
  } catch (error) {
    log(`Error migrating events: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Step 3: Migrate existing hackathons to CodeUnia
 */
async function migrateHackathons(companyId) {
  log('Migrating existing hackathons to CodeUnia...', 'step')
  
  try {
    // Count hackathons without company_id
    const { count: orphanedCount, error: countError } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .is('company_id', null)
    
    if (countError) {
      throw new Error(`Failed to count hackathons: ${countError.message}`)
    }
    
    log(`Found ${orphanedCount} hackathons to migrate`, 'info')
    
    if (orphanedCount === 0) {
      log('No hackathons to migrate', 'info')
      return 0
    }
    
    // Update hackathons
    const { data, error } = await supabase
      .from('hackathons')
      .update({
        company_id: companyId,
        is_codeunia_event: true,
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .is('company_id', null)
      .select('id')
    
    if (error) {
      throw new Error(`Failed to migrate hackathons: ${error.message}`)
    }
    
    const migratedCount = data?.length || 0
    log(`Migrated ${migratedCount} hackathons to CodeUnia company`, 'success')
    return migratedCount
  } catch (error) {
    log(`Error migrating hackathons: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Step 4: Update company statistics
 */
async function updateCompanyStatistics(companyId) {
  log('Updating CodeUnia company statistics...', 'step')
  
  try {
    // Count approved events
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('approval_status', 'approved')
    
    if (eventsError) {
      throw new Error(`Failed to count events: ${eventsError.message}`)
    }
    
    // Count approved hackathons
    const { count: hackathonsCount, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('approval_status', 'approved')
    
    if (hackathonsError) {
      throw new Error(`Failed to count hackathons: ${hackathonsError.message}`)
    }
    
    // Update company statistics
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        total_events: eventsCount || 0,
        total_hackathons: hackathonsCount || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
    
    if (updateError) {
      throw new Error(`Failed to update statistics: ${updateError.message}`)
    }
    
    log(`Updated statistics: ${eventsCount} events, ${hackathonsCount} hackathons`, 'success')
    return { eventsCount, hackathonsCount }
  } catch (error) {
    log(`Error updating statistics: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Step 5: Verify data integrity
 */
async function verifyDataIntegrity(companyId) {
  log('Verifying data integrity...', 'step')
  
  const issues = []
  
  try {
    // Check for orphaned events
    const { count: orphanedEvents, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .is('company_id', null)
    
    if (eventsError) {
      throw new Error(`Failed to check orphaned events: ${eventsError.message}`)
    }
    
    if (orphanedEvents > 0) {
      issues.push(`Found ${orphanedEvents} orphaned events`)
    }
    
    // Check for orphaned hackathons
    const { count: orphanedHackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*', { count: 'exact', head: true })
      .is('company_id', null)
    
    if (hackathonsError) {
      throw new Error(`Failed to check orphaned hackathons: ${hackathonsError.message}`)
    }
    
    if (orphanedHackathons > 0) {
      issues.push(`Found ${orphanedHackathons} orphaned hackathons`)
    }
    
    // Check for events with incorrect flags
    const { count: incorrectFlags, error: flagsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_codeunia_event', false)
    
    if (flagsError) {
      throw new Error(`Failed to check event flags: ${flagsError.message}`)
    }
    
    if (incorrectFlags > 0) {
      issues.push(`Found ${incorrectFlags} events with incorrect is_codeunia_event flag`)
    }
    
    // Check for events with incorrect approval status
    const { count: incorrectStatus, error: statusError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .neq('approval_status', 'approved')
    
    if (statusError) {
      throw new Error(`Failed to check approval status: ${statusError.message}`)
    }
    
    if (incorrectStatus > 0) {
      issues.push(`Found ${incorrectStatus} events with incorrect approval_status`)
    }
    
    // Report results
    if (issues.length > 0) {
      log('Data integrity issues found:', 'warning')
      issues.forEach(issue => log(`  - ${issue}`, 'warning'))
      return false
    } else {
      log('Data integrity verification PASSED', 'success')
      return true
    }
  } catch (error) {
    log(`Error verifying data integrity: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Step 6: Generate summary report
 */
async function generateSummaryReport(companyId) {
  log('Generating summary report...', 'step')
  
  try {
    // Get company information
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()
    
    if (companyError) {
      throw new Error(`Failed to get company: ${companyError.message}`)
    }
    
    // Get events summary
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, approval_status, is_codeunia_event')
      .eq('company_id', companyId)
    
    if (eventsError) {
      throw new Error(`Failed to get events: ${eventsError.message}`)
    }
    
    // Get hackathons summary
    const { data: hackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('id, approval_status, is_codeunia_event')
      .eq('company_id', companyId)
    
    if (hackathonsError) {
      throw new Error(`Failed to get hackathons: ${hackathonsError.message}`)
    }
    
    // Calculate statistics
    const eventsStats = {
      total: events?.length || 0,
      approved: events?.filter(e => e.approval_status === 'approved').length || 0,
      codeunia: events?.filter(e => e.is_codeunia_event).length || 0,
    }
    
    const hackathonsStats = {
      total: hackathons?.length || 0,
      approved: hackathons?.filter(h => h.approval_status === 'approved').length || 0,
      codeunia: hackathons?.filter(h => h.is_codeunia_event).length || 0,
    }
    
    // Print summary report
    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║         MIGRATION SUMMARY REPORT                           ║')
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log(`║ Company: ${company.name.padEnd(49)}║`)
    console.log(`║ Verification Status: ${company.verification_status.padEnd(37)}║`)
    console.log(`║ Subscription Tier: ${company.subscription_tier.padEnd(39)}║`)
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log('║ EVENTS                                                     ║')
    console.log(`║   Total Events: ${String(eventsStats.total).padStart(42)}║`)
    console.log(`║   Approved Events: ${String(eventsStats.approved).padStart(39)}║`)
    console.log(`║   CodeUnia Events: ${String(eventsStats.codeunia).padStart(39)}║`)
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log('║ HACKATHONS                                                 ║')
    console.log(`║   Total Hackathons: ${String(hackathonsStats.total).padStart(39)}║`)
    console.log(`║   Approved Hackathons: ${String(hackathonsStats.approved).padStart(36)}║`)
    console.log(`║   CodeUnia Hackathons: ${String(hackathonsStats.codeunia).padStart(36)}║`)
    console.log('╠════════════════════════════════════════════════════════════╣')
    console.log('║ STATISTICS                                                 ║')
    console.log(`║   Total Registrations: ${String(company.total_registrations || 0).padStart(36)}║`)
    console.log('╚════════════════════════════════════════════════════════════╝\n')
    
    return {
      company,
      events: eventsStats,
      hackathons: hackathonsStats,
    }
  } catch (error) {
    log(`Error generating summary: ${error.message}`, 'error')
    throw error
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('\n🚀 Starting CodeUnia Company Migration\n')
  
  try {
    // Step 1: Create CodeUnia company
    const companyId = await createCodeUniaCompany()
    
    // Step 2: Migrate events
    const eventsCount = await migrateEvents(companyId)
    
    // Step 3: Migrate hackathons
    const hackathonsCount = await migrateHackathons(companyId)
    
    // Step 4: Update statistics
    await updateCompanyStatistics(companyId)
    
    // Step 5: Verify data integrity
    const integrityPassed = await verifyDataIntegrity(companyId)
    
    // Step 6: Generate summary report
    await generateSummaryReport(companyId)
    
    // Final status
    if (integrityPassed) {
      log('Migration completed successfully! ✨', 'success')
      process.exit(0)
    } else {
      log('Migration completed with warnings. Please review the issues above.', 'warning')
      process.exit(1)
    }
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'error')
    console.error(error)
    process.exit(1)
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration()
}

module.exports = {
  runMigration,
  createCodeUniaCompany,
  migrateEvents,
  migrateHackathons,
  updateCompanyStatistics,
  verifyDataIntegrity,
  generateSummaryReport,
}
