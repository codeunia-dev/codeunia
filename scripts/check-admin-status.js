#!/usr/bin/env node

/**
 * Script to check admin status and company data
 * Run with: node scripts/check-admin-status.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminStatus() {
  console.log('🔍 Checking admin status and company data...\n')

  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_admin')
      .order('created_at', { ascending: false })
      .limit(10)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
    } else {
      console.log('👥 Recent Profiles:')
      console.table(profiles)
      
      const adminCount = profiles.filter(p => p.is_admin).length
      console.log(`\n✅ Found ${adminCount} admin(s) out of ${profiles.length} profiles\n`)
    }

    // Check companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, email, verification_status, status, created_at')
      .order('created_at', { ascending: false })

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError)
    } else {
      console.log('🏢 Companies:')
      console.table(companies)
      console.log(`\n✅ Found ${companies.length} company(ies)\n`)
    }

    // Check company_members table
    const { data: members, error: membersError } = await supabase
      .from('company_members')
      .select('id, company_id, user_id, role, status')
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error('❌ Error fetching company members:', membersError)
    } else {
      console.log('👔 Company Members:')
      console.table(members)
      console.log(`\n✅ Found ${members.length} company member(s)\n`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

async function makeUserAdmin(userEmail) {
  console.log(`\n🔧 Making ${userEmail} an admin...\n`)

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('email', userEmail)
      .select()

    if (error) {
      console.error('❌ Error updating profile:', error)
    } else if (data && data.length > 0) {
      console.log('✅ Successfully made user an admin:')
      console.table(data)
    } else {
      console.log('⚠️  No user found with that email')
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Main execution
const args = process.argv.slice(2)

if (args[0] === '--make-admin' && args[1]) {
  makeUserAdmin(args[1]).then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
} else {
  checkAdminStatus().then(() => {
    console.log('\n💡 To make a user admin, run:')
    console.log('   node scripts/check-admin-status.js --make-admin user@example.com')
    console.log('\n✅ Done!')
    process.exit(0)
  })
}
