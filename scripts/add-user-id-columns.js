#!/usr/bin/env node

/**
 * Add User ID Columns to Application Tables
 * This script adds user_id columns to all existing application tables for authentication
 */

const { createClient } = require('@supabase/supabase-js');

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

async function addUserIdColumns() {
    try {
        console.log('🔄 Adding user_id columns to application tables...');
        
        const tables = [
            'volunteer_applications',
            'sponsorship_applications', 
            'mentor_applications',
            'judges_applications',
            'collaboration_applications'
        ];

        for (const table of tables) {
            try {
                console.log(`📝 Adding user_id column to ${table}...`);
                
                // Try to add the column
                const { error } = await supabase.rpc('exec_sql', {
                    sql: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;`
                });

                if (error) {
                    console.log(`⚠️  Could not add column to ${table} (might already exist or table doesn't exist):`, error.message);
                } else {
                    console.log(`✅ Added user_id column to ${table}`);
                }

                // Try to add index
                const { error: indexError } = await supabase.rpc('exec_sql', {
                    sql: `CREATE INDEX IF NOT EXISTS idx_${table}_user_id ON ${table}(user_id);`
                });

                if (indexError) {
                    console.log(`⚠️  Could not add index for ${table}:`, indexError.message);
                } else {
                    console.log(`✅ Added index for ${table}`);
                }

            } catch (error) {
                console.log(`⚠️  Error processing ${table}:`, error.message);
            }
        }
        
        console.log('✅ User ID column addition process completed!');
        console.log('📋 Summary:');
        console.log('   - Attempted to add user_id columns to all application tables');
        console.log('   - Added indexes for better performance');
        console.log('   - Some tables might already have the columns or might not exist yet');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

// Run the update
addUserIdColumns();
