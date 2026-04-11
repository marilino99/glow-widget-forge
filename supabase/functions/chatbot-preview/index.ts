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
    return FALLBACK_DISCOVERY_CHIPS[language] || FALLBACK_DISCOVERY_CHIPS.en;
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
      .select("chatbot_enabled, chatbot_instructions, voice_instructions, contact_name, language, user_id, forward_email")
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

      const systemInstruction = `You are an AI assistant named "${config.contact_name || "Support"}" for a business website.
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
- CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): If the visitor asks for help choosing the right product (for example: "Find the right product for me", "Help me choose", "Aiutami a scegliere"), DO NOT show product cards yet. Ask what category/type they want. The category chips will be added automatically by the system — you do NOT need to append a [CHIPS:] marker for categories. ${voiceMode ? "Since the visitor is using voice mode, you MUST list the available categories naturally in your response so they can hear the options (e.g. 'Ok, stai cercando skincare, haircare, abbigliamento o scarpe?'). Speak them aloud in a conversational way." : 'Just write a short question like "What type of product are you looking for?".'}
- GOAL DISCOVERY FLOW (SECOND STEP): When the visitor selects a category (e.g. clicks "Skincare", "Haircare", "Clothing"), DO NOT show products yet. Instead, ask what their goal or need is within that category. Append a [CHIPS:] marker with 3-5 relevant goals/needs for that category. Do NOT prepend any emoji to goal chips. ALWAYS include a translated version of "Inspire me" as the LAST chip in every category (translations: "Ispirami" in Italian, "Inspírame" in Spanish, "Inspire-moi" in French, "Inspirier mich" in German, "Inspire me" in English). Examples by category:
  * Skincare → [CHIPS: Hydration, Anti-aging, Acne & Blemishes, Radiance, Sensitive skin, Inspire me]
  * Haircare → [CHIPS: Hydration & Repair, Volume, Shine & Smoothness, Scalp care, Inspire me]
  * Clothing → [CHIPS: Casual, Formal, Sportswear, Summer, Inspire me]
  * Accessories → [CHIPS: Bags, Jewelry, Scarves, Eyewear, Inspire me]
  * Fragrance → [CHIPS: Floral, Woody, Fresh & Citrus, Evening, Inspire me]
  Adapt the goals to the actual products in the catalog. Write goals in the visitor's language. Do NOT add emojis to goal chips.
- INSPIRE ME SHORTCUT: When the visitor selects "Inspire me" (or its translation), skip ALL further discovery steps (skin type, hair type, etc.) and immediately show the most popular products from the selected category using the [PRODUCTS:] marker. Show 3-5 products.
- SKIN/HAIR TYPE DISCOVERY (THIRD STEP): After the visitor selects a goal OTHER THAN "Inspire me" (e.g. "Hydration", "Anti-aging"), DO NOT show products yet. Ask one more question about their specific type/condition. Do NOT add emojis to these chips either. Examples:
  * Skincare goals → Ask skin type: [CHIPS: Oily, Dry, Combination, Sensitive]
  * Haircare goals → Ask hair type: [CHIPS: Thin, Thick, Curly, Straight]
  * For non-beauty categories (Clothing, Accessories, Fragrance), skip this step and show products directly after the goal.
  Translate chip labels into the visitor's language. Only AFTER this third step (or after goal for non-beauty), show the matching products using the [PRODUCTS:] marker.
- PRODUCT RECOMMENDATIONS (CRITICAL): When the visitor asks about products, shopping, items, or anything purchase-related AND there is a Product Catalog above, you MUST recommend relevant products. Keep your text response VERY SHORT (1 sentence max, e.g. "Ecco cosa abbiamo!" or "Here's what we have!") — do NOT describe the products in text because they will be shown as visual product cards automatically. ALWAYS append the marker at the VERY END of your response on a new line: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT product titles from the catalog. If the visitor asks generically (e.g. "what do you have?", "show me products", "cosa avete?"), include ALL products. If they ask about a specific category, include matching products. NEVER show only 1 product — always show at least 2-3. If only 1 product matches the query, add 1-2 other popular or related products from the catalog. NEVER describe product details like color, size, price in text — the cards handle that. NEVER say you don't have product information if the Product Catalog section exists above.
${!productCardsData || productCardsData.length === 0 ? "- NO PRODUCT CATALOG: There are no products configured. If the visitor asks about products or pricing, answer based on the knowledge base if available, otherwise politely explain that you don't have specific product/pricing information and suggest contacting the business directly." : ""}`;

    const conversationHistory = messages.map((msg: { text: string; sender: string }) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Use faster model for voice mode to reduce latency
    const modelName = voiceMode ? "gemini-2.5-flash-lite" : "gemini-2.5-flash";

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

    if (categoryDiscoveryIntent) {
      cleanReply = cleanReply
        .replace(/\[PRODUCTS:\s*(.+?)\]?\s*$/s, "")
        .replace(/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s, "")
        .trim();

      // Always force deterministic categories from the catalog
      const derivedChips = deriveDiscoveryChips(productCardsData, config.language || "en");
      metadata = { ...(metadata || {}), chips: derivedChips };
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
