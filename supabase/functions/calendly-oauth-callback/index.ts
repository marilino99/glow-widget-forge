import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return new Response("Missing required parameters", { status: 400 });
    }

    let stateData: { user_id: string };
    try {
      const normalizedState = state.replace(/ /g, "+");
      stateData = JSON.parse(atob(normalizedState));
    } catch {
      return new Response("Invalid state parameter", { status: 400 });
    }

    const clientId = Deno.env.get("CALENDLY_CLIENT_ID")!;
    const clientSecret = Deno.env.get("CALENDLY_CLIENT_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/calendly-oauth-callback`;
    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";

    // Exchange code for access token
    const tokenRes = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Calendly token exchange failed:", errText);
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?calendly_error=token_failed` },
      });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in; // seconds

    if (!accessToken) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?calendly_error=no_token` },
      });
    }

    // Get user info to retrieve scheduling URL
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let schedulingUrl = "";
    let calendlyUserUri = "";
    if (userRes.ok) {
      const userData = await userRes.json();
      schedulingUrl = userData.resource?.scheduling_url || "";
      calendlyUserUri = userData.resource?.uri || "";
    } else {
      const errText = await userRes.text();
      console.warn("Could not fetch Calendly user info:", errText);
    }

    // Save to database
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const { error: upsertError } = await adminClient
      .from("calendly_connections")
      .upsert(
        {
          user_id: stateData.user_id,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          expires_at: expiresAt,
          scheduling_url: schedulingUrl,
          calendly_user_uri: calendlyUserUri,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?calendly_error=db_failed` },
      });
    }

    // Also enable calendly in widget_configurations
    await adminClient
      .from("widget_configurations")
      .update({
        calendly_enabled: true,
        calendly_event_url: schedulingUrl,
      })
      .eq("user_id", stateData.user_id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/builder?calendly_connected=true`,
      },
    });
  } catch (error) {
    console.error("calendly-oauth-callback error:", error);
    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";
    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}/builder?calendly_error=internal` },
    });
  }
});
