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

    const url = new URL(req.url);
    const visitorId = url.searchParams.get("visitorId");
    const widgetId = url.searchParams.get("widgetId");
    const lastMessageId = url.searchParams.get("lastMessageId");
    const visitorToken = url.searchParams.get("visitorToken");

    if (!visitorId || !widgetId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the widget owner
    const { data: config, error: configError } = await supabase
      .from("widget_configurations")
      .select("user_id")
      .eq("id", widgetId)
      .maybeSingle();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find conversation for this visitor
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, visitor_token")
      .eq("widget_owner_id", config.user_id)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (!conversation) {
      // No conversation yet, return empty messages
      return new Response(
        JSON.stringify({ messages: [], conversationId: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate visitor token
    if (!visitorToken || visitorToken !== conversation.visitor_token) {
      return new Response(
        JSON.stringify({ error: "Invalid visitor token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query for messages
    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    // If lastMessageId is provided, only get messages after it
    if (lastMessageId) {
      const { data: lastMsg } = await supabase
        .from("chat_messages")
        .select("created_at")
        .eq("id", lastMessageId)
        .single();
      
      if (lastMsg) {
        query = query.gt("created_at", lastMsg.created_at);
      }
    }

    const { data: messages, error: msgError } = await query;

    if (msgError) {
      console.error("Error fetching messages:", msgError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch messages" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        messages: messages || [],
        conversationId: conversation.id 
      }),
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
