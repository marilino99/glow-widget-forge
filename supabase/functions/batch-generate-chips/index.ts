import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const ecommerceChips: Record<string, string[]> = {
  en: ["Find the right product for me", "Track my order", "I need more information"],
  it: ["Cercare il prodotto adatto a me", "Tracciare il mio ordine", "Ho bisogno di più informazioni"],
  es: ["Encontrar el producto adecuado", "Rastrear mi pedido", "Necesito más información"],
  fr: ["Trouver le bon produit", "Suivre ma commande", "J'ai besoin de plus d'informations"],
  de: ["Das richtige Produkt finden", "Meine Bestellung verfolgen", "Ich brauche mehr Informationen"],
  pt: ["Encontrar o produto certo", "Rastrear meu pedido", "Preciso de mais informações"],
};

async function generateChipsWithAI(context: string, lang: string, apiKey: string): Promise<string[] | null> {
  const prompt = context.length > 0
    ? `Based on this business context: "${context}". Generate exactly 3 short action button labels (max 5 words each) that a website visitor would click to get help. Return ONLY a JSON array of 3 strings in language "${lang}". Example: ["Book a table","See the menu","Opening hours"]`
    : `Generate 3 generic short action button labels (max 5 words each) for a website chat widget. Return ONLY a JSON array of 3 strings in language "${lang}".`;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You return only valid JSON arrays. No markdown, no explanation." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length >= 3 && parsed.every((s: any) => typeof s === "string")) {
        return parsed.slice(0, 3);
      }
    }
  } catch (e) {
    console.error("AI generation failed:", e);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all widgets with null custom_chips
  const { data: widgets, error } = await supabase
    .from("widget_configurations")
    .select("id, user_id, language, chatbot_instructions")
    .is("custom_chips", null);

  if (error) {
    console.error("Error fetching widgets:", error);
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }

  const results: { id: string; status: string; chips?: string[] }[] = [];

  for (const widget of widgets || []) {
    try {
      // Check if e-commerce: has product_cards or shopify connection
      const [{ count: productCount }, { data: shopifyConn }] = await Promise.all([
        supabase.from("product_cards").select("id", { count: "exact", head: true }).eq("user_id", widget.user_id),
        supabase.from("shopify_connections").select("id").eq("user_id", widget.user_id).maybeSingle(),
      ]);

      const isEcommerce = (productCount && productCount > 0) || !!shopifyConn;
      const lang = widget.language || "en";

      if (isEcommerce) {
        const chips = ecommerceChips[lang] || ecommerceChips.en;
        await supabase.from("widget_configurations").update({ custom_chips: chips }).eq("id", widget.id);
        results.push({ id: widget.id, status: "ecommerce", chips });
      } else {
        // Non-ecommerce: gather context and use AI
        const contextParts: string[] = [];
        if (widget.chatbot_instructions) {
          contextParts.push("Business instructions: " + widget.chatbot_instructions.slice(0, 200));
        }

        const { data: faqItems } = await supabase
          .from("faq_items")
          .select("question")
          .eq("user_id", widget.user_id)
          .limit(5);
        if (faqItems && faqItems.length > 0) {
          contextParts.push("FAQ topics: " + faqItems.map((f: any) => f.question).join(", "));
        }

        const { data: customLinks } = await supabase
          .from("custom_links")
          .select("name")
          .eq("user_id", widget.user_id)
          .limit(5);
        if (customLinks && customLinks.length > 0) {
          contextParts.push("Links: " + customLinks.map((l: any) => l.name).join(", "));
        }

        const context = contextParts.join(". ").slice(0, 500);

        if (LOVABLE_API_KEY) {
          const chips = await generateChipsWithAI(context, lang, LOVABLE_API_KEY);
          if (chips) {
            await supabase.from("widget_configurations").update({ custom_chips: chips }).eq("id", widget.id);
            results.push({ id: widget.id, status: "ai_generated", chips });
          } else {
            results.push({ id: widget.id, status: "ai_failed" });
          }
        } else {
          results.push({ id: widget.id, status: "no_api_key" });
        }

        // Rate limit delay
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (e) {
      console.error(`Error processing widget ${widget.id}:`, e);
      results.push({ id: widget.id, status: "error" });
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: corsHeaders }
  );
});
