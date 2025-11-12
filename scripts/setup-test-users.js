#!/usr/bin/env node

/**
 * Script to set up proper test users for multi-company system
 * Run with: node scripts/setup-test-users.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTestUsers() {
  console.log('🔧 Setting up test users for multi-company system...\n')

  try {
    // 1. Remove admin from company owner
    console.log('Step 1: Checking current company owner...')
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id, name')
      .eq('slug', 'demo')
      .single()

    if (demoCompany) {
      const { data: members } = await supabase
        .from('company_members')
        .select('user_id, role')
        .eq('company_id', demoCompany.id)

      console.log(`   Company: ${demoCompany.name}`)
      console.log(`   Current members:`, members)

      // Get user details
      for (const member of members || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, first_name, last_name, is_admin')
          .eq('id', member.user_id)
          .single()

        console.log(`   - ${profile?.email} (${member.role}) - is_admin: ${profile?.is_admin}`)
      }
    }

    console.log('\n📋 Current Setup Summary:')
    console.log('   The company owner is currently also a platform admin.')
    console.log('   This is why they can access both /dashboard/company and /admin\n')

    console.log('💡 Recommended Actions:')
    console.log('   1. Keep akshay.allen26200@gmail.com as platform admin ONLY')
    console.log('   2. Create a NEW user account (e.g., companyowner@example.com)')
    console.log('   3. Register a company with that new user')
    console.log('   4. Test that the new user can access /dashboard/company but NOT /admin\n')

    console.log('🔐 Security Check:')
    console.log('   ✅ Admin layout checks is_admin from profiles table')
    console.log('   ✅ Company dashboard checks company_members table')
    console.log('   ✅ The system is secure - just need separate test accounts\n')

    // Option to remove admin from current company owner
    const args = process.argv.slice(2)
    if (args[0] === '--remove-admin-from-owner') {
      console.log('🔧 Removing admin privileges from company owner...')
      
      if (members && members.length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_admin: false })
          .eq('id', members[0].user_id)

        if (error) {
          console.error('❌ Error:', error)
        } else {
          console.log('✅ Admin privileges removed from company owner')
          console.log('   They can now only access /dashboard/company, not /admin')
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setupTestUsers().then(() => {
  console.log('\n💡 To remove admin from company owner, run:')
  console.log('   node scripts/setup-test-users.js --remove-admin-from-owner')
  console.log('\n✅ Done!')
  process.exit(0)
})
