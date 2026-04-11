import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const VOICE_MAP: Record<string, { name: string; lang: string }> = {
  it: { name: "it-IT-Neural2-A", lang: "it-IT" },
  en: { name: "en-US-Neural2-F", lang: "en-US" },
  es: { name: "es-ES-Neural2-A", lang: "es-ES" },
  fr: { name: "fr-FR-Neural2-A", lang: "fr-FR" },
  de: { name: "de-DE-Neural2-A", lang: "de-DE" },
  pt: { name: "pt-BR-Neural2-A", lang: "pt-BR" },
  nl: { name: "nl-NL-Neural2-A", lang: "nl-NL" },
  pl: { name: "pl-PL-Neural2-A", lang: "pl-PL" },
  ja: { name: "ja-JP-Neural2-B", lang: "ja-JP" },
  ko: { name: "ko-KR-Neural2-A", lang: "ko-KR" },
  zh: { name: "cmn-CN-Neural2-A", lang: "cmn-CN" },
  ar: { name: "ar-XA-Neural2-A", lang: "ar-XA" },
  hi: { name: "hi-IN-Neural2-A", lang: "hi-IN" },
  ru: { name: "ru-RU-Neural2-A", lang: "ru-RU" },
  tr: { name: "tr-TR-Neural2-A", lang: "tr-TR" },
};

function getVoiceForLang(lang: string) {
  const short = (lang || "en").substring(0, 2).toLowerCase();
  return VOICE_MAP[short] || VOICE_MAP["en"];
}

async function tryGoogleTTS(text: string, lang: string, apiKey: string): Promise<Response | null> {
  const voice = getVoiceForLang(lang);
  const body = {
    input: { text: text.substring(0, 5000) },
    voice: {
      languageCode: voice.lang,
      name: voice.name,
      ssmlGender: "FEMALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0,
      pitch: 0,
      sampleRateHertz: 44100,
    },
  };

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      console.error("Google TTS error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.audioContent) return null;

    // Decode base64 to binary
    const binaryString = atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes.buffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (e) {
    console.error("Google TTS exception:", e);
    return null;
  }
}

async function tryElevenLabsTTS(text: string, apiKey: string): Promise<Response | null> {
  const voiceId = "FGY2WhTYpPnrIDTdsKH5"; // Laura
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.substring(0, 5000),
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("ElevenLabs error:", res.status, await res.text());
      return null;
    }

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e) {
    console.error("ElevenLabs exception:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { text, widgetId } = await req.json();

    if (!text || !widgetId) {
      return new Response(
        JSON.stringify({ error: "text and widgetId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get widget language
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: config } = await supabase
      .from("widget_configurations")
      .select("id, language")
      .eq("id", widgetId)
      .maybeSingle();

    if (!config) {
      return new Response(
        JSON.stringify({ error: "Widget not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = config.language || "en";

    // 1. Try Google Cloud TTS first
    const GOOGLE_KEY = Deno.env.get("GOOGLE_CLOUD_TTS_API_KEY");
    if (GOOGLE_KEY) {
      console.log("Trying Google Cloud TTS...");
      const googleRes = await tryGoogleTTS(text, lang, GOOGLE_KEY);
      if (googleRes) {
        console.log("Google Cloud TTS success");
        return googleRes;
      }
    }

    // 2. Try ElevenLabs
    const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY_MANUAL") || Deno.env.get("ELEVENLABS_API_KEY") || Deno.env.get("ELEVENLABS_API_KEY_1");
    if (ELEVENLABS_KEY) {
      console.log("Trying ElevenLabs TTS...");
      const elRes = await tryElevenLabsTTS(text, ELEVENLABS_KEY);
      if (elRes) {
        console.log("ElevenLabs TTS success");
        return elRes;
      }
    }

    // 3. Fallback to browser TTS
    console.log("No TTS provider available, falling back to browser");
    return new Response(
      JSON.stringify({ fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
