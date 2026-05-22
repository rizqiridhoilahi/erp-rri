require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const email = 'owner@rri.com';
  const password = 'rri123456';

  console.log('Attempting to log in:', { email });

  const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Login error:', authError);
    return;
  }

  console.log('Login successful!');
  console.log('User:', user ? user.email : 'null');
  console.log('Session:', session ? 'present' : 'null');
  if (session) {
    console.log('Session access_token:', session.access_token ? 'present' : 'null');
    console.log('Session refresh_token:', session.refresh_token ? 'present' : 'null');
  }

  // Now, let's check the user in our users table
  if (user) {
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);

    if (fetchError) {
      console.error('Fetch user error:', fetchError);
      return;
    }

    console.log('User in users table:', users);
  }
}

testLogin().catch(console.error);
