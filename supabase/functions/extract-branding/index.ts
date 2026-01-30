const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Available widget colors and their approximate hex values
const widgetColors: Record<string, string> = {
  gray: '#6b7280',
  purple: '#a855f7',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  pink: '#ec4899',
};

// Calculate color distance (simple Euclidean in RGB space)
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance (0 = black, 1 = white)
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1; // Default to light if can't parse
  
  // Convert to sRGB
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  // Apply gamma correction
  const rLin = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLin = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLin = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

// Determine if a color is dark (luminance < 0.5)
function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Infinity;
  
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function findClosestWidgetColor(primaryColor: string): string {
  let closestColor = 'blue';
  let minDistance = Infinity;
  
  for (const [colorName, colorHex] of Object.entries(widgetColors)) {
    const distance = colorDistance(primaryColor, colorHex);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }
  
  return closestColor;
}

// Determine widget theme based on multiple factors
function determineWidgetTheme(branding: Record<string, unknown>): 'light' | 'dark' {
  // Check colorScheme first
  const colorScheme = branding.colorScheme as string | undefined;
  
  // If colorScheme is explicitly dark, use dark
  if (colorScheme === 'dark') {
    console.log('colorScheme is dark, using dark theme');
    return 'dark';
  }
  
  const colors = branding.colors as Record<string, string> | undefined;
  const components = branding.components as Record<string, Record<string, string>> | undefined;
  
  // Check input component textColor - if it's white/light, the site is probably dark
  const inputTextColor = components?.input?.textColor;
  if (inputTextColor) {
    const inputTextLuminance = getLuminance(inputTextColor);
    console.log(`Input text color: ${inputTextColor}, luminance: ${inputTextLuminance.toFixed(3)}`);
    // If input text is very light (white), the background is probably dark
    if (inputTextLuminance > 0.8) {
      console.log('Input text is white/light, suggesting dark theme');
      return 'dark';
    }
  }
  
  // Check background color luminance
  const backgroundColor = colors?.background;
  if (backgroundColor) {
    const bgLuminance = getLuminance(backgroundColor);
    console.log(`Background color: ${backgroundColor}, luminance: ${bgLuminance.toFixed(3)}`);
    if (bgLuminance < 0.3) {
      console.log('Background is dark, using dark theme');
      return 'dark';
    }
  }
  
  // Check if primary text color is light (indicating dark background)
  const textPrimary = colors?.textPrimary;
  if (textPrimary) {
    const textLuminance = getLuminance(textPrimary);
    console.log(`Text primary color: ${textPrimary}, luminance: ${textLuminance.toFixed(3)}`);
    // If text is very light (high luminance), background is probably dark
    if (textLuminance > 0.8) {
      console.log('Text primary is very light, suggesting dark theme');
      return 'dark';
    }
  }
  
  // Check if accent color would work better on dark or light
  // If accent is bright/saturated, it might be designed for dark backgrounds
  const accent = colors?.accent;
  if (accent && backgroundColor === '#FFFFFF') {
    // If Firecrawl says background is white but we have an orange/bright accent,
    // it might be a dark site with sections
    const accentRgb = hexToRgb(accent);
    if (accentRgb) {
      // Check if accent is a warm, bright color (orange, red, yellow)
      const isWarmBright = accentRgb.r > 200 && accentRgb.g < 180 && accentRgb.b < 100;
      if (isWarmBright) {
        console.log(`Accent ${accent} is warm/bright, might indicate dark theme design`);
        // Don't return dark here, just log it - not strong enough signal alone
      }
    }
  }
  
  console.log('Defaulting to light theme');
  return 'light';
}

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
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Extracting branding from URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['branding'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || `Request failed with status ${response.status}` 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract branding data
    const branding = data.data?.branding || data.branding;
    
    if (!branding) {
      console.log('No branding data found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          logo: null,
          widgetColor: 'blue',
          primaryColor: null,
          message: 'No branding data found, using defaults'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Branding extracted:', JSON.stringify(branding, null, 2));

    // Extract logo
    const logo = branding.images?.logo || branding.logo || null;
    
    // Extract primary color and find closest widget color
    const primaryColor = branding.colors?.primary || null;
    const widgetColor = primaryColor ? findClosestWidgetColor(primaryColor) : 'blue';

    // Determine theme based on multiple factors (colorScheme, background, text colors)
    const widgetTheme = determineWidgetTheme(branding);

    console.log('Extracted logo:', logo);
    console.log('Primary color:', primaryColor, '-> Widget color:', widgetColor);
    console.log('Determined widget theme:', widgetTheme);

    return new Response(
      JSON.stringify({
        success: true,
        logo,
        widgetColor,
        widgetTheme,
        primaryColor,
        branding, // Include full branding for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting branding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract branding';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
