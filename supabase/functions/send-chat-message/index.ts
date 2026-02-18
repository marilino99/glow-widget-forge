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

    const { widgetId, visitorId, message, visitorName, visitorToken } = await req.json();

    if (!widgetId || !visitorId || !message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0 || message.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Message must be between 1 and 10,000 characters" }),
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

    const widgetOwnerId = config.user_id;

    // Find or create conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("widget_owner_id", widgetOwnerId)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (!conversation) {
      // Create new conversation with a server-generated visitor token
      const newVisitorToken = crypto.randomUUID();

      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          widget_owner_id: widgetOwnerId,
          visitor_id: visitorId,
          visitor_name: visitorName || "Visitor",
          visitor_token: newVisitorToken,
          last_message: trimmedMessage,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      conversation = newConv;
    } else {
      // Existing conversation: validate visitor token
      if (!visitorToken || visitorToken !== conversation.visitor_token) {
        return new Response(
          JSON.stringify({ error: "Invalid visitor token" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update existing conversation
      await supabase
        .from("conversations")
        .update({
          last_message: trimmedMessage,
          last_message_at: new Date().toISOString(),
          unread_count: (conversation.unread_count || 0) + 1,
        })
        .eq("id", conversation.id);
    }

    // Insert message
    const { data: chatMessage, error: msgError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversation.id,
        sender_type: "visitor",
        content: trimmedMessage,
      })
      .select()
      .single();

    if (msgError) {
      console.error("Error inserting message:", msgError);
      return new Response(
        JSON.stringify({ error: "Failed to send message" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId: conversation.id,
        messageId: chatMessage.id,
        visitorToken: conversation.visitor_token,
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
