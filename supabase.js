(() => {
  const demoUrl = 'https://example.supabase.co';
  const demoKey = 'demo-anon-key';
  const url = window.DDRKY_SUPABASE_URL || demoUrl;
  const key = window.DDRKY_SUPABASE_ANON_KEY || demoKey;

  if (typeof window.supabase !== 'undefined' && url && key && url !== demoUrl) {
    window.supabaseClient = window.supabase.createClient(url, key);
  } else {
    window.supabaseClient = null;
  }

  window.DDRKY_DEMO_MODE = !window.supabaseClient;
  window.DDRKY_STORAGE = {
    applications: 'ddrky_applications',
    users: 'ddrky_partner_users',
    session: 'ddrky_session'
  };
})();
