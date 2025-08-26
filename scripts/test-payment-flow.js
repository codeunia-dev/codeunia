const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Environment check:')
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
console.log('   SUPABASE_KEY:', supabaseKey ? '✅ Present' : '❌ Missing')
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('Please ensure .env.local contains:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow Integration...\n')

  try {
    // 1. Check if payment columns exist
    console.log('1️⃣ Checking payment columns in internship_applications table...')
    const { data: columns, error: columnError } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(1)

    if (columnError) {
      console.error('❌ Error checking columns:', columnError.message)
      return
    }

    const sampleRecord = columns?.[0] || {}
    const paymentColumns = [
      'order_id', 'payment_id', 'payment_signature', 'amount_paid', 
      'currency', 'payment_status', 'is_paid', 'paid_at', 
      'original_amount', 'discount_applied'
    ]

    console.log('✅ Payment columns status:')
    paymentColumns.forEach(col => {
      const exists = sampleRecord.hasOwnProperty(col)
      console.log(`   ${exists ? '✅' : '❌'} ${col}`)
    })

    // 2. Check recent applications with payment data
    console.log('\n2️⃣ Checking recent applications with payment data...')
    const { data: recentApps, error: appsError } = await supabase
      .from('internship_applications')
      .select('id, order_id, payment_id, amount_paid, payment_status, is_paid, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (appsError) {
      console.error('❌ Error fetching applications:', appsError.message)
      return
    }

    console.log('Recent applications:', recentApps?.length || 0)
    recentApps?.forEach((app, index) => {
      console.log(`   ${index + 1}. ID: ${app.id}`)
      console.log(`      Order ID: ${app.order_id || 'null'}`)
      console.log(`      Payment ID: ${app.payment_id || 'null'}`)
      console.log(`      Amount: ₹${app.amount_paid || 'null'}`)
      console.log(`      Status: ${app.payment_status || 'null'}`)
      console.log(`      Paid: ${app.is_paid ? 'Yes' : 'No'}`)
      console.log(`      Created: ${new Date(app.created_at).toLocaleString()}`)
      console.log('')
    })

    // 3. Check for any paid applications
    console.log('3️⃣ Checking for paid applications...')
    const { data: paidApps, error: paidError } = await supabase
      .from('internship_applications')
      .select('*')
      .eq('is_paid', true)
      .order('created_at', { ascending: false })

    if (paidError) {
      console.error('❌ Error fetching paid applications:', paidError.message)
      return
    }

    console.log(`Found ${paidApps?.length || 0} paid applications`)
    if (paidApps && paidApps.length > 0) {
      paidApps.forEach((app, index) => {
        console.log(`   ${index + 1}. Application ID: ${app.id}`)
        console.log(`      Order ID: ${app.order_id}`)
        console.log(`      Payment ID: ${app.payment_id}`)
        console.log(`      Amount Paid: ₹${app.amount_paid}`)
        console.log(`      Original Amount: ₹${app.original_amount}`)
        console.log(`      Discount: ₹${app.discount_applied || 0}`)
        console.log(`      Status: ${app.payment_status}`)
        console.log('')
      })
    }

    // 4. Check premium members
    console.log('4️⃣ Checking premium members...')
    
    // Try different possible table names
    let premiumUsers = null
    let premiumError = null
    
    const possibleTables = ['user_profiles', 'profiles', 'users']
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id, username, premium_until')
          .not('premium_until', 'is', null)
          .gte('premium_until', new Date().toISOString())
          .limit(10)
        
        if (!error) {
          premiumUsers = data
          console.log(`   ✅ Found premium table: ${tableName}`)
          break
        }
      } catch (e) {
        // Try next table
      }
    }

    if (!premiumUsers) {
      console.log('   ⚠️  Could not find premium users table (trying alternative approach)')
      
      // Try to find any table with premium_until column
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        if (!authError && authUsers) {
          console.log(`   Found ${authUsers.users.length} auth users`)
        }
      } catch (e) {
        console.log('   ⚠️  Could not access auth users (permission needed)')
      }
      
      premiumUsers = []
    }

    console.log(`Found ${premiumUsers?.length || 0} active premium members`)
    premiumUsers?.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username || user.id} (expires: ${new Date(user.premium_until).toLocaleDateString()})`)
    })

    console.log('\n✅ Payment flow integration test completed!')
    console.log('\n📋 Summary:')
    console.log(`   - Payment columns: ${paymentColumns.every(col => sampleRecord.hasOwnProperty(col)) ? 'All present' : 'Some missing'}`)
    console.log(`   - Recent applications: ${recentApps?.length || 0}`)
    console.log(`   - Paid applications: ${paidApps?.length || 0}`)
    console.log(`   - Active premium members: ${premiumUsers?.length || 0}`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testPaymentFlow()
