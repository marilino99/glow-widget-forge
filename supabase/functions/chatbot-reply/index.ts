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
  "gonna", "vestit", "pantalone", "scarpe", "borsa", "need", "looking for", "cerco", "vorrei", "want",
  "membership", "abbonament", "pian", "subscription", "costo", "quanto costa", "tariff", "pricing",
  "how much", "offert", "deal", "pacchett", "iscrizi", "signup", "sign up", "join"
];
const CATEGORY_DISCOVERY_PATTERNS = [
  "find the right product", "help me choose", "help me find", "aiutami a scegliere",
  "cercare il prodotto adatto", "trova il prodotto", "cerco qualcosa", "looking for something",
  "i need help", "ho bisogno di aiuto", "consigliami", "recommend", "suggest",
  "quale prodotto", "which product", "what should i", "cosa mi consigli",
];

const FALLBACK_DISCOVERY_REPLY: Record<string, string> = {
  it: "Certo — che tipo di prodotto stai cercando?",
  en: "Sure — what kind of product are you looking for?",
  es: "Claro — ¿qué tipo de producto estás buscando?",
  fr: "Bien sûr — quel type de produit recherchez-vous ?",
  de: "Klar — nach welcher Art von Produkt suchst du?",
};

const FALLBACK_DISCOVERY_CHIPS: Record<string, string[]> = {
  it: ["Più popolari", "Novità", "Consigliati"],
  en: ["Best sellers", "New arrivals", "Recommended"],
  es: ["Más populares", "Novedades", "Recomendados"],
  fr: ["Best-sellers", "Nouveautés", "Recommandés"],
  de: ["Bestseller", "Neuheiten", "Empfohlen"],
};

function isCategoryDiscoveryIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  return CATEGORY_DISCOVERY_PATTERNS.some((p) => normalized.includes(p));
}

function isProductIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  // If it's a category discovery request, don't treat as product intent
  if (isCategoryDiscoveryIntent(normalized)) return false;
  return PRODUCT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function deriveDiscoveryChips(
  productCardsData: Array<{ subtitle?: string | null }> | null | undefined,
  language: string,
): string[] {
  const seen = new Set<string>();
  const subtitleChips = (productCardsData || [])
    .map((product) => (product.subtitle || "").trim())
    .filter((subtitle) => {
      if (!subtitle || subtitle.length > 32) return false;
      const key = subtitle.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);

  const fallback = FALLBACK_DISCOVERY_CHIPS[language] || FALLBACK_DISCOVERY_CHIPS.en;
  return [...subtitleChips, ...fallback.filter((chip) => !seen.has(chip.toLowerCase()))].slice(0, 3);
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
      .select("chatbot_enabled, chatbot_instructions, contact_name, language, ai_provider, ai_api_key, user_id, forward_email")
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

    // Fetch product cards for ALL users (manual + Shopify)
    const { data: productCardsData } = await supabase
      .from("product_cards")
      .select("title, subtitle, product_url, image_url, price, old_price, promo_badge, shopify_variant_id")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

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

    // If no knowledge base content and no products and product intent, suggest adding products
    if (!productCardsData?.length && isProductIntent(lastVisitorMessage) && !knowledgeBase.trim()) {
      const noProductMessages: Record<string, string> = {
        it: "Al momento non ho informazioni specifiche sui prodotti. Ti consiglio di contattarci direttamente per maggiori dettagli!",
        en: "I don't have specific product information at the moment. I suggest contacting us directly for more details!",
        es: "No tengo información específica sobre productos en este momento. ¡Te sugiero contactarnos directamente para más detalles!",
        fr: "Je n'ai pas d'informations spécifiques sur les produits pour le moment. Je vous suggère de nous contacter directement !",
        de: "Ich habe derzeit keine spezifischen Produktinformationen. Bitte kontaktieren Sie uns direkt für weitere Details!",
      };
      const noProductReply = noProductMessages[config.language] || noProductMessages.en;

      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        sender_type: "owner",
        content: noProductReply,
        is_ai_response: true,
      });

      await supabase.from("conversations").update({
        last_message: noProductReply,
        last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);

      return new Response(
        JSON.stringify({ success: true }),
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

    console.log(`Knowledge base: ${ragUsed ? "RAG" : "fallback"}, ${faqItems?.length || 0} FAQs, ${productCardsData?.length || 0} products, total chars: ${knowledgeBase.length}`);

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
5. If the user asks something truly NOT covered by the knowledge base and you cannot reasonably infer a connection, clearly state that you don't have that specific information and suggest they contact ${config.contact_name || "the business"} directly via chat${config.forward_email ? ` or at ${config.forward_email}` : ""}.
6. NEVER invent or fabricate information that is not in the knowledge base.
7. Be helpful, friendly and concise. Keep responses short (2-3 sentences max unless more detail is needed).
8. If the FAQ section contains a matching question, use that exact answer.
10. PRODUCT RECOMMENDATIONS: When the visitor asks about a SPECIFIC product, pricing, plans, or wants to see what you have, AND the Product Catalog exists above, show product cards. Keep text VERY SHORT (1 sentence). Append at the END: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT titles from catalog. NEVER describe product details in text — cards handle that.
11. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY — OVERRIDES RULE 10): When the visitor says they want help finding/choosing a product (e.g. "Find the right product for me", "Cercare il prodotto adatto a me", "Help me choose", "Aiutami a scegliere", "I need help", "looking for something", "cerco qualcosa"), you MUST follow this flow:
   - DO NOT show any [PRODUCTS:] marker
   - Ask them what type/category they're looking for
   - At the END of your response, append ONLY a [CHIPS: category1, category2, category3] marker with exactly 3 top-level categories based on the product catalog
   - Example: [CHIPS: Skincare, Home Fragrance, Accessories]
   - Write chips in the visitor's language
   - This rule takes ABSOLUTE PRIORITY over rule 10. When in doubt between showing products or asking categories, ALWAYS ask categories first.
${!productCardsData || productCardsData.length === 0 ? "12. NO PRODUCT CATALOG: There are no products configured. If the visitor asks about products or pricing, answer based on the knowledge base if available, otherwise politely explain that you don't have specific product/pricing information and suggest contacting the business directly." : ""}`;

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

    const categoryDiscoveryIntent = isCategoryDiscoveryIntent(lastVisitorMessage);

    // Parse product marker from AI reply
    let cleanReply = aiReply.trim();
    let metadata: Record<string, unknown> | null = null;

    const chipsMarkerMatch = cleanReply.match(/\[CHIPS:\s*(.+?)\]?\s*$/s);
    if (chipsMarkerMatch) {
      cleanReply = cleanReply.replace(/\[CHIPS:\s*(.+?)\]?\s*$/s, "").trim();
      const chips = chipsMarkerMatch[1].split(",").map((c: string) => c.trim()).filter(Boolean).slice(0, 3);
      if (chips.length > 0) {
        metadata = { ...(metadata || {}), chips };
        console.log(`Chips: ${chips.length} options parsed`);
      }
    }

    if (categoryDiscoveryIntent) {
      cleanReply = cleanReply.replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "").trim();
      if (!metadata?.chips) {
        metadata = {
          ...(metadata || {}),
          chips: deriveDiscoveryChips(productCardsData, config.language || "en"),
        };
        cleanReply = FALLBACK_DISCOVERY_REPLY[config.language || "en"] || FALLBACK_DISCOVERY_REPLY.en;
      }
    } else {
      // Match complete or truncated product markers: [PRODUCTS: ...] or [PRODUCTS: ... (no closing bracket)
      const productMarkerMatch = cleanReply.match(/\[PRODUCTS:\s*(.+?)\]?\s*$/s);
      const truncatedMarkerMatch = !productMarkerMatch && cleanReply.match(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s);

      if (productMarkerMatch) {
        cleanReply = cleanReply.replace(/\[PRODUCTS:\s*(.+?)\]?\s*$/s, "").trim();

        const requestedTitles = productMarkerMatch[1].split(",").map((t: string) => t.trim().toLowerCase());
        if (productCardsData && productCardsData.length > 0) {
          const matchedProducts = productCardsData.filter((p: any) =>
            requestedTitles.some((rt: string) => p.title.toLowerCase().includes(rt) || rt.includes(p.title.toLowerCase()))
          );
          const productsToShow = matchedProducts.length > 0 ? matchedProducts : productCardsData.slice(0, 3);
          const finalProducts = productsToShow.length < 2 && productCardsData.length >= 2
            ? [...productsToShow, ...productCardsData.filter((p: any) => !productsToShow.includes(p)).slice(0, 3 - productsToShow.length)]
            : productsToShow;
          metadata = {
            ...(metadata || {}),
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
        cleanReply = cleanReply.replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "").trim();
        metadata = {
          ...(metadata || {}),
          products: productCardsData.slice(0, 3).map((p: any) => ({
            title: p.title,
            imageUrl: p.image_url || null,
            productUrl: p.product_url || null,
            price: p.price || null,
            shopifyVariantId: p.shopify_variant_id || null,
          })),
        };
        console.log(`Product cards (truncated marker recovery): showing ${Math.min(3, productCardsData.length)} products`);
      }

      if (!metadata?.chips && productCardsData && productCardsData.length > 0) {
        const lastUserMsg = [...(messages || [])].reverse().find(m => m.sender_type === "visitor")?.content || "";
        const mentionsProducts = isProductIntent(lastUserMsg);
        if (mentionsProducts) {
          metadata = {
            ...(metadata || {}),
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
