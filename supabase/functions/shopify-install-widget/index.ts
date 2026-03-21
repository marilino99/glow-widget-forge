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

    const { data: conn, error: connError } = await adminClient
      .from("shopify_connections")
      .select("store_domain, admin_access_token")
      .eq("user_id", user.id)
      .single();

    if (connError || !conn) {
      return new Response(JSON.stringify({ error: "No Shopify store connected" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!conn.admin_access_token) {
      return new Response(JSON.stringify({ error: "Missing admin token. Please reconnect your Shopify store." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let checkOnly = false;
    let forceReinstall = false;
    try {
      const body = await req.json();
      checkOnly = body?.checkOnly === true;
      forceReinstall = body?.forceReinstall === true;
    } catch (_) {}

    const { data: widget } = await adminClient
      .from("widget_configurations")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!widget) {
      return new Response(JSON.stringify({ error: "No widget configured" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const widgetLoaderUrl = `${supabaseUrl}/functions/v1/widget-loader?widgetId=${widget.id}`;

    console.log(`[install-widget] Store: ${conn.store_domain}, Widget: ${widget.id}, checkOnly: ${checkOnly}, forceReinstall: ${forceReinstall}`);

    // --- Primary method: theme.liquid injection (most reliable for custom distribution apps) ---
    console.log("[install-widget] Using theme.liquid as primary installation method");
    const themeLiquidResult = await installViaThemeLiquid(conn.store_domain, conn.admin_access_token, widgetLoaderUrl, widget.id, checkOnly);

    if (themeLiquidResult.error) {
      console.error("[install-widget] theme.liquid installation failed:", themeLiquidResult.error);
    } else {
      console.log(`[install-widget] theme.liquid result: alreadyInstalled=${themeLiquidResult.alreadyInstalled}, method=${themeLiquidResult.method}`);
    }

    // --- Also ensure ScriptTag exists as backup ---
    if (!checkOnly) {
      try {
        const listRes = await fetch(
          `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
          { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
        );

        if (listRes.ok) {
          const listData = await listRes.json();
          const existingTags = listData.script_tags || [];
          const allWidjetTags = existingTags.filter((t: any) => t.src && t.src.includes("widget-loader"));
          const correctTag = allWidjetTags.find((t: any) => t.src.includes(`widgetId=${widget.id}`));

          if (!correctTag || forceReinstall) {
            // Remove old tags
            for (const old of allWidjetTags) {
              console.log(`[install-widget] Removing old ScriptTag ${old.id}`);
              await fetch(
                `https://${conn.store_domain}/admin/api/2024-01/script_tags/${old.id}.json`,
                { method: "DELETE", headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
              );
            }
            // Create new ScriptTag as backup
            const createRes = await fetch(
              `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": conn.admin_access_token },
                body: JSON.stringify({ script_tag: { event: "onload", src: widgetLoaderUrl } }),
              }
            );
            if (createRes.ok) {
              console.log("[install-widget] ScriptTag backup also created");
            } else {
              console.warn("[install-widget] ScriptTag backup failed (non-critical):", await createRes.text());
            }
          }
        }
      } catch (e) {
        console.warn("[install-widget] ScriptTag backup error (non-critical):", e);
      }
    }

    return new Response(
      JSON.stringify(themeLiquidResult),
      { status: themeLiquidResult.error ? 500 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[install-widget] error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getMainTheme(storeDomain: string, token: string) {
  const themesRes = await fetch(
    `https://${storeDomain}/admin/api/2024-01/themes.json`,
    { headers: { "X-Shopify-Access-Token": token } }
  );
  if (!themesRes.ok) return null;
  const themesData = await themesRes.json();
  return themesData.themes?.find((t: any) => t.role === "main") || null;
}

async function cleanThemeLiquid(storeDomain: string, token: string) {
  const mainTheme = await getMainTheme(storeDomain, token);
  if (!mainTheme) return;

  const assetRes = await fetch(
    `https://${storeDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`,
    { headers: { "X-Shopify-Access-Token": token } }
  );
  if (!assetRes.ok) return;

  const assetData = await assetRes.json();
  const content = assetData.asset?.value || "";
  const regex = /<!-- Start of Widjet \(widjet\.com\) code -->[\s\S]*?<!-- End of Widjet code -->/;

  if (regex.test(content)) {
    const cleaned = content.replace(regex, "");
    await fetch(
      `https://${storeDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
        body: JSON.stringify({ asset: { key: "layout/theme.liquid", value: cleaned } }),
      }
    );
    console.log("[install-widget] Removed legacy theme.liquid snippet");
  }
}

async function installViaThemeLiquid(storeDomain: string, token: string, loaderUrl: string, widgetId: string, checkOnly: boolean) {
  const snippet =
    `<!-- Start of Widjet (widjet.com) code -->\n` +
    `<script src="${loaderUrl}" defer></script>\n` +
    `<!-- End of Widjet code -->`;

  const mainTheme = await getMainTheme(storeDomain, token);
  if (!mainTheme) {
    return { error: "No active theme found on Shopify store." };
  }

  const assetRes = await fetch(
    `https://${storeDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`,
    { headers: { "X-Shopify-Access-Token": token } }
  );
  if (!assetRes.ok) {
    return { error: "Failed to read theme layout." };
  }

  const assetData = await assetRes.json();
  let themeContent = assetData.asset?.value || "";
  const regex = /<!-- Start of Widjet \(widjet\.com\) code -->[\s\S]*?<!-- End of Widjet code -->/;
  const hasSnippet = regex.test(themeContent);

  // Check if existing snippet has correct widgetId
  const hasCorrectSnippet = hasSnippet && themeContent.includes(`widgetId=${widgetId}`);

  if (checkOnly) {
    return { success: true, alreadyInstalled: hasCorrectSnippet, method: "theme_liquid" };
  }

  // Remove old snippet if present
  if (hasSnippet) {
    themeContent = themeContent.replace(regex, "");
  }

  // Inject before </body>
  const updatedContent = themeContent.replace("</body>", `${snippet}\n</body>`);

  const updateRes = await fetch(
    `https://${storeDomain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ asset: { key: "layout/theme.liquid", value: updatedContent } }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error(`[install-widget] theme.liquid update failed: ${updateRes.status} ${errText}`);
    return { error: "Failed to install widget in theme. Please try again." };
  }

  console.log(`[install-widget] Installed via theme.liquid for ${storeDomain}`);
  return { success: true, method: "theme_liquid" };
}
