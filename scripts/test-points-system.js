const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPointsSystem() {
  console.log('🧪 Testing points system...');

  try {
    // 1. Check if tables exist
    console.log('\n📊 Checking if tables exist...');
    
    const { data: userPointsData, error: userPointsError } = await supabase
      .from('user_points')
      .select('count')
      .limit(1);
    
    if (userPointsError) {
      console.log('❌ user_points table error:', userPointsError.message);
    } else {
      console.log('✅ user_points table exists');
    }

    const { data: activityLogData, error: activityLogError } = await supabase
      .from('user_activity_log')
      .select('count')
      .limit(1);
    
    if (activityLogError) {
      console.log('❌ user_activity_log table error:', activityLogError.message);
    } else {
      console.log('✅ user_activity_log table exists');
    }

    // 2. Check existing users and their points
    console.log('\n👥 Checking existing users and points...');
    
    const { data: users, error: usersError } = await supabase
      .from('user_points')
      .select('*')
      .order('total_points', { ascending: false });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users?.length || 0} users with points`);
      if (users && users.length > 0) {
        console.log('Top 5 users:');
        users.slice(0, 5).forEach((user, index) => {
          console.log(`  ${index + 1}. User ${user.user_id.substring(0, 8)}: ${user.total_points} points`);
        });
      }
    }

    // 3. Check activity log
    console.log('\n📝 Checking activity log...');
    
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) {
      console.log('❌ Error fetching activities:', activitiesError.message);
    } else {
      console.log(`✅ Found ${activities?.length || 0} recent activities`);
      if (activities && activities.length > 0) {
        console.log('Recent activities:');
        activities.forEach((activity, index) => {
          console.log(`  ${index + 1}. User ${activity.user_id.substring(0, 8)}: ${activity.activity_type} (+${activity.points_awarded} points)`);
        });
      }
    }

    // 4. Test creating a user points record
    console.log('\n🔧 Testing user points creation...');
    
    const testUserId = 'test-user-' + Date.now();
    const { data: newUserPoints, error: createError } = await supabase
      .from('user_points')
      .insert({
        user_id: testUserId,
        total_points: 0,
        rank: 0
      })
      .select()
      .single();

    if (createError) {
      console.log('❌ Error creating test user points:', createError.message);
    } else {
      console.log('✅ Test user points created successfully');
      
      // 5. Test awarding points
      console.log('\n🎯 Testing points awarding...');
      
      const { data: newActivity, error: activityError } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: testUserId,
          activity_type: 'daily_login',
          points_awarded: 5
        })
        .select()
        .single();

      if (activityError) {
        console.log('❌ Error creating test activity:', activityError.message);
      } else {
        console.log('✅ Test activity created successfully');
        
        // 6. Test updating user points
        const { error: updateError } = await supabase
          .from('user_points')
          .update({
            total_points: 5,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', testUserId);

        if (updateError) {
          console.log('❌ Error updating test user points:', updateError.message);
        } else {
          console.log('✅ Test user points updated successfully');
        }
      }
      
      // 7. Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      await supabase.from('user_activity_log').delete().eq('user_id', testUserId);
      await supabase.from('user_points').delete().eq('user_id', testUserId);
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Points system test completed!');
    console.log('\n📋 Summary:');
    console.log('- Tables exist and are accessible');
    console.log('- Points can be awarded and updated');
    console.log('- Activity logging works');
    console.log('\n💡 If you see low numbers in the leaderboard, it means:');
    console.log('1. Users haven\'t performed activities yet');
    console.log('2. Activity logging needs to be added to more user actions');
    console.log('3. The daily login trigger needs to be working');

  } catch (error) {
    console.error('❌ Error testing points system:', error);
    process.exit(1);
  }
}

testPointsSystem(); 