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
  it: ["🔥 Più popolari", "✨ Novità", "⭐ Consigliati"],
  en: ["🔥 Best sellers", "✨ New arrivals", "⭐ Recommended"],
  es: ["🔥 Más populares", "✨ Novedades", "⭐ Recomendados"],
  fr: ["🔥 Best-sellers", "✨ Nouveautés", "⭐ Recommandés"],
  de: ["🔥 Bestseller", "✨ Neuheiten", "⭐ Empfohlen"],
};

const CATEGORY_EMOJI_MAP: [RegExp, string][] = [
  [/skin\s*care|skincare|beauty|face|viso|bellezza|pelle/i, "🧴"],
  [/hair\s*care|haircare|capelli|hair/i, "💇‍♀️"],
  [/cloth|apparel|fashion|dress|abbigli|moda|vest/i, "👗"],
  [/accessor|bag|borsa|jewel|gioiell/i, "👜"],
  [/fragranc|perfume|profum|scent/i, "🌸"],
  [/home|casa|arredo|furniture|décor|decor/i, "🏠"],
  [/food|cibo|drink|bevand|aliment/i, "🍽️"],
  [/sport|fitness|gym|palestra/i, "💪"],
  [/tech|elettron|device|gadget/i, "📱"],
  [/best.?seller|popolar|popular|più vendut/i, "🔥"],
  [/new|nov|nuov|arrival/i, "✨"],
  [/recommend|consigliat|star|⭐/i, "⭐"],
];

function hasLeadingEmoji(text: string): boolean {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return emojiRegex.test(text.trim());
}

function ensureChipEmoji(chip: string): string {
  const trimmed = chip.trim();
  if (hasLeadingEmoji(trimmed)) return trimmed;
  for (const [pattern, emoji] of CATEGORY_EMOJI_MAP) {
    if (pattern.test(trimmed)) return `${emoji} ${trimmed}`;
  }
  return trimmed;
}

function normalizeChips(chips: string[]): string[] {
  return chips.map(ensureChipEmoji);
}

const PRODUCT_CATEGORY_RULES: { label: Record<string, string>; emoji: string; keywords: RegExp }[] = [
  { label: { en: "Skincare", it: "Skincare", es: "Cuidado de la piel", fr: "Soins de la peau", de: "Hautpflege" }, emoji: "🧴", keywords: /skin|cream|cleanser|serum|moistur|sunscreen|spf|mask|face|viso|crema|detergent|idrat|pelle|scrub|eye\s*cream|mist/i },
  { label: { en: "Haircare", it: "Haircare", es: "Cuidado del cabello", fr: "Soins capillaires", de: "Haarpflege" }, emoji: "💇‍♀️", keywords: /hair|shampoo|conditioner|capelli|balsamo/i },
  { label: { en: "Clothing", it: "Abbigliamento", es: "Ropa", fr: "Vêtements", de: "Kleidung" }, emoji: "👗", keywords: /cloth|dress|shirt|pants|skirt|jacket|coat|vest|abbigli|moda|t-shirt|tshirt|jeans|hoodie|sweater/i },
  { label: { en: "Shoes", it: "Scarpe", es: "Zapatos", fr: "Chaussures", de: "Schuhe" }, emoji: "👟", keywords: /shoe|sneaker|trainer|sandal|boot|scarpe|birkenstock|nike|loafer|slipper/i },
  { label: { en: "Accessories", it: "Accessori", es: "Accesorios", fr: "Accessoires", de: "Accessoires" }, emoji: "👜", keywords: /accessor|bag|borsa|jewel|gioiell|watch|orologio|hat|cappello|scarf|belt|cintura|sunglasses|occhial/i },
  { label: { en: "Fragrance", it: "Profumi", es: "Fragancias", fr: "Parfums", de: "Düfte" }, emoji: "🌸", keywords: /fragranc|perfume|profum|scent|cologne|eau de/i },
  { label: { en: "Food & Drink", it: "Cibo e Bevande", es: "Comida y Bebida", fr: "Nourriture", de: "Essen & Trinken" }, emoji: "🍽️", keywords: /food|cibo|drink|bevand|aliment|pizza|pasta|wine|vino|coffee|caffè|tea|tè|chocolate|cioccolat/i },
  { label: { en: "Home", it: "Casa", es: "Hogar", fr: "Maison", de: "Zuhause" }, emoji: "🏠", keywords: /home|casa|arredo|furniture|décor|decor|candle|candela|pillow|cuscino|lamp/i },
  { label: { en: "Tech", it: "Tecnologia", es: "Tecnología", fr: "Tech", de: "Technik" }, emoji: "📱", keywords: /tech|elettron|device|gadget|phone|laptop|tablet|computer|smart|speaker|headphone|cuffi/i },
  { label: { en: "Sport & Fitness", it: "Sport e Fitness", es: "Deporte", fr: "Sport", de: "Sport" }, emoji: "💪", keywords: /sport|fitness|gym|palestra|yoga|running|training|workout/i },
];

