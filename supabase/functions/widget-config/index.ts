import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data, error } = await supabase
      .from("widget_configurations")
      .select("*")
      .eq("id", widgetId)
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Return the widget configuration (without sensitive data)
    return new Response(
      JSON.stringify({
        widget_color: data.widget_color,
        widget_theme: data.widget_theme,
        contact_name: data.contact_name,
        offer_help: data.offer_help,
        say_hello: data.say_hello,
        selected_avatar: data.selected_avatar,
        faq_enabled: data.faq_enabled,
        background_type: data.background_type,
        logo: data.logo,
        button_logo: data.button_logo,
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
