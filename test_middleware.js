require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
// Node v24 has fetch built-in as global

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = 'owner@rri.com';
  const password = 'rri123456';

  console.log('1. Logging in via Supabase...');
  const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    return;
  }

  console.log('   Login successful. User ID:', user.id);
  console.log('   Session access token exists:', !!session.access_token);

  // Extract the project reference from the Supabase URL to build the cookie name
  const match = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = match ? match[1] : '';
  const cookieName = projectRef ? `sb-${projectRef}-access-token` : 'sb-access-token';
  console.log('2. Cookie name for middleware:', cookieName);

  // Prepare the cookie string
  const cookieString = `${cookieName}=${session.access_token}`;

  // Now, make a request to the Next.js server's dashboard page with this cookie
  console.log('3. Making request to http://localhost:3000/dashboard with cookie...');
  const res = await fetch('http://localhost:3000/dashboard', {
    headers: {
      'Cookie': cookieString
    },
    // We don't want to follow redirects automatically because we want to see if we get a redirect to login
    redirect: 'manual'
  });

  console.log('   Response status:', res.status);
  console.log('   Response headers:', Object.fromEntries(res.headers.entries()));

  // If we get a redirect, check the location
  if (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307 || res.status === 308) {
    const redirectUrl = res.headers.get('location');
    console.log('   Redirect location:', redirectUrl);
    if (redirectUrl && redirectUrl.includes('/login')) {
      console.log('   => REDIRECTED TO LOGIN: Middleware did not validate the session correctly.');
    } else {
      console.log('   => Redirected to something else, not login.');
    }
  } else if (res.status === 200) {
    const html = await res.text();
    // Check if the HTML contains something from the dashboard, like "Executive Command Center"
    if (html.includes('Executive Command Center')) {
      console.log('   => SUCCESS: Got dashboard page (found "Executive Command Center" in HTML).');
    } else {
      console.log('   => Got 200 but not the expected dashboard content. Might be a different page or error.');
      // Let's save a snippet for inspection
      const snippet = html.substring(0, 500);
      console.log('   Snippet:', snippet);
    }
  } else {
    console.log('   => Unexpected status code.');
  }
}

test().catch(console.error);
