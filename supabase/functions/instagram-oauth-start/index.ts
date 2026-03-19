import { createClient } from "npm:@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appId = Deno.env.get("META_APP_ID");
    if (!appId) {
      return new Response(JSON.stringify({ error: "META_APP_ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callbackUrl = `${supabaseUrl}/functions/v1/instagram-oauth-callback`;
    const state = btoa(JSON.stringify({ user_id: user.id }));

    // Request permissions for Instagram messaging
    const scopes = [
      "instagram_basic",
      "instagram_manage_messages",
      "pages_manage_metadata",
      "pages_show_list",
    ].join(",");

    const authUrl =
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&state=${encodeURIComponent(state)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&response_type=code`;

    return new Response(JSON.stringify({ url: authUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("instagram-oauth-start error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
