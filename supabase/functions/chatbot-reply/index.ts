import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FREE_LIMIT = 100;
const PRO_LIMIT = 10000;

async function getMonthlyAiCount(supabase: any, userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("chat_messages")
    .select("id, conversations!inner(widget_owner_id)", { count: "exact", head: true })
    .eq("is_ai_response", true)
    .eq("conversations.widget_owner_id", userId)
    .gte("created_at", startOfMonth);

  return count ?? 0;
}

async function getUserPlan(userId: string, supabase: any): Promise<"free" | "pro"> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return "free";

  // Get user email
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const email = userData?.user?.email;
  if (!email) return "free";

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return "free";

  const subscriptions = await stripe.subscriptions.list({
    customer: customers.data[0].id,
    status: "active",
    limit: 1,
  });

  return subscriptions.data.length > 0 ? "pro" : "free";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, widgetId } = await req.json();

    if (!conversationId || !widgetId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get widget config with chatbot settings
    const { data: config, error: configError } = await supabase
      .from("widget_configurations")
      .select("chatbot_enabled, chatbot_instructions, contact_name, language, ai_provider, ai_api_key, user_id")
      .eq("id", widgetId)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!config.chatbot_enabled) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Chatbot not enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === LIMIT CHECK ===
    const monthlyCount = await getMonthlyAiCount(supabase, config.user_id);
    const plan = await getUserPlan(config.user_id, supabase);
    const limit = plan === "pro" ? PRO_LIMIT : FREE_LIMIT;

    if (monthlyCount >= limit) {
      // Insert fallback message instead of AI response
      const fallbackMessages: Record<string, string> = {
        it: "L'assistente non è al momento disponibile. Lascia un messaggio e ti risponderemo il prima possibile.",
        en: "The assistant is currently unavailable. Leave a message and we'll get back to you as soon as possible.",
        es: "El asistente no está disponible en este momento. Deja un mensaje y te responderemos lo antes posible.",
        fr: "L'assistant n'est pas disponible pour le moment. Laissez un message et nous vous répondrons dès que possible.",
        de: "Der Assistent ist derzeit nicht verfügbar. Hinterlassen Sie eine Nachricht und wir melden uns so schnell wie möglich.",
      };
      const fallbackMessage = fallbackMessages[config.language] || fallbackMessages.en;

      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_type: "owner",
        content: fallbackMessage,
        is_ai_response: true,
      });

      await supabase.from("conversations").update({
        last_message: fallbackMessage,
        last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);

      return new Response(
        JSON.stringify({ success: true, limited: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // === END LIMIT CHECK ===

    if (!geminiApiKey && !config.ai_api_key) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch training sources and FAQ items
    const [{ data: trainingSources }, { data: faqItems }] = await Promise.all([
      supabase.from("training_sources").select("title, content, source_type").eq("user_id", config.user_id).eq("status", "scraped").limit(20),
      supabase.from("faq_items").select("question, answer").eq("user_id", config.user_id).order("sort_order", { ascending: true }),
    ]);

    // Get last 20 messages for context
    const { data: messages, error: msgError } = await supabase
      .from("chat_messages")
      .select("sender_type, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (msgError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch messages" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build conversation history for Gemini
    const conversationHistory = (messages || []).map((msg) => ({
      role: msg.sender_type === "visitor" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Build knowledge base
    let knowledgeBase = "";
    if (trainingSources && trainingSources.length > 0) {
      knowledgeBase += "\n## Website Knowledge Base\n";
      for (const source of trainingSources) {
        knowledgeBase += `\n### ${source.title}\n${source.content.substring(0, 3000)}\n`;
      }
    }
    if (faqItems && faqItems.length > 0) {
      knowledgeBase += "\n## Frequently Asked Questions\n";
      for (const faq of faqItems) {
        knowledgeBase += `\n**Q: ${faq.question}**\nA: ${faq.answer}\n`;
      }
    }

    const additionalInstructions = config.chatbot_instructions
      ? `\n\nThe site owner has provided these additional instructions:\n${config.chatbot_instructions}`
      : "";

    const systemInstruction = `You are an AI assistant named "${config.contact_name || "Support"}" for a business website.
Language: ALWAYS respond in ${config.language || "en"}.

${knowledgeBase}
${additionalInstructions}

STRICT RULES:
- Use the knowledge base above to answer questions about the business, its products, services, and FAQ.
- If the knowledge base contains relevant information, use it to give accurate, helpful answers.
- If someone asks something not covered by the knowledge base, politely say you don't have that information and suggest they contact the business directly via chat.
- Be helpful, friendly and concise.
- Keep responses short (2-3 sentences max unless more detail is needed).
- Do not make up information. Only use what's in the knowledge base.`;

    // Determine which API key and model to use
    const userApiKey = config.ai_api_key;
    const aiProvider = config.ai_provider || "google";
    const effectiveApiKey = userApiKey || geminiApiKey;

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let aiReply: string | undefined;

    if (aiProvider === "openai" && userApiKey) {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userApiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            ...(messages || []).map((msg: any) => ({
              role: msg.sender_type === "visitor" ? "user" : "assistant",
              content: msg.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error("OpenAI API error:", openaiResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI generation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const openaiData = await openaiResponse.json();
      aiReply = openaiData?.choices?.[0]?.message?.content;
    } else {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: conversationHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API error:", geminiResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI generation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const geminiData = await geminiResponse.json();
      aiReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    if (!aiReply) {
      return new Response(
        JSON.stringify({ error: "No AI response generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save the AI reply
    const { error: insertError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "owner",
      content: aiReply.trim(),
      is_ai_response: true,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save reply" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("conversations").update({
      last_message: aiReply.trim(),
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chatbot reply error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
