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
      .select("user_id, widget_color, widget_theme, contact_name, offer_help, say_hello, selected_avatar, faq_enabled, instagram_enabled, background_type, background_image, logo, button_logo, language, whatsapp_enabled, whatsapp_country_code, whatsapp_number, show_branding, forward_email, chatbot_enabled, chatbot_instructions, ai_provider, custom_css, custom_js, widget_position, widget_type, google_reviews_enabled, google_business_name, google_business_rating, google_business_ratings_total, google_business_url, cta_text, product_carousel_enabled, inspire_enabled, home_section_order, custom_chips, voice_enabled")
      .eq("id", widgetId)
      .single();

    if (configError) {
      console.error("Database error:", configError);
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Check if user has an active Shopify connection
    const { data: shopifyConn } = await supabase
      .from("shopify_connections")
      .select("id, store_domain")
      .eq("user_id", config.user_id)
      .maybeSingle();

    // Fetch product cards (both Shopify and manual)
    let productCards: any[] = [];
    const { data: cardsData, error: cardsError } = await supabase
      .from("product_cards")
      .select("*")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    if (cardsError) {
      console.error("Product cards error:", cardsError);
    }
    productCards = cardsData || [];

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

    // Fetch inspire videos with linked products
    let inspireVideos: any[] = [];
    if (config.inspire_enabled) {
      const { data: videosData, error: videosError } = await supabase
        .from("inspire_videos")
        .select("id, video_url, thumbnail_url, source, sort_order")
        .eq("user_id", config.user_id)
        .order("sort_order", { ascending: true });

      if (videosError) {
        console.error("Inspire videos error:", videosError);
      }

      if (videosData && videosData.length > 0) {
        const videoIds = videosData.map((v: any) => v.id);
        const { data: linksData } = await supabase
          .from("inspire_video_products")
          .select("video_id, product_card_id")
          .in("video_id", videoIds)
          .order("sort_order", { ascending: true });

        const linksByVideo: Record<string, string[]> = {};
        (linksData || []).forEach((l: any) => {
          if (!linksByVideo[l.video_id]) linksByVideo[l.video_id] = [];
          linksByVideo[l.video_id].push(l.product_card_id);
        });

        inspireVideos = videosData.map((v: any) => ({
          ...v,
          linked_product_ids: linksByVideo[v.id] || [],
        }));
      }
    }

    // Auto-generate custom_chips if null
    let customChips = config.custom_chips;
    if (!customChips) {
      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          // Build context from available data
          const contextParts: string[] = [];
          if (config.chatbot_instructions) {
            contextParts.push("Business instructions: " + config.chatbot_instructions.slice(0, 200));
          }
          if (faqItems && faqItems.length > 0) {
            contextParts.push("FAQ topics: " + faqItems.slice(0, 5).map((f: any) => f.question).join(", "));
          }
          if (productCards && productCards.length > 0) {
            contextParts.push("Products: " + productCards.slice(0, 5).map((p: any) => p.title).join(", "));
          }
          if (customLinks && customLinks.length > 0) {
            contextParts.push("Links: " + customLinks.slice(0, 5).map((l: any) => l.name).join(", "));
          }
          const context = contextParts.join(". ").slice(0, 500);

          const lang = config.language || "en";
          const prompt = context.length > 0
            ? `Based on this business context: "${context}". Generate exactly 3 short action button labels (max 5 words each) that a website visitor would click to get help. Return ONLY a JSON array of 3 strings in language "${lang}". Example: ["Book a table","See the menu","Opening hours"]`
            : `Generate 3 generic short action button labels (max 5 words each) for a website chat widget. Return ONLY a JSON array of 3 strings in language "${lang}".`;

          const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [
                { role: "system", content: "You return only valid JSON arrays. No markdown, no explanation." },
                { role: "user", content: prompt },
              ],
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const raw = aiData.choices?.[0]?.message?.content?.trim() || "";
            // Extract JSON array from response
            const match = raw.match(/\[[\s\S]*?\]/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              if (Array.isArray(parsed) && parsed.length >= 3 && parsed.every((s: any) => typeof s === "string")) {
                customChips = parsed.slice(0, 3);
                // Save to DB so we don't regenerate
                await supabase
                  .from("widget_configurations")
                  .update({ custom_chips: customChips })
                  .eq("id", widgetId);
                console.log("Auto-generated chips:", customChips);
              }
            }
          }
        }
      } catch (e) {
        console.error("Chip auto-generation failed, using defaults:", e);
      }
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
        shopify_store_domain: shopifyConn?.store_domain || null,
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
        product_carousel_enabled: config.product_carousel_enabled ?? true,
        inspire_enabled: config.inspire_enabled ?? false,
        inspire_videos: inspireVideos,
        home_section_order: config.home_section_order || ["product-carousel", "faq", "custom-links", "inspire-me"],
        custom_chips: customChips || null,
        voice_enabled: config.voice_enabled ?? false,
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
