import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'URLs array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Limit to 20 pages max to control Firecrawl credits
    const pagesToScrape = urls.slice(0, 20);
    const results: { url: string; status: string }[] = [];

    for (const pageUrl of pagesToScrape) {
      try {
        let formattedUrl = pageUrl.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
          formattedUrl = `https://${formattedUrl}`;
        }

        console.log('Scraping content:', formattedUrl);

        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formattedUrl,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error('Firecrawl error for', formattedUrl, data);
          // Insert as failed
          await supabase.from('training_sources').insert({
            user_id: user.id,
            source_type: 'url',
            title: formattedUrl,
            content: '',
            url: formattedUrl,
            status: 'failed',
          });
          results.push({ url: formattedUrl, status: 'failed' });
          continue;
        }

        const markdown = data.data?.markdown || data.markdown || '';
        const title = data.data?.metadata?.title || formattedUrl;

        // Truncate content to 10k chars to avoid oversized prompts
        const truncatedContent = markdown.substring(0, 10000);

        await supabase.from('training_sources').insert({
          user_id: user.id,
          source_type: 'url',
          title: title,
          content: truncatedContent,
          url: formattedUrl,
          status: 'scraped',
        });

        results.push({ url: formattedUrl, status: 'scraped' });
      } catch (err) {
        console.error('Error scraping', pageUrl, err);
        results.push({ url: pageUrl, status: 'failed' });
      }
    }

    console.log(`Scraped ${results.filter(r => r.status === 'scraped').length}/${pagesToScrape.length} pages`);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-training-content:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
