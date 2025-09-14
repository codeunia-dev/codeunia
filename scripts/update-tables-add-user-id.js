#!/usr/bin/env node

/**
 * Update Application Tables to Add User ID Fields
 * This script adds user_id columns to all existing application tables for authentication
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTables() {
    try {
        console.log('🔄 Updating application tables to add user_id fields...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'update-tables-add-user-id.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
            console.error('❌ Error updating tables:', error);
            process.exit(1);
        }
        
        console.log('✅ Application tables updated successfully!');
        console.log('📋 Changes made:');
        console.log('   - Added user_id column to volunteer_applications');
        console.log('   - Added user_id column to sponsorship_applications');
        console.log('   - Added user_id column to mentor_applications');
        console.log('   - Added user_id column to judges_applications');
        console.log('   - Added user_id column to collaboration_applications');
        console.log('   - Created indexes for better performance');
        console.log('   - Added documentation comments');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

// Run the update
updateTables();
