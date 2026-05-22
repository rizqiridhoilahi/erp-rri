require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const email = 'owner@rri.com';
  const password = 'rri123456';

  console.log('Testing login for:', email);

  try {
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return;
    }

    console.log('Login successful!');
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    console.log('Session exists:', !!session);
    if (session) {
      console.log('Access token exists:', !!session.access_token);
      console.log('Refresh token exists:', !!session.refresh_token);
    }

    // Check if we can get the user from our users table
    if (user?.id) {
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, role, is_active')
        .eq('id', user.id);

      if (fetchError) {
        console.error('Error fetching user from users table:', fetchError);
      } else {
        console.log('User from users table:', users);
      }
    }

    // Check cookies that would be set
    console.log('\\n--- Simulating what cookies would be set ---');
    // In a real browser, these would be set as cookies:
    // sb-access-token: the session's access_token
    // sb-refresh-token: the session's refresh_token
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin();
