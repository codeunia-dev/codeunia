#!/usr/bin/env node

/**
 * Script to sync hardcoded reserved usernames with database
 * This helps ensure the Edge Runtime service has the latest data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// This should match the hardcoded list in reserved-usernames-edge.ts
const hardcodedUsernames = [
  // System & Admin
  'admin', 'root', 'superadmin', 'moderator', 'staff', 'support',
  'login', 'logout', 'signup', 'register', 'auth', 'signin', 'signup',
  'profile', 'user', 'account', 'settings', 'dashboard', 'panel',
  'home', 'welcome', 'me', 'my', 'self', 'account',

  // API & Technical
  'api', 'v1', 'v2', 'v3', 'assets', 'cdn', 'static', 'public',
  'backend', 'database', 'server', 'config', 'system', 'sys',
  'www', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'email',

  // Brand & Identity
  'build', 'buildunia', 'code', 'coders', 'student', 'students',
  'hackers', 'dev', 'developer', 'creator', 'maker', 'makers',
  'codeunia', 'codeuniversity', 'university', 'college',

  // Common System Routes
  'about', 'contact', 'terms', 'privacy', 'help', 'faq',
  'blog', 'news', 'events', 'hackathons', 'tests', 'test',
  'internship', 'internships', 'jobs', 'careers', 'opportunities',
  'leaderboard', 'leaderboards', 'rankings', 'scores',
  'premium', 'pro', 'upgrade', 'subscription', 'billing',
  'join', 'collaboration', 'sponsorship', 'mentor', 'judge', 'volunteer',

  // Single letters and common words
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'app', 'web', 'site', 'page', 'main', 'index', 'default',
  'new', 'old', 'latest', 'popular', 'trending', 'featured',
  'search', 'find', 'browse', 'explore', 'discover'
];

async function syncReservedUsernames() {
  console.log('🔄 Syncing reserved usernames with database...');
  
  try {
    // Get existing reserved usernames from database
    const { data: existing, error: fetchError } = await supabase
      .from('reserved_usernames')
      .select('username')
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ Error fetching existing usernames:', fetchError);
      return;
    }

    const existingUsernames = new Set(existing?.map(item => item.username.toLowerCase()) || []);
    
    // Find usernames to add
    const usernamesToAdd = hardcodedUsernames.filter(
      username => !existingUsernames.has(username.toLowerCase())
    );

    if (usernamesToAdd.length === 0) {
      console.log('✅ All hardcoded usernames already exist in database');
      return;
    }

    // Add missing usernames
    const usernamesToInsert = usernamesToAdd.map(username => ({
      username: username.toLowerCase(),
      category: 'system',
      reason: 'System reserved username (synced from hardcoded list)',
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('reserved_usernames')
      .insert(usernamesToInsert);

    if (insertError) {
      console.error('❌ Error inserting usernames:', insertError);
      return;
    }

    console.log(`✅ Successfully added ${usernamesToAdd.length} reserved usernames to database`);
    console.log('📝 Added usernames:', usernamesToAdd.join(', '));
    
  } catch (error) {
    console.error('❌ Error syncing reserved usernames:', error);
  }
}

// Run the sync
syncReservedUsernames();
