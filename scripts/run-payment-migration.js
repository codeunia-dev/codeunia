const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 RUNNING PAYMENT FIELDS MIGRATION...\n');
  
  try {
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync('./scripts/add-payment-fields-migration.sql', 'utf8');
    
    console.log('📄 Migration SQL loaded');
    console.log('⚡ Executing migration...\n');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .filter(stmt => !stmt.trim().startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement 
          });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
          } else {
            console.log(`✅ Statement ${i + 1} completed`);
          }
        } catch (stmtError) {
          console.error(`❌ Exception in statement ${i + 1}:`, stmtError);
        }
      }
    }
    
    console.log('\n🔍 Verifying migration results...');
    
    // Check if the new columns exist
    const { data: sampleData, error: sampleError } = await supabase
      .from('internship_applications')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.error('❌ Error checking table:', sampleError);
    } else if (sampleData && sampleData.length > 0) {
      const columns = Object.keys(sampleData[0]);
      const paymentColumns = [
        'order_id', 'payment_id', 'payment_signature', 'amount_paid', 
        'currency', 'payment_status', 'is_paid', 'original_amount', 
        'discount_applied', 'discount_type'
      ];
      
      console.log('\n📋 Payment column status:');
      paymentColumns.forEach(col => {
        const exists = columns.includes(col);
        console.log(`${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
      });
      
      console.log('\n📝 Sample record with new fields:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

runMigration().then(() => {
  console.log('\n🎉 Migration process complete!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
