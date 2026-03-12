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

    // --- ScriptTag API approach ---
    // List existing script tags to check if already installed
    const listRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
      { headers: { "X-Shopify-Access-Token": conn.admin_access_token } }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      console.error("Failed to list script tags:", listRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to access Shopify script tags. Please reconnect your store with updated permissions." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const listData = await listRes.json();
    const existingTags = listData.script_tags || [];
    const widjetTag = existingTags.find((t: any) =>
      t.src && t.src.includes("widget-loader") && t.src.includes(`widgetId=${widget.id}`)
    );

    if (checkOnly) {
      return new Response(
        JSON.stringify({ success: true, alreadyInstalled: !!widjetTag }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (widjetTag) {
      return new Response(
        JSON.stringify({ success: true, alreadyInstalled: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove any old Widjet script tags with different widget IDs
    const oldTags = existingTags.filter((t: any) =>
      t.src && t.src.includes("widget-loader") && !t.src.includes(`widgetId=${widget.id}`)
    );
    for (const old of oldTags) {
      await fetch(
        `https://${conn.store_domain}/admin/api/2024-01/script_tags/${old.id}.json`,
        {
          method: "DELETE",
          headers: { "X-Shopify-Access-Token": conn.admin_access_token },
        }
      );
    }

    // Create new ScriptTag
    const createRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": conn.admin_access_token,
        },
        body: JSON.stringify({
          script_tag: {
            event: "onload",
            src: widgetLoaderUrl,
          },
        }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Failed to create script tag:", createRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to install widget script. Please reconnect your store with updated permissions." }),
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
