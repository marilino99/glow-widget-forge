import { createClient } from "npm:@supabase/supabase-js@2";

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

    // Exchange code for tokens
    const tokenRes = await fetch("https://auth.calendly.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Calendly token exchange failed:", errText);
      return new Response("Failed to get access token", { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, token_type, expires_in } = tokenData;

    if (!access_token) {
      return new Response("No access token received", { status: 500 });
    }

    // Get user info from Calendly
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let schedulingUrl: string | null = null;
    let calendlyUserUri: string | null = null;

    if (userRes.ok) {
      const userData = await userRes.json();
      schedulingUrl = userData.resource?.scheduling_url || null;
      calendlyUserUri = userData.resource?.uri || null;
    }

    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : null;

    // Save to database
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: upsertError } = await adminClient
      .from("calendly_connections")
      .upsert(
        {
          user_id: stateData.user_id,
          access_token,
          refresh_token: refresh_token || null,
          token_type: token_type || "Bearer",
          expires_at: expiresAt,
          scheduling_url: schedulingUrl,
          calendly_user_uri: calendlyUserUri,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
      return new Response("Failed to save connection", { status: 500 });
    }

    // If we have a scheduling URL, also update widget_configurations
    if (schedulingUrl) {
      await adminClient
        .from("widget_configurations")
        .update({
          calendly_enabled: true,
          calendly_event_url: schedulingUrl,
        })
        .eq("user_id", stateData.user_id);
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/builder?calendly_connected=true`,
      },
    });
  } catch (error) {
    console.error("calendly-oauth-callback error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
