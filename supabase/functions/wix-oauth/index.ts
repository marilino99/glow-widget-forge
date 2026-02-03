import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // Contains user_id and widget_config_id
    const instanceId = url.searchParams.get("instanceId");

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Authorization code is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const wixAppId = Deno.env.get("WIX_APP_ID");
    const wixAppSecret = Deno.env.get("WIX_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!wixAppId || !wixAppSecret) {
      console.error("Missing Wix credentials");
      return new Response(
        JSON.stringify({ error: "Wix integration not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://www.wixapis.com/oauth/access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: wixAppId,
        client_secret: wixAppSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // Parse state to get user info
    let userId: string | null = null;
    let widgetConfigId: string | null = null;
    
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        userId = stateData.user_id;
        widgetConfigId = stateData.widget_config_id;
      } catch (e) {
        console.error("Failed to parse state:", e);
      }
    }

    // Get site info from Wix
    let siteId: string | null = null;
    try {
      const siteResponse = await fetch("https://www.wixapis.com/site-properties/v4/site", {
        headers: {
          "Authorization": access_token,
        },
      });
      if (siteResponse.ok) {
        const siteData = await siteResponse.json();
        siteId = siteData.site?.siteId || null;
      }
    } catch (e) {
      console.error("Failed to get site info:", e);
    }

    // Store installation in database
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from("wix_installations")
      .upsert({
        user_id: userId,
        wix_instance_id: instanceId || tokenData.instance_id,
        wix_site_id: siteId,
        wix_refresh_token: refresh_token,
        widget_config_id: widgetConfigId,
        script_injected: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "wix_instance_id",
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save installation" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Inject the widget script if we have a widget config
    if (widgetConfigId) {
      const widgetLoaderUrl = `${supabaseUrl}/functions/v1/widget-loader`;
      const scriptContent = `<!-- Widjet Widget -->
<script>
  window.__wj = window.__wj || {};
  window.__wj.widgetId = "${widgetConfigId}";
  window.__wj.product_name = "widjet";
  ;(function(w,d,s){
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s);
    j.async=true;
    j.src="${widgetLoaderUrl}";
    f.parentNode.insertBefore(j,f);
  })(window,document,'script');
</script>`;

      const scriptResponse = await fetch("https://www.wixapis.com/apps/v1/scripts", {
        method: "POST",
        headers: {
          "Authorization": access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: {
            content: scriptContent,
            placement: "BODY_END",
            enabled: true,
          },
        }),
      });

      if (scriptResponse.ok) {
        await supabase
          .from("wix_installations")
          .update({ script_injected: true })
          .eq("wix_instance_id", instanceId || tokenData.instance_id);
      } else {
        console.error("Script injection failed:", await scriptResponse.text());
      }
    }

    // Redirect to dashboard
    const dashboardUrl = Deno.env.get("DASHBOARD_URL") || "https://glow-widget-forge.lovable.app";
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": `${dashboardUrl}/builder?wix_connected=true`,
      },
    });
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
