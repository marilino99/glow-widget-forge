const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    // Use Firecrawl to scrape the product page
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['html'],
        onlyMainContent: false,  // Get full HTML with meta tags
        waitFor: 5000,  // Wait longer for JS rendering
      }),
    });

    const responseText = await response.text();
    console.log('Firecrawl response status:', response.status);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Non-JSON response from Firecrawl:', responseText.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid response from Firecrawl' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      console.error('Firecrawl API error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Firecrawl error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract data from response
    const html = data.data?.html || data.html || '';
    const metadata = data.data?.metadata || data.metadata || {};
    
    console.log('Page title:', metadata.title);
    console.log('Metadata ogImage:', metadata.ogImage);

    // Parse product data from HTML and metadata
    const productData = {
      title: extractTitle(html, metadata),
      subtitle: extractDescription(html, metadata),
      price: extractPrice(html),
      oldPrice: extractOldPrice(html),
      imageUrl: extractImageUrl(html, formattedUrl, metadata),
    };

    console.log('Extracted product data:', JSON.stringify(productData));

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

// Helper functions to extract product data from HTML

function extractTitle(html: string, metadata: Record<string, unknown>): string {
  // Try og:title first, then page title, then h1
  if (metadata.ogTitle) return String(metadata.ogTitle);
  if (metadata.title) {
    // Remove site name from title
    const title = String(metadata.title);
    const parts = title.split(/[|\-–—]/);
    return parts[0].trim();
  }
  
  // Try product name from structured data
  const productNameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);
  if (productNameMatch) return productNameMatch[1];
  
  // Try h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  
  return 'Product';
}

function extractDescription(html: string, metadata: Record<string, unknown>): string | undefined {
  // Try og:description or meta description
  if (metadata.ogDescription) return String(metadata.ogDescription).slice(0, 200);
  if (metadata.description) return String(metadata.description).slice(0, 200);
  
  // Try product description from structured data
  const descMatch = html.match(/"description"\s*:\s*"([^"]+)"/);
  if (descMatch) return descMatch[1].slice(0, 200);
  
  return undefined;
}

function extractPrice(html: string): string | undefined {
  // Try structured data price first
  const priceMatch = html.match(/"price"\s*:\s*"?([0-9.,]+)"?/);
  const currencyMatch = html.match(/"priceCurrency"\s*:\s*"([^"]+)"/);
  
  if (priceMatch) {
    const currency = currencyMatch ? currencyMatch[1] : '€';
    return `${priceMatch[1]} ${currency}`;
  }
  
  // Try common price patterns in HTML
  const pricePatterns = [
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)<\/span>/i,
    /<p[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)<\/p>/i,
    /<ins[^>]*>[^<]*<span[^>]*>([^<]*[0-9.,]+[^<]*)<\/span>/i,
    /class="[^"]*current-price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)</i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      // Clean up price text
      const price = match[1].replace(/<[^>]+>/g, '').trim();
      if (price.match(/[0-9]/)) return price;
    }
  }
  
  return undefined;
}

function extractOldPrice(html: string): string | undefined {
  // Try to find crossed-out or original price
  const oldPricePatterns = [
    /<del[^>]*>([^<]*[0-9.,]+[^<]*)<\/del>/i,
    /<s>([^<]*[0-9.,]+[^<]*)<\/s>/i,
    /class="[^"]*regular-price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)</i,
    /class="[^"]*was-price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)</i,
    /class="[^"]*original-price[^"]*"[^>]*>([^<]*[0-9.,]+[^<]*)</i,
  ];
  
  for (const pattern of oldPricePatterns) {
    const match = html.match(pattern);
    if (match) {
      const price = match[1].replace(/<[^>]+>/g, '').trim();
      if (price.match(/[0-9]/)) return price;
    }
  }
  
  return undefined;
}

function extractImageUrl(html: string, pageUrl: string, metadata: Record<string, unknown> = {}): string | undefined {
  // First check metadata from Firecrawl (most reliable)
  if (metadata.ogImage && typeof metadata.ogImage === 'string') {
    console.log('Found ogImage from metadata:', metadata.ogImage);
    return metadata.ogImage;
  }
  
  // Try og:image with multiple patterns (handles different attribute orders)
  const ogPatterns = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
  ];
  
  for (const pattern of ogPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && !match[1].includes('{')) {
      console.log('Found og:image:', match[1]);
      return makeAbsoluteUrl(match[1], pageUrl);
    }
  }
  
  // Try twitter:image
  const twitterImageMatch = html.match(/<meta[^>]*(?:name|property)=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']twitter:image["']/i);
  if (twitterImageMatch && twitterImageMatch[1] && !twitterImageMatch[1].includes('{')) {
    console.log('Found twitter:image:', twitterImageMatch[1]);
    return makeAbsoluteUrl(twitterImageMatch[1], pageUrl);
  }
  
  // Try structured data image (JSON-LD)
  const structuredPatterns = [
    /"image"\s*:\s*\[\s*"([^"]+)"/,  // Array format
    /"image"\s*:\s*"([^"]+)"/,        // String format
    /"image"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/,  // Object format
  ];
  
  for (const pattern of structuredPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].startsWith('http')) {
      console.log('Found structured data image:', match[1]);
      return match[1];
    }
  }
  
  // Shopify specific patterns
  const shopifyPatterns = [
    /cdn\.shopify\.com[^"'\s]+\.(jpg|jpeg|png|webp)/i,
    /"featured_image"\s*:\s*"([^"]+)"/,
    /"src"\s*:\s*"(\/\/cdn\.shopify[^"]+)"/,
  ];
  
  for (const pattern of shopifyPatterns) {
    const match = html.match(pattern);
    if (match) {
      const imageUrl = match[1] || match[0];
      console.log('Found Shopify image:', imageUrl);
      return makeAbsoluteUrl(imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl, pageUrl);
    }
  }
  
  // Try product image patterns (WooCommerce, generic)
  const imagePatterns = [
    /<img[^>]*class="[^"]*product[^"]*image[^"]*"[^>]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["'][^>]*class="[^"]*product[^"]*image[^"]*"/i,
    /class="[^"]*woocommerce-product-gallery[^"]*"[^>]*[^]*?<img[^>]*src=["']([^"']+)["']/i,
    /<img[^>]*data-src=["']([^"']+)["'][^>]*class="[^"]*product/i,
    /<img[^>]*srcset=["']([^\s"']+)/i,  // First image in srcset
  ];
  
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log('Found product image:', match[1]);
      return makeAbsoluteUrl(match[1], pageUrl);
    }
  }
  
  console.log('No image found in HTML');
  return undefined;
}

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http')) return url;
  
  try {
    const base = new URL(baseUrl);
    if (url.startsWith('//')) {
      return `${base.protocol}${url}`;
    }
    if (url.startsWith('/')) {
      return `${base.origin}${url}`;
    }
    return `${base.origin}/${url}`;
  } catch {
    return url;
  }
}
