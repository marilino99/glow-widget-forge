import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;

  // Clean text
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length <= CHUNK_SIZE) {
    chunks.push(cleaned);
    return chunks;
  }

  let start = 0;
  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    if (end < cleaned.length) {
      // Try to break at sentence boundary
      const lastPeriod = cleaned.lastIndexOf(". ", end);
      const lastNewline = cleaned.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + CHUNK_SIZE / 2) {
        end = breakPoint + 1;
      }
    } else {
      end = cleaned.length;
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
    if (start < 0) start = 0;
    if (end >= cleaned.length) break;
  }

  return chunks.filter((c) => c.length > 20);
}

async function getEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const results: number[][] = [];

  // Gemini embedding API supports batch requests
  for (const text of texts) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Embedding API error:", response.status, errText);
      throw new Error(`Embedding API failed: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data?.embedding?.values;
    if (!embedding) throw new Error("No embedding returned");
    results.push(embedding);
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceId } = await req.json();

    if (!sourceId) {
      return new Response(
        JSON.stringify({ error: "Missing sourceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the training source
    const { data: source, error: sourceError } = await supabase
      .from("training_sources")
      .select("id, user_id, content, title, source_type")
      .eq("id", sourceId)
      .single();

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: "Source not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!source.content || source.content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Source has no content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing source: ${source.title} (${source.content.length} chars)`);

    // Delete existing chunks for this source
    await supabase
      .from("training_chunks")
      .delete()
      .eq("source_id", sourceId);

    // Prepend title for context
    const fullText = `${source.title}\n\n${source.content}`;

    // Chunk the content
    const chunks = chunkText(fullText);
    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, chunks: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate embeddings
    const embeddings = await getEmbeddings(chunks, geminiApiKey);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Insert chunks with embeddings
    const chunkRows = chunks.map((content, index) => ({
      source_id: sourceId,
      user_id: source.user_id,
      content,
      chunk_index: index,
      embedding: JSON.stringify(embeddings[index]),
    }));

    const { error: insertError } = await supabase
      .from("training_chunks")
      .insert(chunkRows);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save chunks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully embedded ${chunks.length} chunks for source ${source.title}`);

    return new Response(
      JSON.stringify({ success: true, chunks: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate embeddings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
