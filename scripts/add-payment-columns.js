const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPaymentColumns() {
  console.log('🛠️  ADDING PAYMENT COLUMNS TO INTERNSHIP_APPLICATIONS...\n');
  
  const columns = [
    { name: 'order_id', type: 'TEXT', description: 'Razorpay order ID' },
    { name: 'payment_id', type: 'TEXT', description: 'Razorpay payment ID' },
    { name: 'payment_signature', type: 'TEXT', description: 'Razorpay payment signature' },
    { name: 'amount_paid', type: 'INTEGER', description: 'Amount paid in paise' },
    { name: 'currency', type: 'TEXT DEFAULT \'INR\'', description: 'Payment currency' },
    { name: 'payment_status', type: 'TEXT DEFAULT \'pending\'', description: 'Payment status' },
    { name: 'is_paid', type: 'BOOLEAN DEFAULT FALSE', description: 'Payment completion flag' },
    { name: 'paid_at', type: 'TIMESTAMP WITH TIME ZONE', description: 'Payment completion time' },
    { name: 'original_amount', type: 'INTEGER', description: 'Original amount before discounts' },
    { name: 'discount_applied', type: 'INTEGER DEFAULT 0', description: 'Discount amount in paise' }
  ];
  
  for (const column of columns) {
    try {
      console.log(`➕ Adding column: ${column.name} (${column.description})`);
      
      // Use raw SQL query to add column
      const { error } = await supabase.rpc('exec_raw_sql', { 
        query: `ALTER TABLE internship_applications ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
      });
      
      if (error) {
        console.log(`⚠️  Column ${column.name} might already exist or error:`, error.message);
      } else {
        console.log(`✅ Column ${column.name} added successfully`);
      }
    } catch (err) {
      console.log(`⚠️  Error adding column ${column.name}:`, err.message);
    }
  }
  
  // Try alternative approach using supabase-js
  console.log('\n🔄 Verifying columns were added...');
  try {
    const { data, error } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(1);
    
    if (data && data.length > 0) {
      const currentColumns = Object.keys(data[0]);
      console.log('\n📋 Current columns after migration:');
      currentColumns.forEach((col, i) => {
        const isNew = columns.some(c => c.name === col);
        console.log(`${i + 1}. ${col} ${isNew ? '(NEW)' : ''}`);
      });
      
      const missingColumns = columns.filter(c => !currentColumns.includes(c.name));
      if (missingColumns.length > 0) {
        console.log('\n❌ Missing columns:');
        missingColumns.forEach(col => console.log(`  - ${col.name}`));
      } else {
        console.log('\n✅ All payment columns are present!');
      }
    }
  } catch (verifyError) {
    console.error('❌ Error verifying columns:', verifyError);
  }
}

addPaymentColumns().then(() => {
  console.log('\n🎉 Payment columns migration complete!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
