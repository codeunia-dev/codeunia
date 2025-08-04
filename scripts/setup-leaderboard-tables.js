const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupLeaderboardTables() {
  console.log('🚀 Setting up global leaderboard tables...');

  try {
    // Create user_points table
    console.log('📊 Creating user_points table...');
    const { error: pointsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_points (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
          total_points INTEGER DEFAULT 0 NOT NULL,
          rank INTEGER DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (pointsError) {
      console.log('⚠️  user_points table might already exist or error occurred:', pointsError.message);
    } else {
      console.log('✅ user_points table created');
    }

    // Create user_activity_log table
    console.log('📝 Creating user_activity_log table...');
    const { error: activityError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_activity_log (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          activity_type TEXT NOT NULL,
          related_id TEXT,
          points_awarded INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (activityError) {
      console.log('⚠️  user_activity_log table might already exist or error occurred:', activityError.message);
    } else {
      console.log('✅ user_activity_log table created');
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
        CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
      `
    });

    if (indexError) {
      console.log('⚠️  Indexes might already exist or error occurred:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    // Enable RLS
    console.log('🔒 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('⚠️  RLS setup error:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }

    // Create RLS policies
    console.log('📋 Creating RLS policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
        CREATE POLICY "Users can view their own points" ON user_points
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own points" ON user_points;
        CREATE POLICY "Users can update their own points" ON user_points
          FOR UPDATE USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Service role can do everything on user_points" ON user_points;
        CREATE POLICY "Service role can do everything on user_points" ON user_points
          FOR ALL USING (auth.role() = 'service_role');

        DROP POLICY IF EXISTS "Users can view their own activity log" ON user_activity_log;
        CREATE POLICY "Users can view their own activity log" ON user_activity_log
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Service role can do everything on user_activity_log" ON user_activity_log;
        CREATE POLICY "Service role can do everything on user_activity_log" ON user_activity_log
          FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (policyError) {
      console.log('⚠️  Policy creation error:', policyError.message);
    } else {
      console.log('✅ RLS policies created');
    }

    // Create trigger function for user points creation
    console.log('⚡ Creating trigger functions...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_user_points_on_signup()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO user_points (user_id, total_points, rank)
          VALUES (NEW.id, 0, 0);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS trigger_create_user_points ON auth.users;
        CREATE TRIGGER trigger_create_user_points
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION create_user_points_on_signup();
      `
    });

    if (triggerError) {
      console.log('⚠️  Trigger creation error:', triggerError.message);
    } else {
      console.log('✅ Trigger functions created');
    }

    // Create user points for existing users
    console.log('👥 Creating user points for existing users...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id');

    if (usersError) {
      console.log('⚠️  Could not fetch existing users:', usersError.message);
    } else if (users && users.length > 0) {
      for (const user of users) {
        const { error: insertError } = await supabase
          .from('user_points')
          .upsert({
            user_id: user.id,
            total_points: 0,
            rank: 0
          }, { onConflict: 'user_id' });

        if (insertError) {
          console.log(`⚠️  Could not create points for user ${user.id}:`, insertError.message);
        }
      }
      console.log(`✅ Created user points for ${users.length} existing users`);
    }

    console.log('🎉 Global leaderboard tables setup complete!');
    console.log('📊 You can now test the points system with your new account.');

  } catch (error) {
    console.error('❌ Error setting up tables:', error);
    process.exit(1);
  }
}

setupLeaderboardTables(); 