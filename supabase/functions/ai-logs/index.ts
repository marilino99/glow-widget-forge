import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user || user.id !== ADMIN_USER_ID) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const filterErrors = url.searchParams.get("errors") === "true";

    // Get recent AI responses with conversation context
    const { data: messages, error: msgError } = await supabase
      .from("chat_messages")
      .select(`
        id,
        content,
        created_at,
        metadata,
        conversation_id,
        sender_type
      `)
      .eq("is_ai_response", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (msgError) throw msgError;

    // Get the visitor messages that triggered these AI responses
    const conversationIds = [...new Set((messages || []).map(m => m.conversation_id))];
    
    let visitorMessages: any[] = [];
    if (conversationIds.length > 0) {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, content, created_at, conversation_id, metadata")
        .eq("is_ai_response", false)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });
      visitorMessages = data || [];
    }

    // Build log entries
    const logs = (messages || []).map(msg => {
      const meta = msg.metadata as any || {};
      const responseTimeMs = meta.response_time_ms || meta.responseTime || null;
      const isError = meta.error === true || meta.status === "error";
      const isSlow = responseTimeMs && responseTimeMs > 5000;

      // Find the visitor message right before this AI response in the same conversation
      const visitorMsg = visitorMessages.find(
        vm => vm.conversation_id === msg.conversation_id && 
              new Date(vm.created_at) < new Date(msg.created_at)
      );

      return {
        id: msg.id,
        conversationId: msg.conversation_id,
        visitorMessage: visitorMsg?.content || null,
        aiResponse: msg.content.substring(0, 300),
        responseTimeMs,
        isError,
        isSlow,
        errorDetail: meta.error_detail || meta.errorMessage || null,
        createdAt: msg.created_at,
        senderType: msg.sender_type,
        voiceMode: meta.voice_mode || false,
      };
    });

    const filteredLogs = filterErrors 
      ? logs.filter(l => l.isError || l.isSlow) 
      : logs;

    return new Response(JSON.stringify({ logs: filteredLogs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
