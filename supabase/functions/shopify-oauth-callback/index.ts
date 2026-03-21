import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const shop = url.searchParams.get("shop");

    if (!code || !state || !shop) {
      return new Response("Missing required parameters", { status: 400 });
    }

    // Decode state to get user_id
    let stateData: { user_id: string; shop: string };
    try {
      // Backward compatible: old state values could contain spaces instead of +
      const normalizedState = state.replace(/ /g, "+");
      stateData = JSON.parse(atob(normalizedState));
    } catch {
      return new Response("Invalid state parameter", { status: 400 });
    }

    const appUrl = Deno.env.get("APP_URL") || "https://widjett.lovable.app";

    const normalizeShop = (value: string) =>
      value.trim().replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();

    const requestedShop = normalizeShop(stateData.shop);
    const callbackShop = normalizeShop(shop);

    if (requestedShop !== callbackShop) {
      console.info("Shopify redirected to a different domain — using callback shop", {
        requested: requestedShop,
        actual: callbackShop,
      });
    }

    // Always use the shop domain Shopify returned (it's authoritative)
    const authorizedShop = callbackShop;

    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID")!;
    const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET")!;

    // Exchange code for access token
    const tokenRes = await fetch(`https://${authorizedShop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return new Response("Failed to get access token", { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return new Response("No access token received", { status: 500 });
    }

    // Now get a Storefront Access Token using the Admin API
    const storefrontRes = await fetch(
      `https://${authorizedShop}/admin/api/2024-01/storefront_access_tokens.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          storefront_access_token: {
            title: "Widjet Integration",
          },
        }),
      }
    );

    let storefrontToken = "";
    if (storefrontRes.ok) {
      const sfData = await storefrontRes.json();
      storefrontToken = sfData.storefront_access_token?.access_token || "";
    } else {
      // If creating fails, try to list existing ones
      const listRes = await fetch(
        `https://${authorizedShop}/admin/api/2024-01/storefront_access_tokens.json`,
        {
          headers: { "X-Shopify-Access-Token": accessToken },
        }
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const existing = listData.storefront_access_tokens?.[0];
        storefrontToken = existing?.access_token || "";
      }
    }

    if (!storefrontToken) {
      // Fallback: use admin token (less ideal but functional)
      console.warn("Could not get storefront token, using admin access token");
      storefrontToken = accessToken;
    }

    // Save to database using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: upsertError } = await adminClient
      .from("shopify_connections")
      .upsert(
        {
          user_id: stateData.user_id,
          store_domain: callbackShop,
          storefront_token: storefrontToken,
          admin_access_token: accessToken,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("DB upsert error:", upsertError);
      return new Response("Failed to save connection", { status: 500 });
    }

    // Redirect back to the app with success
    const redirectParams = new URLSearchParams({ shopify_connected: "true" });

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/builder?${redirectParams.toString()}`,
      },
    });
  } catch (error) {
    console.error("shopify-oauth-callback error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
