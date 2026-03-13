import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FREE_LIMIT = 100;
const PRO_LIMIT = 10000;

const PRODUCT_KEYWORDS = [
  "product", "products", "prodott", "buy", "compra", "acquist", "shop", "store",
  "t-shirt", "tshirt", "magliett", "prezzo", "price", "catalog", "catalogo",
  "cosa avete", "what do you have", "show me", "range", "collection",
  "skirt", "dress", "pants", "shirt", "jacket", "shoe", "bag",
  "gonna", "vestit", "pantalone", "scarpe", "borsa", "need", "looking for", "cerco", "vorrei", "want"
];

const BOOKING_KEYWORDS = [
  "appuntamento", "prenotare", "prenotazione", "prenota", "visita",
  "appointment", "book", "booking", "schedule", "reservation",
  "disponibilit", "availability", "available", "slot", "orari", "orario",
  "when can", "quando posso", "libero", "free time", "sessione", "session",
  "consulenza", "consultation", "rendez-vous", "réserver", "termin", "buchen",
  "cita", "reservar", "agendar"
];

function isProductIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  return PRODUCT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isBookingIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  return BOOKING_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function getConnectShopifyMessage(userText: string, fallbackLanguage = "en"): string {
  const text = (userText || "").toLowerCase();
  const lang = (fallbackLanguage || "en").toLowerCase();

  if (lang.startsWith("it") || /(prodott|catalogo|mostra|negozio|vedere)/.test(text)) {
    return "Per vedere i prodotti, collega prima il tuo store Shopify a Widjet dalla sezione Integrations.";
  }
  if (lang.startsWith("es") || /(producto|tienda|mostrar|catalogo)/.test(text)) {
    return "Para ver productos, conecta primero tu tienda Shopify a Widjet desde Integrations.";
  }
  if (lang.startsWith("fr") || /(produit|boutique|catalogue|montrer)/.test(text)) {
    return "Pour voir les produits, connectez d'abord votre boutique Shopify à Widjet depuis Integrations.";
  }
  if (lang.startsWith("de") || /(produkt|shop|katalog|zeigen)/.test(text)) {
    return "Um Produkte zu sehen, verbinde zuerst deinen Shopify-Store mit Widjet unter Integrations.";
  }

  return "To see products, first connect your Shopify store to Widjet from Integrations.";
}

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

