import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Verify user owns this widget
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

    const widjetKnowledgeBase = `
## What is Widjet
Widjet is a customizable widget that you can add to any website with a simple copy-paste of a code snippet. It helps businesses engage with their website visitors through multiple features.

## Main Features
- **Live Chat**: Real-time messaging between visitors and the site owner.
- **AI Chatbot**: Automatic AI-powered responses to visitor questions (that's you!).
- **FAQ Section**: A built-in accordion with frequently asked questions.
- **Product Cards**: A carousel of product cards with images, prices, promo badges, and links.
- **Instagram Feed**: Display Instagram posts directly inside the widget.
- **WhatsApp Integration**: A button that opens a WhatsApp conversation with the business.
- **Custom Links**: Add custom buttons/links to the widget.
- **Google Reviews**: Show Google reviews inside the widget.
- **Contact Card**: Displays the business name, avatar, and a welcome message.

## How to Install
1. Go to the Widjet builder and customize your widget.
2. Click "Add to website" to get the embed code.
3. Copy and paste the code snippet into your website's HTML, just before the closing </body> tag.
4. The widget will appear on your site immediately.
It works on any website: WordPress, Shopify, Wix, custom HTML, and more.

## Customization
From the Widjet builder you can change colors, theme, upload logo/avatar, set welcome message, enable/disable features, add product cards, FAQ items, Instagram posts, choose language, add custom CSS/JS.

## Pricing
- **Free plan**: Basic features with Widjet branding.
- **Pro plan**: All features, no branding, priority support.

## Support
If you cannot answer, suggest leaving a message or contacting support at the Widjet website.
`;

    const additionalInstructions = config.chatbot_instructions
      ? `\n\nThe site owner has provided these additional instructions:\n${config.chatbot_instructions}`
      : "";

    const systemInstruction = `You are the official Widjet assistant named "${config.contact_name || "Support"}".
Language: ALWAYS respond in ${config.language || "en"}.

${widjetKnowledgeBase}
${additionalInstructions}

STRICT RULES:
- You can ONLY answer questions about Widjet and its features.
- If someone asks about anything unrelated to Widjet, politely decline.
- Be helpful, friendly and concise.
- Keep responses short (2-3 sentences max).
- Do not make up information.`;

    // Build Gemini-compatible messages
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
            maxOutputTokens: 500,
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

    return new Response(
      JSON.stringify({ reply: aiReply.trim() }),
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
