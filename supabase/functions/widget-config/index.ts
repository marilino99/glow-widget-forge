import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const widgetId = url.searchParams.get("id");

    if (!widgetId) {
      return new Response(
        JSON.stringify({ error: "Widget ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch widget configuration
    const { data: config, error: configError } = await supabase
      .from("widget_configurations")
      .select("*")
      .eq("id", widgetId)
      .single();

    if (configError) {
      console.error("Database error:", configError);
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Fetch product cards for this user
    const { data: productCards, error: cardsError } = await supabase
      .from("product_cards")
      .select("*")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    if (cardsError) {
      console.error("Product cards error:", cardsError);
    }

    // Fetch FAQ items for this user
    const { data: faqItems, error: faqError } = await supabase
      .from("faq_items")
      .select("*")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    if (faqError) {
      console.error("FAQ items error:", faqError);
    }

    // Fetch Instagram posts for this user
    const { data: instagramPosts, error: instagramError } = await supabase
      .from("instagram_posts")
      .select("*")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    if (instagramError) {
      console.error("Instagram posts error:", instagramError);
    }

    // Fetch custom links for this user
    const { data: customLinks, error: customLinksError } = await supabase
      .from("custom_links")
      .select("*")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    if (customLinksError) {
      console.error("Custom links error:", customLinksError);
    }

    // Return the complete widget configuration
    return new Response(
      JSON.stringify({
        widget_color: config.widget_color,
        widget_theme: config.widget_theme,
        contact_name: config.contact_name,
        offer_help: config.offer_help,
        say_hello: config.say_hello,
        selected_avatar: config.selected_avatar,
        faq_enabled: config.faq_enabled,
        instagram_enabled: config.instagram_enabled,
        background_type: config.background_type,
        background_image: config.background_image || null,
        logo: config.logo,
        button_logo: config.button_logo,
        language: config.language,
        whatsapp_enabled: config.whatsapp_enabled ?? false,
        whatsapp_country_code: config.whatsapp_country_code || "+39",
        whatsapp_number: config.whatsapp_number || "",
        show_branding: config.show_branding ?? true,
        forward_email: config.forward_email || "",
        chatbot_enabled: config.chatbot_enabled ?? true,
        chatbot_instructions: config.chatbot_instructions || "",
        ai_provider: config.ai_provider || "google",
        product_cards: productCards || [],
        faq_items: faqItems || [],
        instagram_posts: instagramPosts || [],
        custom_links: customLinks || [],
        custom_css: config.custom_css || null,
        custom_js: config.custom_js || null,
        widget_position: config.widget_position || 'right',
        widget_type: config.widget_type || 'popup',
        google_reviews_enabled: config.google_reviews_enabled ?? false,
        google_business_name: config.google_business_name || null,
        google_business_rating: config.google_business_rating ?? null,
        google_business_ratings_total: config.google_business_ratings_total ?? null,
        google_business_url: config.google_business_url || null,
        cta_text: config.cta_text || "Contact us",
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Widget config error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
