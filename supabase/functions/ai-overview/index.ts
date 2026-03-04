import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { conversation_id } = await req.json();
    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "conversation_id required" }), { status: 400, headers: corsHeaders });
    }

    // Verify ownership
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, widget_owner_id")
      .eq("id", conversation_id)
      .eq("widget_owner_id", user.id)
      .single();

    if (!conv) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: corsHeaders });
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("sender_type, content, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({
        summary: "No messages in this conversation yet.",
        tags: []
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const transcript = messages
      .map((m) => `${m.sender_type === "visitor" ? "Customer" : "AI Agent"}: ${m.content}`)
      .join("\n");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: corsHeaders });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You analyze customer support chat conversations. Return a JSON object with exactly two fields:
- "summary": An array of 1-3 short paragraph strings summarizing the conversation. Each paragraph should be 1-2 sentences. Focus on what the customer wanted and what happened.
- "tags": An array of 1-4 short lowercase tag strings (e.g. "no interaction", "product inquiry", "complaint", "resolved", "billing", "technical issue"). Tags should categorize the conversation type and outcome.

Return ONLY valid JSON, no markdown or extra text.`
          },
          {
            role: "user",
            content: `Analyze this conversation:\n\n${transcript}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", errText);
      return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: corsHeaders });
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: [raw], tags: [] };
    }

    return new Response(JSON.stringify({
      summary: Array.isArray(parsed.summary) ? parsed.summary : [parsed.summary || raw],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
