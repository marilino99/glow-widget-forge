import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    if (!geminiApiKey) {
      console.error("GOOGLE_GEMINI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get widget config with chatbot settings
    const { data: config, error: configError } = await supabase
      .from("widget_configurations")
      .select("chatbot_enabled, chatbot_instructions, contact_name, language")
      .eq("id", widgetId)
      .single();

    if (configError || !config) {
      console.error("Widget config not found:", configError);
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

    // Get last 20 messages for context
    const { data: messages, error: msgError } = await supabase
      .from("chat_messages")
      .select("sender_type, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (msgError) {
      console.error("Error fetching messages:", msgError);
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

    const widjetKnowledgeBase = `
## What is Widjet
Widjet is a customizable widget that you can add to any website with a simple copy-paste of a code snippet. It helps businesses engage with their website visitors through multiple features.

## Main Features
- **Live Chat**: Real-time messaging between visitors and the site owner. Visitors can ask questions and get responses.
- **AI Chatbot**: Automatic AI-powered responses to visitor questions (that's you!).
- **FAQ Section**: A built-in accordion with frequently asked questions that the owner can customize.
- **Product Cards**: A carousel of product cards with images, prices, promo badges, and links.
- **Instagram Feed**: Display Instagram posts directly inside the widget.
- **WhatsApp Integration**: A button that opens a WhatsApp conversation with the business.
- **Custom Links**: Add custom buttons/links to the widget (e.g., booking pages, social media).
- **Google Reviews**: Show Google reviews inside the widget.
- **Contact Card**: Displays the business name, avatar, and a welcome message.

## How to Install
1. Go to the Widjet builder and customize your widget.
2. Click "Add to website" to get the embed code.
3. Copy and paste the code snippet into your website's HTML, just before the closing </body> tag.
4. The widget will appear on your site immediately.
It works on any website: WordPress, Shopify, Wix, custom HTML, and more.

## Customization
From the Widjet builder you can:
- Change colors and theme (light/dark)
- Upload your logo and avatar
- Set a welcome message
- Enable/disable individual features (FAQ, Instagram, WhatsApp, etc.)
- Add product cards, FAQ items, Instagram posts
- Choose the widget language
- Add custom CSS and JavaScript for advanced customization

## Pricing
- **Free plan**: Basic features with Widjet branding.
- **Pro plan**: All features, no branding, priority support.
Visit the Widjet website for current pricing details.

## Support
If a visitor has a question you cannot answer, suggest they leave a message in the chat so the site owner can reply, or tell them to contact support at the Widjet website.
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
- If someone asks about anything unrelated to Widjet, politely decline and say you can only help with Widjet-related topics.
- Be helpful, friendly and concise.
- Keep responses short (2-3 sentences max unless more detail is needed).
- Do not make up information. If you don't know, say so and suggest contacting support.`;

    // Call Google Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
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
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Save the AI reply as an owner message
    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_type: "owner",
        content: aiReply.trim(),
      });

    if (insertError) {
      console.error("Error saving AI reply:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save reply" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update conversation last message
    await supabase
      .from("conversations")
      .update({
        last_message: aiReply.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

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
