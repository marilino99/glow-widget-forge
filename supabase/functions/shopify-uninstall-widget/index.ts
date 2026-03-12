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
      return new Response(JSON.stringify({ success: true, message: "No connection found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!conn.admin_access_token) {
      return new Response(JSON.stringify({ success: true, message: "No admin token, skipped" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Remove ScriptTags ---
    let removedScriptTags = 0;
    try {
      const listRes = await fetch(
        `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
        { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
      );

      if (listRes.ok) {
        const listData = await listRes.json();
        const widjetTags = (listData.script_tags || []).filter((t: any) =>
          t.src && t.src.includes("widget-loader")
        );

        for (const tag of widjetTags) {
          const delRes = await fetch(
            `https://${conn.store_domain}/admin/api/2024-01/script_tags/${tag.id}.json`,
            {
              method: "DELETE",
              headers: { "X-Shopify-Access-Token": conn.admin_access_token },
            }
          );
          if (delRes.ok) removedScriptTags++;
        }
      }
    } catch (e) {
      console.warn("Could not remove script tags:", e);
    }

    // --- Legacy fallback: remove snippet from theme.liquid ---
    let removedLegacy = false;
    try {
      const widjetSnippetRegex = /<!-- Start of Widjet \(widjet\.com\) code -->[\s\S]*?<!-- End of Widjet code -->/;

      const themesRes = await fetch(
        `https://${conn.store_domain}/admin/api/2024-01/themes.json`,
        { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
      );

      if (themesRes.ok) {
        const themesData = await themesRes.json();
        const mainTheme = themesData.themes?.find((t: any) => t.role === "main");

        if (mainTheme) {
          const assetRes = await fetch(
            `https://${conn.store_domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`,
            { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
          );

          if (assetRes.ok) {
            const assetData = await assetRes.json();
            const themeContent = assetData.asset?.value || "";

            if (widjetSnippetRegex.test(themeContent)) {
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
              if (updateRes.ok) removedLegacy = true;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not remove legacy snippet:", e);
    }

    console.log(`Uninstall from ${conn.store_domain}: ${removedScriptTags} script tags removed, legacy=${removedLegacy}`);
    return new Response(
      JSON.stringify({ success: true, removedScriptTags, removedLegacy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("shopify-uninstall-widget error:", error);
    return new Response(JSON.stringify({ success: true, message: "Error during uninstall" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
