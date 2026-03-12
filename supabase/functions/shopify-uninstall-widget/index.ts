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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get Shopify connection
    const { data: conn, error: connError } = await adminClient
      .from("shopify_connections")
      .select("store_domain, admin_access_token")
      .eq("user_id", user.id)
      .single();

    if (connError || !conn) {
      // No connection found — nothing to uninstall
      return new Response(JSON.stringify({ success: true, message: "No connection found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!conn.admin_access_token) {
      // No admin token — can't access Shopify API, skip silently
      return new Response(JSON.stringify({ success: true, message: "No admin token, skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const widjetSnippetRegex = /<!-- Start of Widjet \(widjet\.com\) code -->[\s\S]*?<!-- End of Widjet code -->/;

    // Get the active theme
    const themesRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes.json`,
      { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
    );

    if (!themesRes.ok) {
      console.warn("Failed to list themes during uninstall:", themesRes.status);
      return new Response(JSON.stringify({ success: true, message: "Could not access themes" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const themesData = await themesRes.json();
    const mainTheme = themesData.themes?.find((t: any) => t.role === "main");

    if (!mainTheme) {
      return new Response(JSON.stringify({ success: true, message: "No active theme found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read theme.liquid
    const assetRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`,
      { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
    );

    if (!assetRes.ok) {
      console.warn("Failed to read theme.liquid during uninstall:", assetRes.status);
      return new Response(JSON.stringify({ success: true, message: "Could not read theme layout" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const assetData = await assetRes.json();
    const themeContent = assetData.asset?.value || "";

    if (!widjetSnippetRegex.test(themeContent)) {
      return new Response(JSON.stringify({ success: true, message: "No widget snippet found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Remove the snippet
    const cleanedContent = themeContent.replace(widjetSnippetRegex, "");

    const updateRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": conn.admin_access_token,
        },
        body: JSON.stringify({
          asset: { key: "layout/theme.liquid", value: cleanedContent },
        }),
      }
    );

    if (!updateRes.ok) {
      console.warn("Failed to update theme.liquid during uninstall:", updateRes.status);
      return new Response(JSON.stringify({ success: true, message: "Could not update theme" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Widget snippet removed from", conn.store_domain);
    return new Response(JSON.stringify({ success: true, removed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("shopify-uninstall-widget error:", error);
    // Best-effort: return success so disconnect can proceed
    return new Response(JSON.stringify({ success: true, message: "Error during uninstall" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
