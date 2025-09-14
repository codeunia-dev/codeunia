#!/usr/bin/env node

/**
 * Setup Core Team Applications Table
 * This script creates the core_team_applications table in Supabase
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

async function createCoreTeamTable() {
    try {
        console.log('🔄 Creating core_team_applications table...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'create-core-team-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
            console.error('❌ Error creating table:', error);
            process.exit(1);
        }
        
        console.log('✅ core_team_applications table created successfully!');
        console.log('📋 Table includes:');
        console.log('   - Personal information fields');
        console.log('   - Professional information fields');
        console.log('   - Core team application fields');
        console.log('   - System fields (status, timestamps)');
        console.log('   - Indexes for performance');
        console.log('   - Auto-updating timestamp trigger');
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

// Run the setup
createCoreTeamTable();
