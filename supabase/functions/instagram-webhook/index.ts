import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Webhook verification (GET)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "widjet_instagram_verify";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook verified");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST — incoming messages
  try {
    const body = await req.json();

    // Respond 200 immediately to Meta (they retry otherwise)
    const processPromise = processWebhook(body);

    // Don't block the response
    processPromise.catch((e) => console.error("Webhook processing error:", e));

    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("instagram-webhook error:", error);
    return new Response("EVENT_RECEIVED", { status: 200 });
  }
});

async function processWebhook(body: any) {
  if (body.object !== "instagram") return;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceKey);

  for (const entry of body.entry || []) {
    for (const messaging of entry.messaging || []) {
      // Skip echo messages (sent by us)
      if (messaging.message?.is_echo) continue;

      const senderId = messaging.sender?.id;
      const recipientId = messaging.recipient?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !recipientId || !messageText) continue;

      console.log(`Instagram DM from ${senderId} to ${recipientId}: ${messageText}`);

      // Find the connection by Instagram page ID (recipient)
      const { data: connection, error: connError } = await adminClient
        .from("instagram_connections")
        .select("user_id, page_access_token, instagram_user_id")
        .eq("page_id", recipientId)
        .single();

      if (connError || !connection) {
        // Try matching by instagram_user_id
        const { data: conn2 } = await adminClient
          .from("instagram_connections")
          .select("user_id, page_access_token, instagram_user_id")
          .eq("instagram_user_id", recipientId)
          .single();

        if (!conn2) {
          console.warn(`No connection found for recipient ${recipientId}`);
          continue;
        }
        Object.assign(connection || {}, conn2);
        if (!connection) continue;
      }

      // Check if instagram_dm_enabled
      const { data: widgetConfig } = await adminClient
        .from("widget_configurations")
        .select("id, instagram_dm_enabled, chatbot_instructions, ai_tone, ai_temperature, language, contact_name")
        .eq("user_id", connection.user_id)
        .single();

      if (!widgetConfig?.instagram_dm_enabled) {
        console.log("Instagram DM auto-reply disabled for user", connection.user_id);
        continue;
      }

      // Generate AI reply using training data
      const aiReply = await generateAIReply(
        adminClient,
        connection.user_id,
        messageText,
        widgetConfig
      );

      if (aiReply) {
        await sendInstagramReply(connection.page_access_token, senderId, aiReply);
      }
    }
  }
}

async function generateAIReply(
  supabase: any,
  userId: string,
  userMessage: string,
  widgetConfig: any
): Promise<string | null> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return null;
    }

    // Get relevant training chunks via embedding match
    let context = "";
    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    if (GEMINI_KEY) {
      // Generate embedding for the user message
      const embRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: userMessage }] },
          }),
        }
      );

      if (embRes.ok) {
        const embData = await embRes.json();
        const embedding = embData.embedding?.values;

        if (embedding) {
          const { data: chunks } = await supabase.rpc("match_training_chunks", {
            query_embedding: `[${embedding.join(",")}]`,
            match_user_id: userId,
            match_threshold: 0.3,
            match_count: 5,
          });

          if (chunks?.length) {
            context = chunks.map((c: any) => c.content).join("\n\n");
          }
        }
      }
    }

    const systemPrompt = buildSystemPrompt(widgetConfig, context);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: widgetConfig.ai_temperature || 0.5,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      console.error("AI gateway error:", aiRes.status, await aiRes.text());
      return null;
    }

    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content;

    // Strip any markdown or product tags not suitable for DM
    return reply ? cleanReplyForDM(reply) : null;
  } catch (error) {
    console.error("generateAIReply error:", error);
    return null;
  }
}

function buildSystemPrompt(config: any, context: string): string {
  const lang = config.language === "it" ? "Italian" : "English";
  const tone = config.ai_tone || "friendly";
  const name = config.contact_name || "Support";

  let prompt = `You are ${name}, a ${tone} customer support assistant responding via Instagram DM. `;
  prompt += `Reply in ${lang}. Keep responses concise and conversational — this is a direct message, not a chat widget. `;
  prompt += `Do NOT use markdown formatting, HTML, or special tags. Use plain text only. `;
  prompt += `Do NOT include product recommendation tags or special markers.`;

  if (config.chatbot_instructions) {
    prompt += `\n\nAdditional instructions: ${config.chatbot_instructions}`;
  }

  if (context) {
    prompt += `\n\nUse the following knowledge base to answer questions:\n${context}`;
  }

  return prompt;
}

function cleanReplyForDM(text: string): string {
  // Remove markdown formatting
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[PRODUCTS:.*?\]/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .trim();

  // Instagram DM has a 1000 char limit
  if (clean.length > 950) {
    clean = clean.substring(0, 947) + "...";
  }

  return clean;
}

async function sendInstagramReply(pageAccessToken: string, recipientId: string, message: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        access_token: pageAccessToken,
      }),
    });

    if (!res.ok) {
      console.error("Failed to send Instagram reply:", res.status, await res.text());
    } else {
      console.log("Instagram reply sent to", recipientId);
    }
  } catch (error) {
    console.error("sendInstagramReply error:", error);
  }
}
