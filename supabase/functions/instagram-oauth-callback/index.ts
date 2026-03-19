import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");
    const errorReason = url.searchParams.get("error_reason") || "";
    const errorDescription = url.searchParams.get("error_description") || "";

    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";

    // Handle Meta OAuth errors (e.g. insufficient role, user denied)
    if (errorParam) {
      console.error("Instagram OAuth error:", errorParam, errorReason, errorDescription);
      const desc = errorDescription.toLowerCase();
      let errorCode = "oauth_denied";
      if (desc.includes("insufficient developer role") || desc.includes("insufficient role")) {
        errorCode = "insufficient_role";
      }
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=${errorCode}` },
      });
    }

    if (!code || !state) {
      return new Response("Missing required parameters", { status: 400 });
    }

    let stateData: { user_id: string };
    try {
      stateData = JSON.parse(atob(state.replace(/ /g, "+")));
    } catch {
      return new Response("Invalid state parameter", { status: 400 });
    }

    const appId = Deno.env.get("META_APP_ID")!;
    const appSecret = Deno.env.get("META_APP_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";
    const callbackUrl = `${supabaseUrl}/functions/v1/instagram-oauth-callback`;

    // 1. Exchange code for short-lived token via Instagram API
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl,
        code,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", await tokenRes.text());
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=token_exchange` },
      });
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token;
    const igUserId = String(tokenData.user_id);

    // 2. Exchange for long-lived token
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token` +
      `&client_secret=${appSecret}` +
      `&access_token=${shortLivedToken}`
    );

    let longLivedToken = shortLivedToken;
    if (longLivedRes.ok) {
      const llData = await longLivedRes.json();
      longLivedToken = llData.access_token || shortLivedToken;
    }

    // 3. Get Instagram username
    let igUsername = "";
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=user_id,username&access_token=${longLivedToken}`
    );
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      igUsername = profileData.username || "";
    }

    // 4. Save connection to database
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { error: upsertError } = await adminClient
      .from("instagram_connections")
      .upsert(
        {
          user_id: stateData.user_id,
          instagram_user_id: igUserId,
          instagram_username: igUsername,
          page_id: igUserId,
          page_access_token: longLivedToken,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=db_save` },
      });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/builder?instagram_connected=true&ig_username=${encodeURIComponent(igUsername)}`,
      },
    });
  } catch (error) {
    console.error("instagram-oauth-callback error:", error);
    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";
    return new Response(null, {
      status: 302,
      headers: { Location: `${appUrl}/builder?instagram_error=internal` },
    });
  }
});
