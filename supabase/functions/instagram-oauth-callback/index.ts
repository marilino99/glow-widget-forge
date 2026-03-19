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

    // 1. Exchange code for short-lived user token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&client_secret=${appSecret}` +
      `&code=${code}`
    );

    if (!tokenRes.ok) {
      console.error("Token exchange failed:", await tokenRes.text());
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=token_exchange` },
      });
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived token
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${shortLivedToken}`
    );

    let userToken = shortLivedToken;
    if (longLivedRes.ok) {
      const llData = await longLivedRes.json();
      userToken = llData.access_token || shortLivedToken;
    }

    // 3. Get user's Facebook pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}`
    );

    if (!pagesRes.ok) {
      console.error("Pages fetch failed:", await pagesRes.text());
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=pages_fetch` },
      });
    }

    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=no_pages` },
      });
    }

    // 4. Find page connected to Instagram
    let igUserId = "";
    let igUsername = "";
    let selectedPage: any = null;

    for (const page of pages) {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      if (igRes.ok) {
        const igData = await igRes.json();
        if (igData.instagram_business_account?.id) {
          igUserId = igData.instagram_business_account.id;
          selectedPage = page;

          // Get Instagram username
          const profileRes = await fetch(
            `https://graph.facebook.com/v21.0/${igUserId}?fields=username&access_token=${page.access_token}`
          );
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            igUsername = profileData.username || "";
          }
          break;
        }
      }
    }

    if (!selectedPage || !igUserId) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/builder?instagram_error=no_instagram` },
      });
    }

    // 5. Subscribe to webhook for the page
    await fetch(
      `https://graph.facebook.com/v21.0/${selectedPage.id}/subscribed_apps`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribed_fields: ["messages"],
          access_token: selectedPage.access_token,
        }),
      }
    );

    // 6. Save connection to database
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { error: upsertError } = await adminClient
      .from("instagram_connections")
      .upsert(
        {
          user_id: stateData.user_id,
          instagram_user_id: igUserId,
          instagram_username: igUsername,
          page_id: selectedPage.id,
          page_access_token: selectedPage.access_token,
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
