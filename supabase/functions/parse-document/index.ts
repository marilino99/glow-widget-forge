import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sourceId, filePath } = await req.json();
    if (!sourceId || !filePath) {
      return new Response(JSON.stringify({ error: "sourceId and filePath are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("training-documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let extractedText = "";
    const fileName = filePath.split("/").pop()?.toLowerCase() || "";

    if (fileName.endsWith(".pdf")) {
      // Use Lovable AI to extract text from PDF via base64
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        // Fallback: store raw text extraction attempt
        const textDecoder = new TextDecoder("utf-8", { fatal: false });
        extractedText = textDecoder.decode(await fileData.arrayBuffer());
        // Basic cleanup for PDF binary
        extractedText = extractedText.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n").trim();
      } else {
        // Convert to base64 and use AI to extract content
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "Extract ALL text content from this PDF document. Return only the extracted text, preserving the structure (headings, paragraphs, lists). Do not add any commentary.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "file",
                    file: {
                      filename: fileName,
                      file_data: `data:application/pdf;base64,${base64}`,
                    },
                  },
                  {
                    type: "text",
                    text: "Extract all text content from this document.",
                  },
                ],
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          extractedText = aiData.choices?.[0]?.message?.content || "";
        } else {
          console.error("AI extraction failed:", aiResponse.status, await aiResponse.text());
          extractedText = "[Failed to extract PDF content]";
        }
      }
    } else {
      // For .txt, .md, .doc (plain text attempt), .csv etc.
      const textDecoder = new TextDecoder("utf-8", { fatal: false });
      extractedText = textDecoder.decode(await fileData.arrayBuffer());
    }

    // Update training source with extracted content
    const { error: updateError } = await supabase
      .from("training_sources")
      .update({
        content: extractedText.slice(0, 500000), // Cap at 500k chars
        status: extractedText && extractedText !== "[Failed to extract PDF content]" ? "trained" : "error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sourceId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update source" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trigger RAG embedding generation in background
    if (extractedText && extractedText !== "[Failed to extract PDF content]") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ sourceId }),
      }).catch((err) => console.error("Failed to trigger embeddings:", err));
    }

    return new Response(
      JSON.stringify({ success: true, contentLength: extractedText.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("parse-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
