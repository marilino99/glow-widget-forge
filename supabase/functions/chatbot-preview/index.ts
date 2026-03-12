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
  "skirt", "dress", "pants", "shirt", "jacket", "shoe", "bag",
  "gonna", "vestit", "pantalone", "scarpe", "borsa", "cerco", "vorrei", "want"
];

function isProductIntent(text: string): boolean {
  const normalized = (text || "").toLowerCase();
  return PRODUCT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function getConnectShopifyMessage(userText: string, fallbackLanguage = "en"): string {
  const text = (userText || "").toLowerCase();
  const lang = (fallbackLanguage || "en").toLowerCase();

  if (lang.startsWith("it") || /(prodott|catalogo|mostra|negozio|vedere)/.test(text)) {
    return "Per vedere i prodotti in preview, collega prima il tuo store Shopify a Widjet dalla sezione Integrations.";
  }
  if (lang.startsWith("es") || /(producto|tienda|mostrar|catalogo)/.test(text)) {
    return "Para ver productos en la vista previa, conecta primero tu tienda Shopify a Widjet desde Integrations.";
  }
  if (lang.startsWith("fr") || /(produit|boutique|catalogue|montrer)/.test(text)) {
    return "Pour voir les produits dans l'aperçu, connectez d'abord votre boutique Shopify à Widjet depuis Integrations.";
  }
  if (lang.startsWith("de") || /(produkt|shop|katalog|zeigen)/.test(text)) {
    return "Um Produkte in der Vorschau zu sehen, verbinde zuerst deinen Shopify-Store mit Widjet unter Integrations.";
  }

  return "To see products in preview, first connect your Shopify store to Widjet from Integrations.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, widgetId } = await req.json();

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
      .select("chatbot_enabled, chatbot_instructions, contact_name, language, user_id")
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
          .select("title, subtitle, product_url, image_url, price, old_price, promo_badge")
          .eq("user_id", config.user_id)
          .order("sort_order", { ascending: true })
      : { data: null };

    // Get user's last message for RAG query
    const lastUserMessage = messages.filter((m: { sender: string }) => m.sender === "user").pop();
    const queryText = lastUserMessage?.text || "";

    // RAG: Try similarity search first
    let knowledgeBase = "";
    let usedRag = false;

    if (queryText) {
      const queryEmbedding = await generateEmbedding(queryText, geminiApiKey);
      if (queryEmbedding) {
        const { data: chunks } = await supabase.rpc("match_training_chunks", {
          query_embedding: JSON.stringify(queryEmbedding),
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
    }

    // Fallback: load training sources directly if RAG returned nothing
    if (!usedRag) {
      const { data: trainingSources } = await supabase
        .from("training_sources")
        .select("title, content, source_type")
        .eq("user_id", config.user_id)
        .neq("content", "")
        .limit(20);

      if (trainingSources && trainingSources.length > 0) {
        knowledgeBase += "\n## Website Knowledge Base\n";
        for (const source of trainingSources) {
          const content = source.content.substring(0, 3000);
          knowledgeBase += `\n### ${source.title}\n${content}\n`;
        }
      }
    }

    // Fetch FAQ items
    const { data: faqItems } = await supabase
      .from("faq_items")
      .select("question, answer")
      .eq("user_id", config.user_id)
      .order("sort_order", { ascending: true });

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
- If someone asks something not covered by the knowledge base, politely say you don't have that information and suggest they contact the business directly via chat.
- Be helpful, friendly and concise.
- Keep responses short (2-3 sentences max).
- Do not make up information.
- PRODUCT RECOMMENDATIONS (CRITICAL): When the visitor asks about products, shopping, items, or anything purchase-related AND there is a Product Catalog above, you MUST recommend relevant products. Keep your text response VERY SHORT (1 sentence max, e.g. "Ecco cosa abbiamo!" or "Here's what we have!") — do NOT describe the products in text because they will be shown as visual product cards automatically. ALWAYS append the marker at the VERY END of your response on a new line: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT product titles from the catalog. If the visitor asks generically (e.g. "what do you have?", "show me products", "cosa avete?"), include ALL products. If they ask about a specific category, include matching products. NEVER show only 1 product — always show at least 2-3. If only 1 product matches the query, add 1-2 other popular or related products from the catalog. NEVER describe product details like color, size, price in text — the cards handle that. NEVER say you don't have product information if the Product Catalog section exists above.
${!shopifyConn ? "- NO PRODUCT CATALOG: There is no Shopify store connected. If the visitor asks about products, DO NOT make up any products. Instead, politely explain that the store needs to connect their Shopify account to Widjet first in order to show products. For example: 'Per mostrare i prodotti, collega il tuo store Shopify a Widjet dalle Integrazioni!' or 'To show products, connect your Shopify store to Widjet from Integrations!'. Match the visitor's language." : ""}`;

    const conversationHistory = messages.map((msg: { text: string; sender: string }) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
            maxOutputTokens: 800,
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

    const productMarkerMatch = cleanReply.match(/\[PRODUCTS:\s*(.+?)\]\s*$/);
    if (productMarkerMatch) {
      cleanReply = cleanReply.replace(/\[PRODUCTS:\s*(.+?)\]\s*$/, "").trim();
      const requestedTitles = productMarkerMatch[1].split(",").map((t: string) => t.trim().toLowerCase());
      if (productCardsData && productCardsData.length > 0) {
        const matchedProducts = productCardsData.filter((p: any) =>
          requestedTitles.some((rt: string) => p.title.toLowerCase().includes(rt) || rt.includes(p.title.toLowerCase()))
        );
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
          })),
        };
      }
    } else if (productCardsData && productCardsData.length > 0) {
      // Fallback: if the AI talked about products but forgot the marker, check for product-related keywords
      const lastUserMsg = messages.filter((m: { sender: string }) => m.sender === "user").pop()?.text?.toLowerCase() || "";
      const productKeywords = ["product", "prodott", "buy", "compra", "acquist", "shop", "t-shirt", "tshirt", "magliett", "prezzo", "price", "catalog", "catalogo", "cosa avete", "what do you have", "show me"];
      const mentionsProducts = productKeywords.some(kw => lastUserMsg.includes(kw));
      if (mentionsProducts) {
        metadata = {
          products: productCardsData.slice(0, 3).map((p: any) => ({
            title: p.title,
            imageUrl: p.image_url || null,
            productUrl: p.product_url || null,
            price: p.price || null,
          })),
        };
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
