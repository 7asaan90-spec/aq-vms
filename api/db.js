// Vercel Edge Function — proxies all Supabase REST API calls
// App calls /api/db?path=<supabase_path> instead of supabase.co directly

export const config = { runtime: 'edge' };

const SUPA_URL = 'https://skshmsqejbvqfzxvsnyz.supabase.co/rest/v1/';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrc2htc3FlamJ2cWZ6eHZzbnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDA4OTQsImV4cCI6MjA4OTUxNjg5NH0.XiWkmhSjQWWT62tccxwGV0uPQI3y_cSDNr9w8raR7IE';

export default async function handler(req) {
  // CORS for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Prefer, X-Method, X-Prefer',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path') || '';
    const method = req.headers.get('X-Method') || req.method;
    const prefer = req.headers.get('X-Prefer') || '';

    const supaUrl = SUPA_URL + path;

    const headers = {
      'apikey': SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY,
    };
    if (prefer) headers['Prefer'] = prefer;

    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      const text = await req.text();
      if (text) {
        headers['Content-Type'] = 'application/json';
        body = text;
      }
    }

    const supaRes = await fetch(supaUrl, { method, headers, body });
    const resText = await supaRes.text();

    return new Response(resText, {
      status: supaRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
