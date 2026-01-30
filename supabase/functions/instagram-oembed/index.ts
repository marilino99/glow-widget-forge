import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract post ID from URL for generating a thumbnail placeholder
    const postIdMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
    const postId = postIdMatch ? postIdMatch[2] : null;

    // Try Instagram's oEmbed API (may not work without authentication)
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(oembedUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Lovable/1.0)'
        }
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        return new Response(
          JSON.stringify({
            thumbnail_url: data.thumbnail_url,
            title: data.title,
            author_name: data.author_name,
            html: data.html,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If not JSON or not OK, return partial data without thumbnail
      console.log(`Instagram oEmbed unavailable (status: ${response.status}), returning partial data`);
    } catch (fetchError) {
      console.log('Instagram oEmbed fetch failed:', fetchError);
    }

    // Return partial response - post will be saved but without thumbnail
    // Instagram's public oEmbed API is deprecated and requires authentication
    return new Response(
      JSON.stringify({
        thumbnail_url: null,
        title: null,
        author_name: postId ? `@instagram/${postId}` : null,
        html: null,
        note: 'Instagram requires authentication for thumbnails. Post saved without preview.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
