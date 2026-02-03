import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the access token from environment
    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.log('INSTAGRAM_ACCESS_TOKEN not configured, returning without thumbnail');
      return new Response(
        JSON.stringify({
          thumbnail_url: null,
          title: null,
          author_name: null,
          note: 'Instagram access token not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract post ID from URL
    const postIdMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
    const postId = postIdMatch ? postIdMatch[2] : null;

    // Use Instagram oEmbed API with access token
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}`;
    
    console.log('Fetching Instagram oEmbed for user:', user.id);
    
    const response = await fetch(oembedUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log('Instagram API response status:', response.status);
    
    if (!response.ok) {
      console.error('Instagram API error:', responseText);
      return new Response(
        JSON.stringify({
          thumbnail_url: null,
          title: null,
          author_name: postId ? `Post ${postId.substring(0, 8)}...` : null,
          error: `Instagram API error: ${response.status}`,
          note: 'Could not fetch thumbnail. Check if token has instagram_oembed permission.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Instagram oEmbed success, thumbnail:', data.thumbnail_url ? 'found' : 'not found');
      
      return new Response(
        JSON.stringify({
          thumbnail_url: data.thumbnail_url || null,
          title: data.title || null,
          author_name: data.author_name || null,
          html: data.html || null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse Instagram response:', parseError);
      return new Response(
        JSON.stringify({
          thumbnail_url: null,
          title: null,
          author_name: postId ? `Post ${postId.substring(0, 8)}...` : null,
          note: 'Failed to parse Instagram response'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in instagram-oembed:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        thumbnail_url: null,
        title: null,
        author_name: null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
