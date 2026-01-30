const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching URL:', formattedUrl);

    // Create an AbortController with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      // Fetch the website content
      response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch failed:', fetchError);
      // Return a friendly fallback HTML instead of error
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Preview unavailable</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;font-family:system-ui;">
          <div style="text-align:center;padding:20px;">
            <h2 style="color:#666;margin-bottom:10px;">Preview Unavailable</h2>
            <p style="color:#999;">Unable to load website preview. The site may be blocking external requests.</p>
          </div>
        </body>
        </html>
      `;
      return new Response(fallbackHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Return fallback HTML for failed responses
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Preview unavailable</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5;font-family:system-ui;">
          <div style="text-align:center;padding:20px;">
            <h2 style="color:#666;margin-bottom:10px;">Preview Unavailable</h2>
            <p style="color:#999;">Unable to load website (status: ${response.status})</p>
          </div>
        </body>
        </html>
      `;
      return new Response(fallbackHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    let html = await response.text();

    // Get the base URL for resolving relative paths
    const urlObj = new URL(formattedUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Inject a <base> tag to resolve relative URLs
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${baseUrl}/">`
    );

    // If no head tag, add one at the start
    if (!/<head/i.test(html)) {
      html = `<base href="${baseUrl}/">` + html;
    }

    console.log('Successfully fetched and processed URL');

    // Return HTML with headers that allow iframe embedding
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        // Remove X-Frame-Options by not setting it
        // This allows the content to be embedded in an iframe
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch website' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
