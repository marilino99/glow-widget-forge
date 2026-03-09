import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const widgetLoaderUrl = `${supabaseUrl}/functions/v1/widget-loader`;

    // Check if script tag already exists
    const listRes = await fetch(
      `https://${conn.store_domain}/admin/api/2024-01/script_tags.json`,
      {
        headers: { "X-Shopify-Access-Token": conn.admin_access_token },
      }
    );

    if (listRes.ok) {
      const listData = await listRes.json();
      const existing = listData.script_tags?.find(
        (st: any) => st.src.includes("widget-loader")
      );
      if (existing) {
        return new Response(
          JSON.stringify({ success: true, alreadyInstalled: true, scriptTagId: existing.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create the ScriptTag
    // We use a wrapper script that sets the widgetId before loading the widget-loader
    const wrapperScript = `${supabaseUrl}/functions/v1/widget-loader?widgetId=${widget.id}`;

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
            src: wrapperScript,
            display_scope: "all",
          },
        }),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("ScriptTag creation failed:", createRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to install widget on Shopify", details: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const createData = await createRes.json();

    return new Response(
      JSON.stringify({ success: true, scriptTagId: createData.script_tag?.id }),
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