async function extractAndSaveContact(
  supabase: any,
  messages: any[],
  userId: string,
  conversationId: string,
  geminiApiKey: string,
  language: string,
  country: string | null
) {
  try {
    // First try regex extraction from visitor messages only
    const visitorTexts = messages
      .filter((m) => m.sender_type === "visitor")
      .map((m) => m.content)
      .join(" ");

    const emailMatch = visitorTexts.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) return; // No email found, skip AI extraction entirely

    const extractedEmail = emailMatch[0].toLowerCase().trim();

    // Try to extract name via AI
    let extractedName: string | null = null;
    try {
      const transcript = messages
        .map((m) => `${m.sender_type === "visitor" ? "Visitor" : "Assistant"}: ${m.content}`)
        .join("\n");

      const extractionPrompt = `From this conversation, extract ONLY the visitor's name (not email). Reply with just the name as plain text, or "null" if not found. No JSON, no explanation.

Conversation:
${transcript}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: extractionPrompt }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 50 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text && text.toLowerCase() !== "null" && text.length < 100) {
          extractedName = text.replace(/['"]/g, "").trim();
        }
      }
    } catch (e) {
      console.error("Name extraction error:", e);
    }

    const parsed = { email: extractedEmail, name: extractedName };

    if (!parsed.email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parsed.email)) return;

    // Upsert contact
    await supabase.from("contacts").upsert(
      {
        user_id: userId,
        email: parsed.email.toLowerCase().trim(),
        name: parsed.name?.trim() || null,
        conversation_id: conversationId,
        channel: "chatbot",
        country: country,
        language: language,
      },
      { onConflict: "user_id,email" }
    );
  } catch (e) {
    console.error("Contact extraction error:", e);
  }
}

async function refreshCalendlyToken(
  supabase: any,
  connection: any
): Promise<string | null> {
  if (!connection.refresh_token) return null;

  const clientId = Deno.env.get("CALENDLY_CLIENT_ID");
  const clientSecret = Deno.env.get("CALENDLY_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: connection.refresh_token,
      }),
    });

    if (!res.ok) {
      console.error("Calendly token refresh failed:", await res.text());
      return null;
    }

    const data = await res.json();
    const newToken = data.access_token;
    const newRefresh = data.refresh_token;
    const expiresIn = data.expires_in;

    // Update in DB
    await supabase
      .from("calendly_connections")
      .update({
        access_token: newToken,
        refresh_token: newRefresh || connection.refresh_token,
        expires_at: expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
      })
      .eq("id", connection.id);

    return newToken;
  } catch (e) {
    console.error("Calendly token refresh error:", e);
    return null;
  }
}

async function getCalendlyAvailability(
  supabase: any,
  userId: string
): Promise<string> {
  try {
    const { data: conn } = await supabase
      .from("calendly_connections")
      .select("id, access_token, refresh_token, expires_at, scheduling_url, calendly_user_uri")
      .eq("user_id", userId)
      .maybeSingle();

    if (!conn || !conn.access_token) return "";

    let token = conn.access_token;

    // Check if token is expired
    if (conn.expires_at && new Date(conn.expires_at) < new Date()) {
      const refreshed = await refreshCalendlyToken(supabase, conn);
      if (!refreshed) return "";
      token = refreshed;
    }

    // Get event types
    const userUri = conn.calendly_user_uri;
    if (!userUri) return "";

    const eventTypesRes = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&active=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!eventTypesRes.ok) {
      console.error("Calendly event_types error:", await eventTypesRes.text());
      return "";
    }

    const eventTypesData = await eventTypesRes.json();
    const eventTypes = eventTypesData.collection || [];

    if (eventTypes.length === 0) return "";

    // Get availability for the first event type (next 7 days)
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    let availabilityInfo = "\n## === CALENDLY BOOKING AVAILABILITY ===\n";
    availabilityInfo += `Booking link: ${conn.scheduling_url || "Not available"}\n\n`;

    for (const et of eventTypes.slice(0, 3)) {
      const availRes = await fetch(
        `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(et.uri)}&start_time=${startTime}&end_time=${endTime}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!availRes.ok) {
        const errText = await availRes.text();
        console.error("Calendly availability error:", errText);
        continue;
      }

      const availData = await availRes.json();
      const slots = availData.collection || [];

      availabilityInfo += `### ${et.name} (${et.duration} min)\n`;

      if (slots.length === 0) {
        availabilityInfo += "No available slots in the next 7 days.\n\n";
        continue;
      }

      // Group slots by day
      const byDay: Record<string, string[]> = {};
      for (const slot of slots) {
        const date = new Date(slot.start_time);
        const dayKey = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        if (!byDay[dayKey]) byDay[dayKey] = [];
        byDay[dayKey].push(timeStr);
      }

      for (const [day, times] of Object.entries(byDay)) {
        availabilityInfo += `- **${day}**: ${times.join(", ")}\n`;
      }
      availabilityInfo += "\n";
    }

    availabilityInfo += "## === END OF CALENDLY AVAILABILITY ===\n";
    return availabilityInfo;
  } catch (e) {
    console.error("Calendly availability error:", e);
    return "";
  }
}

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

    // Fetch FAQ items
    const { data: faqItems } = await supabase
      .from("faq_items")
      .select("question, answer")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

    // Check if user has an active Shopify connection
    const { data: shopifyConn } = await supabase
      .from("shopify_connections")
      .select("id")
      .eq("user_id", config.user_id)
      .maybeSingle();

    // Fetch product cards only if Shopify is connected
    const { data: productCardsData } = shopifyConn
      ? await supabase
          .from("product_cards")
          .select("title, subtitle, product_url, image_url, price, old_price, promo_badge, shopify_variant_id")
          .eq("user_id", config.user_id)
          .order("sort_order", { ascending: true })
      : { data: null };

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

    // Get the last visitor message for RAG query
    const lastVisitorMessage = [...(messages || [])].reverse().find(m => m.sender_type === "visitor")?.content || "";

    // === RAG RETRIEVAL ===
    let ragContext = "";
    let ragUsed = false;

    if (lastVisitorMessage && geminiApiKey) {
      try {
        // Generate embedding for the query
        const embResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "models/gemini-embedding-001",
              content: { parts: [{ text: lastVisitorMessage }] },
              outputDimensionality: 768,
            }),
          }
        );

        if (embResponse.ok) {
          const embData = await embResponse.json();
          const queryEmbedding = embData?.embedding?.values;

          if (queryEmbedding) {
            // Search for relevant chunks
            const { data: chunks, error: matchError } = await supabase.rpc("match_training_chunks", {
              query_embedding: JSON.stringify(queryEmbedding),
              match_user_id: config.user_id,
              match_threshold: 0.25,
              match_count: 8,
            });

            if (!matchError && chunks && chunks.length > 0) {
              ragUsed = true;
              ragContext = "\n## === RELEVANT KNOWLEDGE BASE EXCERPTS (retrieved via semantic search) ===\n";
              for (const chunk of chunks) {
                ragContext += `\n[Relevance: ${(chunk.similarity * 100).toFixed(0)}%]\n${chunk.content}\n`;
              }
              ragContext += "\n## === END OF KNOWLEDGE BASE EXCERPTS ===\n";
              console.log(`RAG: found ${chunks.length} relevant chunks (best similarity: ${(chunks[0].similarity * 100).toFixed(0)}%)`);
            }
          }
        }
      } catch (ragError) {
        console.error("RAG retrieval error:", ragError);
      }
    }

    // Fallback to context stuffing if RAG didn't find results
    if (!ragUsed) {
      const { data: trainingSources } = await supabase
        .from("training_sources")
        .select("title, content, source_type")
        .eq("user_id", config.user_id)
        .neq("content", "")
        .limit(20);

      if (trainingSources && trainingSources.length > 0) {
        ragContext = "\n## === OFFICIAL KNOWLEDGE BASE ===\n";
        for (const source of trainingSources) {
          ragContext += `\n### ${source.title}\n${source.content.substring(0, 6000)}\n`;
        }
        ragContext += "\n## === END OF KNOWLEDGE BASE ===\n";
        console.log(`Fallback: using ${trainingSources.length} full sources (context stuffing)`);
      }
    }

    // Build knowledge base string
    let knowledgeBase = ragContext;
    if (faqItems && faqItems.length > 0) {
      knowledgeBase += "\n## === FREQUENTLY ASKED QUESTIONS ===\n";
      for (const faq of faqItems) {
        knowledgeBase += `\n**Q: ${faq.question}**\nA: ${faq.answer}\n`;
      }
      knowledgeBase += "\n## === END OF FAQ ===\n";
    }

    // If no knowledge base content and product intent without Shopify, suggest connecting
    if (!shopifyConn && isProductIntent(lastVisitorMessage) && !knowledgeBase.trim()) {
      const connectReply = getConnectShopifyMessage(lastVisitorMessage, config.language || "en");

      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_type: "owner",
        content: connectReply,
        is_ai_response: true,
      });

      await supabase.from("conversations").update({
        last_message: connectReply,
        last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);

      return new Response(
        JSON.stringify({ success: true, shopify_required: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add product catalog to knowledge base
    let productCatalog = "";
    if (productCardsData && productCardsData.length > 0) {
      productCatalog = "\n## === PRODUCT CATALOG ===\n";
      for (const p of productCardsData) {
        productCatalog += `\n- **${p.title}**`;
        if (p.subtitle) productCatalog += ` — ${p.subtitle}`;
        if (p.price) productCatalog += ` | Price: ${p.price}`;
        if (p.old_price) productCatalog += ` (was ${p.old_price})`;
        if (p.promo_badge && p.promo_badge !== "none") productCatalog += ` [${p.promo_badge.toUpperCase()}]`;
        productCatalog += "\n";
      }
      productCatalog += "\n## === END OF PRODUCT CATALOG ===\n";
      knowledgeBase += productCatalog;
    }

    // === CALENDLY AVAILABILITY (only if booking intent detected) ===
    let calendlySection = "";
    const bookingIntent = isBookingIntent(lastVisitorMessage);
    if (bookingIntent) {
      calendlySection = await getCalendlyAvailability(supabase, config.user_id);
      if (calendlySection) {
        knowledgeBase += calendlySection;
        console.log("Calendly availability added to context");
      }
    }

    // Also check if calendly is enabled but no booking intent — still add scheduling link for reference
    if (!bookingIntent && config.calendly_enabled && config.calendly_event_url) {
      knowledgeBase += `\n## === BOOKING INFO ===\nThis business offers appointment booking via Calendly: ${config.calendly_event_url}\n## === END BOOKING INFO ===\n`;
    }

    console.log(`Knowledge base: ${ragUsed ? "RAG" : "fallback"}, ${faqItems?.length || 0} FAQs, ${productCardsData?.length || 0} products, calendly: ${!!calendlySection}, total chars: ${knowledgeBase.length}`);

    const additionalInstructions = config.chatbot_instructions
      ? `\n\nThe site owner has provided these additional instructions:\n${config.chatbot_instructions}`
      : "";

    // Check if contact already exists for this conversation
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("id")
      .eq("conversation_id", conversationId)
      .limit(1);

    const leadCollectionInstruction = (!existingContact || existingContact.length === 0)
      ? `\n\nLEAD COLLECTION:
- When the user sends a thumbs up emoji (👍), thank them warmly and then naturally ask for their name and email so you can follow up or send them useful info. Be casual and friendly, e.g. "Glad I could help! If you'd like, leave me your name and email and we can keep in touch 😊"
- When the user sends a thumbs down emoji (👎), apologize that you weren't helpful enough and offer to connect them with a real person. Also gently ask for their name and email so the team can follow up.
- If they provide name and/or email, thank them and continue helping.
- Do not ask for contact info unless triggered by a thumbs emoji reaction.
- Do not insist if they decline.`
      : "";

    const systemInstruction = `You are an AI assistant named "${config.contact_name || "Support"}" for a business website.
Language: Your default language is ${config.language || "en"}, but you MUST detect the language the visitor is writing in and ALWAYS reply in that same language. If the visitor writes in Spanish, reply in Spanish. If they write in French, reply in French. Always match the visitor's language.

${knowledgeBase}
${additionalInstructions}
${leadCollectionInstruction}

CRITICAL RULES — YOU MUST FOLLOW THESE:
1. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Before answering ANY question, search through the entire knowledge base for relevant information.
2. If the knowledge base contains information related to the user's question, you MUST use it in your answer. Do NOT generate answers from your own training data when relevant knowledge base content exists.
3. CONTEXTUAL INFERENCE: When the user asks a vague or generic question (e.g. "what was my last experience?", "tell me about myself", "what do I do?"), ALWAYS try to match it against the knowledge base content. If the knowledge base contains a CV, resume, profile, or any personal/professional document, assume the user is asking about that content and answer accordingly. Use common sense to connect user questions to available data.
4. When answering from the knowledge base, be accurate and cite the specific information found there.
5. If the user asks something truly NOT covered by the knowledge base and you cannot reasonably infer a connection, clearly state that you don't have that specific information and suggest they contact the business directly via chat.
6. NEVER invent or fabricate information that is not in the knowledge base.
7. Be helpful, friendly and concise. Keep responses short (2-3 sentences max unless more detail is needed).
8. If the FAQ section contains a matching question, use that exact answer.
9. PRODUCT RECOMMENDATIONS (CRITICAL): When the visitor asks about products, shopping, items, or anything purchase-related AND the Product Catalog section exists above, you MUST recommend relevant products. Keep your text response VERY SHORT (1 sentence max, e.g. "Ecco cosa abbiamo!" or "Here's what we have!") — do NOT describe the products in text because they will be shown as visual product cards automatically. ALWAYS append the marker at the VERY END of your response on a new line: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT product titles from the catalog. If the visitor asks generically (e.g. "what do you have?", "show me products"), include ALL products. If they ask about a specific category, include matching ones. NEVER show only 1 product — always show at least 2-3. If only 1 product matches the query, add 1-2 other popular or related products from the catalog. NEVER describe product details like color, size, price in text — the cards handle that. NEVER say you don't have product information if the Product Catalog section exists above.
${!shopifyConn ? "10. NO PRODUCT CATALOG: There is no Shopify store connected. If the visitor asks about products, DO NOT make up any products. Instead, politely explain that the store needs to connect their Shopify account to Widjet first in order to show products. Match the visitor's language." : ""}
11. APPOINTMENT BOOKING: If the CALENDLY BOOKING AVAILABILITY section exists above, you CAN help visitors book appointments. When asked about availability, present the available time slots in a clear, friendly way grouped by day. Suggest 3-5 slots that seem most convenient. Always mention the session duration. If the visitor confirms a time, provide the booking link so they can finalize. If no Calendly data is available but the BOOKING INFO section exists, let the visitor know they can book via the provided link. NEVER invent availability times — only use data from the CALENDLY sections.`;

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
          max_tokens: 2048,
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
      // Build Gemini conversation history from messages
      const conversationHistory = (messages || []).map((msg: any) => ({
        role: msg.sender_type === "visitor" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: conversationHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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

    // Parse product marker from AI reply
    let cleanReply = aiReply.trim();
    let metadata: Record<string, unknown> | null = null;

    // Match complete or truncated product markers: [PRODUCTS: ...] or [PRODUCTS: ... (no closing bracket)
    const productMarkerMatch = cleanReply.match(/\[PRODUCTS:\s*(.+?)\]?\s*$/s);
    
    // Also catch cases where the response was truncated mid-marker, e.g. ending with "options: [" or "[PROD"
    const truncatedMarkerMatch = !productMarkerMatch && cleanReply.match(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s);

    if (productMarkerMatch) {
      // Always strip marker from visible text
      cleanReply = cleanReply.replace(/\[PRODUCTS:\s*(.+?)\]?\s*$/s, "").trim();
      
      const requestedTitles = productMarkerMatch[1].split(",").map((t: string) => t.trim().toLowerCase());
      if (productCardsData && productCardsData.length > 0) {
        const matchedProducts = productCardsData.filter((p: any) =>
          requestedTitles.some((rt: string) => p.title.toLowerCase().includes(rt) || rt.includes(p.title.toLowerCase()))
        );
        // Use matched products, or fallback to first 3 from catalog
        const productsToShow = matchedProducts.length > 0 ? matchedProducts : productCardsData.slice(0, 3);
        // Ensure at least 2-3 products
        const finalProducts = productsToShow.length < 2 && productCardsData.length >= 2
          ? [...productsToShow, ...productCardsData.filter((p: any) => !productsToShow.includes(p)).slice(0, 3 - productsToShow.length)]
          : productsToShow;
        metadata = {
          products: finalProducts.map((p: any) => ({
            title: p.title,
            imageUrl: p.image_url || null,
            productUrl: p.product_url || null,
            price: p.price || null,
            shopifyVariantId: p.shopify_variant_id || null,
          })),
        };
        console.log(`Product cards: ${matchedProducts.length} matched, showing ${finalProducts.length}`);
      }
    } else if (truncatedMarkerMatch && productCardsData && productCardsData.length > 0) {
      // The AI started the marker but got truncated — strip the partial marker and show products
      cleanReply = cleanReply.replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "").trim();
      metadata = {
        products: productCardsData.slice(0, 3).map((p: any) => ({
          title: p.title,
          imageUrl: p.image_url || null,
          productUrl: p.product_url || null,
          price: p.price || null,
          shopifyVariantId: p.shopify_variant_id || null,
        })),
      };
      console.log(`Product cards (truncated marker recovery): showing ${Math.min(3, productCardsData.length)} products`);
    } else if (productCardsData && productCardsData.length > 0) {
      // Fallback: if the AI talked about products but forgot the marker
      const lastUserMsg = [...(messages || [])].reverse().find(m => m.sender_type === "visitor")?.content || "";
      const mentionsProducts = isProductIntent(lastUserMsg);
      if (mentionsProducts) {
        metadata = {
          products: productCardsData.slice(0, 3).map((p: any) => ({
            title: p.title,
            imageUrl: p.image_url || null,
            productUrl: p.product_url || null,
            price: p.price || null,
            shopifyVariantId: p.shopify_variant_id || null,
          })),
        };
        console.log(`Product cards fallback: showing ${Math.min(3, productCardsData.length)} products`);
      }
    }

    // Save the AI reply
    const insertData: Record<string, unknown> = {
      conversation_id: conversationId,
      sender_type: "owner",
      content: cleanReply,
      is_ai_response: true,
    };
    if (metadata) {
      insertData.metadata = metadata;
    }

    const { error: insertError } = await supabase.from("chat_messages").insert(insertData);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to save reply" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("conversations").update({
      last_message: cleanReply,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);

    // === CONTACT EXTRACTION (async, non-blocking) ===
    // Get conversation metadata for country
    const { data: convData } = await supabase
      .from("conversations")
      .select("country")
      .eq("id", conversationId)
      .single();

    // Re-fetch all messages including the new AI reply
    const { data: allMessages } = await supabase
      .from("chat_messages")
      .select("sender_type, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);

    if (allMessages && allMessages.length >= 3 && geminiApiKey) {
      // Only attempt extraction if no contact exists yet for this conversation
      if (!existingContact || existingContact.length === 0) {
        await extractAndSaveContact(
          supabase,
          allMessages,
          config.user_id,
          conversationId,
          geminiApiKey,
          config.language || "en",
          convData?.country || null
        );
      }
    }
    // === END CONTACT EXTRACTION ===

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
