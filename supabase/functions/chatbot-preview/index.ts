import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
          outputDimensionality: 768,
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data?.embedding?.values || null;
  } catch {
    return null;
  }
}

const PRODUCT_KEYWORDS = [
  "product", "products", "prodott", "buy", "compra", "acquist", "shop", "store",
  "t-shirt", "tshirt", "magliett", "prezzo", "price", "catalog", "catalogo",
  "cosa avete", "what do you have", "show me", "range", "collection",
  "what do you sell", "do you sell", "sell", "vend", "vendere", "vendita", "vendete", "cosa vendete",
  "skirt", "dress", "pants", "shirt", "jacket", "shoe", "bag",
  "gonna", "vestit", "pantalone", "scarpe", "borsa", "cerco", "vorrei", "want"
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, widgetId, voiceMode } = await req.json();

    if (!messages || !widgetId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getUser();
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get widget config
    const { data: config, error: configError } = await supabase
      .from("widget_configurations")
      .select("chatbot_enabled, chatbot_instructions, voice_instructions, contact_name, language, user_id, forward_email, system_prompt_template, voice_system_prompt_template")
      .eq("id", widgetId)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (config.user_id !== claimsData.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!config.chatbot_enabled) {
      return new Response(
        JSON.stringify({ error: "Chatbot not enabled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's last message for RAG query
    const lastUserMessage = messages.filter((m: { sender: string }) => m.sender === "user").pop();
    const queryText = lastUserMessage?.text || "";
    const productIntent = isProductIntent(queryText);
    const categoryDiscoveryIntent = isCategoryDiscoveryIntent(queryText);

    // ===== PARALLELIZED DATA FETCHING =====
    // Run all independent DB queries + embedding generation in parallel
    const [productCardsResult, faqResult, trainingSourcesResult, embeddingResult] = await Promise.all([
      // 1. Product cards
      supabase
        .from("product_cards")
        .select("title, subtitle, product_url, image_url, price, old_price, promo_badge, shopify_variant_id")
        .eq("user_id", config.user_id)
        .order("sort_order", { ascending: true }),
      // 2. FAQ items
      supabase
        .from("faq_items")
        .select("question, answer")
        .eq("user_id", config.user_id)
        .order("sort_order", { ascending: true }),
      // 3. Training sources (will be used as fallback if RAG returns nothing)
      supabase
        .from("training_sources")
        .select("title, content, source_type")
        .eq("user_id", config.user_id)
        .neq("content", "")
        .limit(20),
      // 4. Embedding generation (runs in parallel with DB queries)
      queryText ? generateEmbedding(queryText, geminiApiKey) : Promise.resolve(null),
    ]);

    const productCardsData = productCardsResult.data;
    const faqItems = faqResult.data;
    const trainingSources = trainingSourcesResult.data;

    if ((!productCardsData || productCardsData.length === 0) && categoryDiscoveryIntent) {
      const noCatalogDiscoveryReplies: Record<string, string> = {
        it: "Non ci sono ancora prodotti configurati: collega Shopify per sincronizzare il catalogo oppure aggiungi product card manuali.",
        en: "There are no products configured yet: connect Shopify to sync your catalog or add manual product cards.",
        es: "Todavía no hay productos configurados: conecta Shopify para sincronizar el catálogo o añade tarjetas de producto manuales.",
        fr: "Aucun produit n'est encore configuré : connectez Shopify pour synchroniser votre catalogue ou ajoutez des fiches produit manuelles.",
        de: "Es sind noch keine Produkte konfiguriert: Verbinde Shopify, um den Katalog zu synchronisieren, oder füge manuelle Produktkarten hinzu.",
      };

      return new Response(
        JSON.stringify({
          reply: noCatalogDiscoveryReplies[config.language || "en"] || noCatalogDiscoveryReplies.en,
          metadata: undefined,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RAG: similarity search (depends on embedding result)
    let knowledgeBase = "";
    let usedRag = false;

    if (embeddingResult) {
      const { data: chunks } = await supabase.rpc("match_training_chunks", {
        query_embedding: JSON.stringify(embeddingResult),
        match_user_id: config.user_id,
        match_threshold: 0.25,
        match_count: 8,
      });

      if (chunks && chunks.length > 0) {
        usedRag = true;
        knowledgeBase += "\n## RELEVANT KNOWLEDGE BASE EXCERPTS\n";
        for (const chunk of chunks) {
          knowledgeBase += `\n---\n${chunk.content}\n`;
        }
      }
    }

    // Fallback: use training sources if RAG returned nothing
    if (!usedRag && trainingSources && trainingSources.length > 0) {
      knowledgeBase += "\n## Website Knowledge Base\n";
      for (const source of trainingSources) {
        const content = source.content.substring(0, 3000);
        knowledgeBase += `\n### ${source.title}\n${content}\n`;
      }
    }

    // Add FAQ
    if (faqItems && faqItems.length > 0) {
      knowledgeBase += "\n## Frequently Asked Questions\n";
      for (const faq of faqItems) {
        knowledgeBase += `\n**Q: ${faq.question}**\nA: ${faq.answer}\n`;
      }
    }

    // Add product catalog
    if (productCardsData && productCardsData.length > 0) {
      knowledgeBase += "\n## PRODUCT CATALOG\n";
      for (const p of productCardsData) {
        knowledgeBase += `\n- **${p.title}**`;
        if (p.subtitle) knowledgeBase += ` — ${p.subtitle}`;
        if (p.price) knowledgeBase += ` | Price: ${p.price}`;
        if (p.old_price) knowledgeBase += ` (was ${p.old_price})`;
        if (p.promo_badge && p.promo_badge !== "none") knowledgeBase += ` [${p.promo_badge.toUpperCase()}]`;
        knowledgeBase += "\n";
      }
    }

    const additionalInstructions = config.chatbot_instructions
      ? `\n\nThe site owner has provided these additional instructions:\n${config.chatbot_instructions}`
      : "";

    let systemInstruction: string;

    // Select the appropriate template based on voice mode
    const activeTemplate = voiceMode
      ? (config.voice_system_prompt_template || null)
      : (config.system_prompt_template || null);

    const noProductsRule = !productCardsData || productCardsData.length === 0 ? "NO PRODUCT CATALOG: There are no products configured. If the visitor asks about products or pricing, answer based on the knowledge base if available, otherwise politely explain that you don't have specific product/pricing information and suggest contacting the business directly." : "";

    if (activeTemplate) {
      systemInstruction = activeTemplate
        .replace(/\{\{CONTACT_NAME\}\}/g, config.contact_name || "Support")
        .replace(/\{\{LANGUAGE\}\}/g, config.language || "en")
        .replace(/\{\{KNOWLEDGE_BASE\}\}/g, knowledgeBase)
        .replace(/\{\{ADDITIONAL_INSTRUCTIONS\}\}/g, additionalInstructions)
        .replace(/\{\{LEAD_COLLECTION\}\}/g, "")
        .replace(/\{\{FORWARD_EMAIL\}\}/g, config.forward_email || "")
        .replace(/\{\{VOICE_MODE_HINT\}\}/g, voiceMode ? "Since the visitor is using voice mode, you MUST list the available categories naturally in your response so they can hear the options. Speak them aloud in a conversational way." : 'Just write a short question like "What type of product are you looking for?".')
        .replace(/\{\{NO_PRODUCTS_RULE\}\}/g, noProductsRule);
    } else if (voiceMode) {
      // Default voice prompt (no custom template)
      systemInstruction = `You are an AI voice assistant named "${config.contact_name || "Support"}" for a business website. The visitor is interacting via VOICE — your responses will be read aloud by text-to-speech.

LANGUAGE RULE (ABSOLUTE PRIORITY): You MUST detect the language the visitor is speaking and ALWAYS reply in THAT SAME language. If the visitor speaks English, reply in English. If they speak Italian, reply in Italian. If they speak French, reply in French. NEVER default to ${config.language || "en"} if the visitor is using a different language. The visitor's language ALWAYS wins.

${knowledgeBase}
${additionalInstructions}

VOICE-SPECIFIC RULES — CRITICAL:
1. Keep responses SHORT: 1-2 sentences max. The visitor is LISTENING, not reading.
2. Use a natural, conversational tone. Avoid formal or robotic phrasing.
3. NEVER use bullet points, numbered lists, or markdown formatting.
4. NEVER use emojis.
5. Instead of lists, speak naturally: "We have skincare, haircare, and accessories".
6. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Search it before answering.
7. If the knowledge base contains relevant info, use it. Be accurate.
8. If the question is NOT covered, say you don't have that info and suggest contacting ${config.contact_name || "the business"} directly.
9. NEVER invent or fabricate information.
10. If the FAQ section contains a matching question, use that answer but rephrase it conversationally.
11. PRODUCT RECOMMENDATIONS: When showing products, ONLY show products that match the visitor's needs and the preferences they shared during profiling. NEVER show random/generic products. Keep spoken response to ONE short sentence. Append: [PRODUCTS: exact title 1, exact title 2]. Use EXACT titles from catalog.
12. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY — OVERRIDES RULE 11): When the visitor asks ANY generic or vague question about products WITHOUT specifying a category, you MUST first ask what TYPE/CATEGORY of product they are looking for. List the available categories naturally so they can HEAR the options. DO NOT show [PRODUCTS:] during discovery.
12a. SALES PROFILING (WHEN CATEGORY IS KNOWN): When the visitor ALREADY specifies a category (e.g. "I need shoes", "show me skincare", "I want a jacket"), do NOT show products immediately. Act like a skilled salesperson: ask 1-2 short qualifying questions to understand their needs better. Examples: "Do you have a style in mind — casual, elegant, sporty?", "Any preference on color?", "What size does she wear?", "Is it for a special occasion?". Adapt questions to the product category. Only show [PRODUCTS:] AFTER you have enough info to make a relevant recommendation.
12e. GIFT / THIRD-PARTY ADAPTATION: If the visitor says they are looking for a product for someone else, you MUST adapt ALL subsequent discovery and profiling questions to refer to that person. Keep this context throughout the entire flow.
12b. GOAL DISCOVERY: After category selection (from generic discovery), ask about their goal/need. Append [CHIPS:] with 3-5 goals. Always include "Inspire me" as the last chip.
12c. INSPIRE ME SHORTCUT: When "Inspire me" is selected, immediately show popular products with [PRODUCTS:].
12d. SKIN/HAIR TYPE: For beauty categories, ask one more question about skin/hair type after goal selection.
${noProductsRule}`;
    } else {
      // Default chat prompt (no custom template)
      systemInstruction = `You are an AI assistant named "${config.contact_name || "Support"}" for a business website.
Language: Your default language is ${config.language || "en"}, but you MUST detect the language the visitor is writing in and ALWAYS reply in that same language. If the visitor writes in Spanish, reply in Spanish. If they write in French, reply in French. Always match the visitor's language.

${knowledgeBase}
${additionalInstructions}


STRICT RULES:
- Use the knowledge base above to answer questions about the business, its products, services, and FAQ.
- If the knowledge base contains relevant information, use it to give accurate, helpful answers.
- If someone asks something not covered by the knowledge base, politely say you don't have that information and suggest they contact the business directly via chat${config.forward_email ? ` or at ${config.forward_email}` : ""}.
- Be helpful, friendly and concise.
- Keep responses short (2-3 sentences max).
- Do not make up information.
- CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): If the visitor asks for help choosing the right product WITHOUT specifying a category, DO NOT show product cards yet. Ask what category/type they want. The category chips will be added automatically by the system. Just write a short question. If the visitor says something that doesn't match any category, list ALL the available product categories again.
- SALES PROFILING (WHEN CATEGORY IS KNOWN): When the visitor specifies a category (e.g. "I need shoes", "scarpe per mia moglie"), do NOT show products immediately. Act like a skilled salesperson: ask 1-2 short qualifying questions to understand their preferences (style, color, size, occasion, etc.). Adapt questions to the product category. Only show products AFTER gathering enough info to make a personalized recommendation.
- GIFT / THIRD-PARTY ADAPTATION: If the visitor says they are looking for a product for someone else, adapt ALL subsequent discovery and profiling questions to refer to that person. Keep this context throughout the entire flow.
- GOAL DISCOVERY FLOW (SECOND STEP): When the visitor selects a category from chips (generic discovery path), DO NOT show products yet. Ask what their goal or need is. Append [CHIPS:] with 3-5 relevant goals. Always include "Inspire me" as the last chip.
  Adapt the goals to the actual products in the catalog. Write goals in the visitor's language. Do NOT add emojis to goal chips.
- INSPIRE ME SHORTCUT: When the visitor selects "Inspire me" (or its translation), skip ALL further discovery steps and immediately show popular products using [PRODUCTS:]. Show 3-5 products.
- SKIN/HAIR TYPE DISCOVERY (THIRD STEP): After the visitor selects a goal OTHER THAN "Inspire me", ask about their specific type/condition for beauty categories. Skip for non-beauty categories.
- PRODUCT RECOMMENDATIONS (CRITICAL): When the visitor asks about a SPECIFIC product by name AND there is a Product Catalog above, recommend it. Keep text VERY SHORT (1 sentence). Append: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT titles from catalog. NEVER describe product details in text — cards handle that.
${noProductsRule}`;
    }

    const conversationHistory = messages.map((msg: { text: string; sender: string }) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Use faster model for voice mode to reduce latency
    const modelName = voiceMode ? "gemini-2.5-flash" : "gemini-2.5-pro";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: voiceMode ? 400 : 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      const status = geminiResponse.status === 429 ? 429 : 500;
      const message = geminiResponse.status === 429
        ? "Rate limit exceeded. Please try again in a minute."
        : "AI generation failed";
      return new Response(
        JSON.stringify({ error: message }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const aiReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      console.error("No reply from Gemini:", JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: "No AI response generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse product marker
    let cleanReply = aiReply.trim();
    let metadata: Record<string, unknown> | undefined = undefined;

    console.log(`AI raw reply (last 100 chars): ...${cleanReply.slice(-100)}`);
    console.log(`Product cards available: ${productCardsData?.length || 0}`);

    const chipsMarkerMatch = cleanReply.match(/\[CHIPS:\s*(.+?)\]?\s*$/s);
    if (chipsMarkerMatch) {
      cleanReply = cleanReply.replace(/\[CHIPS:\s*(.+?)\]?\s*$/s, "").trim();
      const chips = normalizeChips(chipsMarkerMatch[1].split(",").map((chip: string) => chip.trim()).filter(Boolean).slice(0, 6));
      if (chips.length > 0) {
        metadata = { ...(metadata || {}), chips };
      }
    }

    if (categoryDiscoveryIntent && productCardsData && productCardsData.length > 0) {
      cleanReply = cleanReply
        .replace(/\[PRODUCTS:\s*(.+?)\]?\s*$/s, "")
        .replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "")
        .trim();

      // Always force deterministic categories from the catalog
      const derivedChips = deriveDiscoveryChips(productCardsData, config.language || "en");
      if (derivedChips.length > 0) {
        metadata = { ...(metadata || {}), chips: derivedChips };
      }
      if (!cleanReply) {
        cleanReply = FALLBACK_DISCOVERY_REPLY[config.language || "en"] || FALLBACK_DISCOVERY_REPLY.en;
      }
    } else {
      const productMarkerMatch = cleanReply.match(/\[PRODUCTS:\s*(.+?)\]\s*$/);
      if (productMarkerMatch) {
        cleanReply = cleanReply.replace(/\[PRODUCTS:\s*(.+?)\]\s*$/, "").trim();
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
        }
      } else if (productCardsData && productCardsData.length > 0) {
      // Fallback: if the AI talked about products but forgot the marker, check for product-related keywords
        const lastUserMsg = messages.filter((m: { sender: string }) => m.sender === "user").pop()?.text || "";
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
        }
      }
    }

    return new Response(
      JSON.stringify({ reply: cleanReply, metadata }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chatbot preview error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
