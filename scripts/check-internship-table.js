const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInternshipTable() {
  console.log('🔍 CHECKING INTERNSHIP_APPLICATIONS TABLE STRUCTURE...\n');
  
  try {
    // 1. Check if table exists and get sample data
    console.log('📋 Sample data from internship_applications:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(3);
      
    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
    } else {
      console.log(`✅ Found ${sampleData?.length || 0} sample records`);
      if (sampleData && sampleData.length > 0) {
        console.log('📝 Sample record structure:');
        console.log(JSON.stringify(sampleData[0], null, 2));
        
        console.log('\n🔑 Available columns:');
        Object.keys(sampleData[0]).forEach((key, index) => {
          console.log(`${index + 1}. ${key}`);
        });
      }
    }
    
    // 2. Check for payment-related fields
    console.log('\n💳 Checking for payment-related fields...');
    const { data: allData, error: allError } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(1);
      
    if (allData && allData.length > 0) {
      const columns = Object.keys(allData[0]);
      const paymentFields = columns.filter(col => 
        col.toLowerCase().includes('order') || 
        col.toLowerCase().includes('payment') || 
        col.toLowerCase().includes('transaction') || 
        col.toLowerCase().includes('razorpay') ||
        col.toLowerCase().includes('amount') ||
        col.toLowerCase().includes('price')
      );
      
      if (paymentFields.length > 0) {
        console.log('✅ Found payment-related fields:');
        paymentFields.forEach(field => console.log(`  - ${field}`));
      } else {
        console.log('❌ No payment-related fields found');
        console.log('📝 Current columns are:');
        columns.forEach(col => console.log(`  - ${col}`));
      }
    }
    
    // 3. Check total count
    console.log('\n📊 Table statistics:');
    const { count, error: countError } = await supabase
      .from('internship_applications')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ Error getting count:', countError);
    } else {
      console.log(`📈 Total applications: ${count}`);
    }
    
    // 4. Check for different statuses
    console.log('\n📋 Application statuses:');
    const { data: statusData, error: statusError } = await supabase
      .from('internship_applications')
      .select('status')
      .limit(100);
      
    if (statusData) {
      const statuses = [...new Set(statusData.map(item => item.status))];
      console.log('🏷️  Found statuses:', statuses);
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkInternshipTable().then(() => {
  console.log('\n✅ Table check complete!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
