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
    // Authenticate user
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

    // Get Shopify connection with admin token
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

    // Parse body for checkOnly flag
    let checkOnly = false;
    try {
      const body = await req.json();
      checkOnly = body?.checkOnly === true;
    } catch (_) {}

    // Get widget ID for this user
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

    // Build the snippet to inject
    const widgetSnippet = `\n<!-- Start of Widjet (widjet.com) code -->\n<script>\n  window.__wj = window.__wj || {};\n  window.__wj.widgetId = "${widget.id}";\n  window.__wj.product_name = "widjet";\n  ;(function(w,d,s){\n    var f=d.getElementsByTagName(s)[0],\n    j=d.createElement(s);\n    j.async=true;\n    j.src="${widgetLoaderUrl}";\n    f.parentNode.insertBefore(j,f);\n  })(window,document,'script');\n</script>\n<noscript>Enable JavaScript to use the widget powered by Widjet</noscript>\n<!-- End of Widjet code -->\n`;

    // Step 1: Get the main (published) theme
    const themesRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes.json`,
      {
        headers: { "X-Shopify-Access-Token": conn.admin_access_token },
      }
    );

    if (!themesRes.ok) {
      const errText = await themesRes.text();
      console.error("Failed to list themes:", themesRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to access Shopify themes. Please reconnect your store with updated permissions." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const themesData = await themesRes.json();
    const mainTheme = themesData.themes?.find((t: any) => t.role === "main");

    if (!mainTheme) {
      return new Response(
        JSON.stringify({ error: "Could not find the active Shopify theme" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get the theme.liquid layout
    const assetRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json?asset[key]=layout/theme.liquid`,
      {
        headers: { "X-Shopify-Access-Token": conn.admin_access_token },
      }
    );

    if (!assetRes.ok) {
      const errText = await assetRes.text();
      console.error("Failed to get theme.liquid:", assetRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to read theme layout. Please reconnect your store with updated permissions." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const assetData = await assetRes.json();
    let themeContent = assetData.asset?.value || "";

    // Check if widget is already installed
    if (themeContent.includes("widjet.com") || themeContent.includes("widget-loader")) {
      return new Response(
        JSON.stringify({ success: true, alreadyInstalled: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If checkOnly, return not installed
    if (checkOnly) {
      return new Response(
        JSON.stringify({ success: true, alreadyInstalled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Inject snippet before </body>
    const bodyCloseIndex = themeContent.lastIndexOf("</body>");
    if (bodyCloseIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Could not find </body> tag in theme layout" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    themeContent =
      themeContent.substring(0, bodyCloseIndex) +
      widgetSnippet +
      themeContent.substring(bodyCloseIndex);

    // Step 4: Update the theme.liquid
    const updateRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/themes/${mainTheme.id}/assets.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": conn.admin_access_token,
        },
        body: JSON.stringify({
          asset: {
            key: "layout/theme.liquid",
            value: themeContent,
          },
        }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error("Failed to update theme.liquid:", updateRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to update theme. Please reconnect your store with updated permissions." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("shopify-install-widget error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
