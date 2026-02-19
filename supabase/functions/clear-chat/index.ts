import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { widgetId, visitorId, visitorToken } = await req.json();

    if (!widgetId || !visitorId || !visitorToken) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get widget owner
    const { data: config } = await supabase
      .from("widget_configurations")
      .select("user_id")
      .eq("id", widgetId)
      .maybeSingle();

    if (!config) {
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, visitor_token")
      .eq("widget_owner_id", config.user_id)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (!conversation) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate visitor token
    if (visitorToken !== conversation.visitor_token) {
      return new Response(
        JSON.stringify({ error: "Invalid visitor token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set cleared_by_visitor and cleared_at
    await supabase
      .from("conversations")
      .update({
        cleared_by_visitor: true,
        cleared_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});