function deriveProductCategories(
  products: Array<{ title: string; subtitle?: string | null }> | null | undefined,
  language: string,
): string[] {
  if (!products || products.length === 0) {
    return [];
  }

  const matchedCategories: string[] = [];
  for (const rule of PRODUCT_CATEGORY_RULES) {
    const hasMatch = products.some((p) => {
      const text = `${p.title} ${p.subtitle || ""}`;
      return rule.keywords.test(text);
    });
    if (hasMatch) {
      const label = rule.label[language] || rule.label.en;
      matchedCategories.push(`${rule.emoji} ${label}`);
    }
  }

  if (matchedCategories.length === 0) {
    return FALLBACK_DISCOVERY_CHIPS[language] || FALLBACK_DISCOVERY_CHIPS.en;
  }

  return matchedCategories.slice(0, 4);
}

function deriveDiscoveryChips(
  productCardsData: Array<{ title: string; subtitle?: string | null }> | null | undefined,
  language: string,
): string[] {
  return deriveProductCategories(productCardsData, language);
}

function isProductIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  if (isCategoryDiscoveryIntent(normalized)) return false;
  return PRODUCT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isCategoryDiscoveryIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  return CATEGORY_DISCOVERY_PATTERNS.some((pattern) => normalized.includes(pattern));
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
    const { conversationId, widgetId, voiceMode } = await req.json();

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
      .select("chatbot_enabled, chatbot_instructions, voice_instructions, contact_name, language, ai_provider, ai_api_key, user_id, forward_email, system_prompt_template, voice_system_prompt_template")
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

    let systemInstruction: string;

    // Select the appropriate template based on voice mode
    const activeTemplate = voiceMode
      ? (config.voice_system_prompt_template || null)
      : (config.system_prompt_template || null);

    const noProductsRule = !productCardsData || productCardsData.length === 0 ? "NO PRODUCT CATALOG: There are no products configured. If the visitor asks about products or pricing, answer based on the knowledge base if available, otherwise politely explain that you don't have specific product/pricing information and suggest contacting the business directly." : "";

    if (activeTemplate) {
      // Use custom system prompt template with placeholder replacements
      systemInstruction = activeTemplate
        .replace(/\{\{CONTACT_NAME\}\}/g, config.contact_name || "Support")
        .replace(/\{\{LANGUAGE\}\}/g, config.language || "en")
        .replace(/\{\{KNOWLEDGE_BASE\}\}/g, knowledgeBase)
        .replace(/\{\{ADDITIONAL_INSTRUCTIONS\}\}/g, additionalInstructions)
        .replace(/\{\{LEAD_COLLECTION\}\}/g, leadCollectionInstruction)
        .replace(/\{\{FORWARD_EMAIL\}\}/g, config.forward_email || "")
        .replace(/\{\{VOICE_MODE_HINT\}\}/g, voiceMode ? "Since the visitor is using voice mode, you MUST list the available categories naturally in your response so they can hear the options. Speak them aloud in a conversational way." : "Just write a short question.")
        .replace(/\{\{NO_PRODUCTS_RULE\}\}/g, noProductsRule);
    } else if (voiceMode) {
      // Default voice prompt (no custom template)
      systemInstruction = `You are an AI voice assistant named "${config.contact_name || "Support"}" for a business website. The visitor is interacting via VOICE — your responses will be read aloud by text-to-speech.
Language: Your default language is ${config.language || "en"}, but you MUST detect the language the visitor is speaking in and ALWAYS reply in that same language.

${knowledgeBase}
${additionalInstructions}
${leadCollectionInstruction}

VOICE-SPECIFIC RULES — CRITICAL:
1. Keep responses SHORT: 1-2 sentences max. The visitor is LISTENING, not reading.
2. Use a natural, conversational tone. Avoid formal or robotic phrasing.
3. NEVER use bullet points, numbered lists, or markdown formatting.
4. NEVER use emojis.
5. Instead of lists, speak naturally: "We have skincare, haircare, and accessories".
6. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Search it before answering.
7. If the knowledge base contains relevant info, use it. Be accurate.
8. If the question is NOT covered, say you don't have that info and suggest contacting ${config.contact_name || "the business"} directly${config.forward_email ? ` or at ${config.forward_email}` : ""}.
9. NEVER invent or fabricate information.
10. If the FAQ section contains a matching question, use that answer but rephrase it conversationally.
11. PRODUCT RECOMMENDATIONS: Keep spoken response to ONE short sentence. Append: [PRODUCTS: exact title 1, exact title 2]. Use EXACT titles from catalog.
12. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): When the visitor wants help choosing, list the available categories naturally in your spoken response so they can HEAR the options. DO NOT show [PRODUCTS:] during discovery. If the visitor says something that doesn't match any category (e.g. "something else", "other", or an unrecognized term), DO NOT say you don't understand — instead, list ALL the available product categories again so they can pick one.
12e. GIFT / THIRD-PARTY ADAPTATION: If the visitor says they are looking for a product for someone else (e.g. "my wife", "my husband", "my son", "a friend", "a gift for my mother"), you MUST adapt ALL subsequent discovery questions to refer to that person. Instead of "What are you interested in?" say "What might your wife be interested in?" (or husband, son, friend, etc.). Keep this context throughout the entire discovery flow — categories, goals, skin/hair type questions — always referring to the recipient, not the visitor.
12b. GOAL DISCOVERY: After category selection, ask about their goal/need. Append [CHIPS:] with 3-5 goals. Always include "Inspire me" as the last chip.
12c. INSPIRE ME SHORTCUT: When "Inspire me" is selected, immediately show popular products with [PRODUCTS:].
12d. SKIN/HAIR TYPE: For beauty categories, ask one more question about skin/hair type after goal selection.
${noProductsRule}`;
    } else {
      // Default chat prompt (no custom template)
      systemInstruction = `You are an AI assistant named "${config.contact_name || "Support"}" for a business website.
Language: Your default language is ${config.language || "en"}, but you MUST detect the language the visitor is writing in and ALWAYS reply in that same language. If the visitor writes in Spanish, reply in Spanish. If they write in French, reply in French. Always match the visitor's language.

${knowledgeBase}
${additionalInstructions}
${leadCollectionInstruction}


CRITICAL RULES — YOU MUST FOLLOW THESE:
1. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Before answering ANY question, search through the entire knowledge base for relevant information.
2. If the knowledge base contains information related to the user's question, you MUST use it in your answer. Do NOT generate answers from your own training data when relevant knowledge base content exists.
3. CONTEXTUAL INFERENCE: When the user asks a vague or generic question, ALWAYS try to match it against the knowledge base content.
4. When answering from the knowledge base, be accurate and cite the specific information found there.
5. If the user asks something truly NOT covered by the knowledge base, clearly state that you don't have that specific information and suggest they contact ${config.contact_name || "the business"} directly via chat${config.forward_email ? ` or at ${config.forward_email}` : ""}.
6. NEVER invent or fabricate information that is not in the knowledge base.
7. Be helpful, friendly and concise. Keep responses short (2-3 sentences max unless more detail is needed).
8. If the FAQ section contains a matching question, use that exact answer.
10. PRODUCT RECOMMENDATIONS: When the visitor asks about a SPECIFIC product, pricing, plans, or wants to see what you have, AND the Product Catalog exists above, show product cards. Keep text VERY SHORT (1 sentence). Append at the END: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT titles from catalog. NEVER describe product details in text — cards handle that.
11. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY — OVERRIDES RULE 10): When the visitor says they want help finding/choosing a product, you MUST follow this flow:
   - DO NOT show any [PRODUCTS:] marker
   - Ask them what type/category they're looking for. The category chips will be added automatically by the system. Just write a short question.
   - This rule takes ABSOLUTE PRIORITY over rule 10.
   - If the visitor says something that doesn't match any category (e.g. "something else", "other", or an unrecognized term), DO NOT say you don't understand — instead, list ALL the available product categories again so they can pick one.
11e. GIFT / THIRD-PARTY ADAPTATION: If the visitor says they are looking for a product for someone else (e.g. "my wife", "my husband", "my son", "a friend", "a gift for my mother"), you MUST adapt ALL subsequent discovery questions to refer to that person. Instead of "What are you interested in?" say "What might your wife be interested in?" (or husband, son, friend, etc.). Keep this context throughout the entire discovery flow.
11b. GOAL DISCOVERY FLOW (SECOND STEP): When the visitor selects a category, DO NOT show products yet. Ask what their goal or need is. Append [CHIPS:] with 3-5 relevant goals. Always include "Inspire me" as the last chip. Adapt goals to actual products. Do NOT add emojis to goal chips.
11c. INSPIRE ME SHORTCUT: When the visitor selects "Inspire me" (or its translation), skip ALL further discovery steps and immediately show popular products using [PRODUCTS:]. Show 3-5 products.
11d. SKIN/HAIR TYPE DISCOVERY (THIRD STEP): Only AFTER the visitor selects a goal OTHER THAN "Inspire me", if it's a beauty category, ask one more question about their skin/hair type. Skip for non-beauty categories. Only AFTER this step, show matching products using [PRODUCTS:].
${noProductsRule}`;
    }

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

      // Use faster model for voice mode to reduce latency
      const modelName = voiceMode ? "gemini-2.5-flash" : "gemini-2.5-pro";

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveApiKey}`,
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
      const chips = normalizeChips(chipsMarkerMatch[1].split(",").map((c: string) => c.trim()).filter(Boolean).slice(0, 6));
      if (chips.length > 0) {
        metadata = { ...(metadata || {}), chips };
        console.log(`Chips: ${chips.length} options parsed`);
      }
    }

    if (categoryDiscoveryIntent && productCardsData && productCardsData.length > 0) {
      cleanReply = cleanReply.replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "").trim();

      // Always force deterministic categories from the catalog
      const derivedChips = deriveDiscoveryChips(productCardsData, config.language || "en");
      if (derivedChips.length > 0) {
        metadata = { ...(metadata || {}), chips: derivedChips };
      }
      if (!cleanReply) {
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
