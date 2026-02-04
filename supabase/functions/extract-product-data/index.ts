const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Extracting product data from:', formattedUrl);

    // Use Firecrawl to scrape the product page with JSON extraction
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: [
          'markdown',
          {
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Product name or title' },
                price: { type: 'string', description: 'Current price with currency symbol' },
                oldPrice: { type: 'string', description: 'Original/old price if on sale, with currency symbol' },
                description: { type: 'string', description: 'Short product description or subtitle' },
                imageUrl: { type: 'string', description: 'Main product image URL (full URL starting with http)' },
              },
              required: ['title'],
            },
          },
        ],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape product page' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the JSON data from response
    const extractedData = data.data?.json || data.json || {};
    
    console.log('Extracted product data:', extractedData);

    // Clean up and validate the extracted data
    const productData = {
      title: extractedData.title || 'Untitled Product',
      subtitle: extractedData.description || undefined,
      price: extractedData.price || undefined,
      oldPrice: extractedData.oldPrice || undefined,
      imageUrl: extractedData.imageUrl || undefined,
    };

    // Validate image URL
    if (productData.imageUrl && !productData.imageUrl.startsWith('http')) {
      // Try to make it absolute
      try {
        const urlObj = new URL(formattedUrl);
        if (productData.imageUrl.startsWith('/')) {
          productData.imageUrl = `${urlObj.origin}${productData.imageUrl}`;
        } else {
          productData.imageUrl = `${urlObj.origin}/${productData.imageUrl}`;
        }
      } catch {
        productData.imageUrl = undefined;
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: productData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting product data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract product data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
