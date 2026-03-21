import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_ADMIN_PRODUCTS_QUERY = `
  query ($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          descriptionHtml
          onlineStoreUrl
          featuredImage {
            url
          }
          variants(first: 1) {
            edges {
              node {
                id
                price
                compareAtPrice
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: connection, error: connError } = await adminClient
      .from("shopify_connections")
      .select("store_domain, admin_access_token")
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "No Shopify connection found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!connection.admin_access_token) {
      return new Response(
        JSON.stringify({ error: "Missing admin access token. Please reconnect your Shopify store." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { store_domain, admin_access_token } = connection;

    // Use Admin API GraphQL endpoint with the access token
    const allProducts: any[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage && allProducts.length < 50) {
      const res = await fetch(
        `https://${store_domain}/admin/api/2024-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": storefront_token,
          },
          body: JSON.stringify({
            query: SHOPIFY_ADMIN_PRODUCTS_QUERY,
            variables: { first: 50, after },
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shopify Admin API error [${res.status}]: ${text}`);
      }

      const json = await res.json();
      if (json.errors) {
        throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      const { edges, pageInfo } = json.data.products;
      for (const { node } of edges) {
        const variant = node.variants?.edges?.[0]?.node;
        const price = variant?.price ? parseFloat(variant.price) : null;
        const compareAt = variant?.compareAtPrice ? parseFloat(variant.compareAtPrice) : null;
        const hasDiscount = compareAt && price && compareAt > price;

        // Extract numeric variant ID from GID (gid://shopify/ProductVariant/12345 -> 12345)
        let variantId: string | null = null;
        if (variant?.id) {
          const match = variant.id.match(/(\d+)$/);
          variantId = match ? match[1] : variant.id;
        }

        // Strip HTML tags from description
        const plainDesc = node.descriptionHtml
          ? node.descriptionHtml.replace(/<[^>]*>/g, "").substring(0, 120)
          : null;

        allProducts.push({
          title: node.title,
          subtitle: plainDesc || null,
          product_url: node.onlineStoreUrl || null,
          image_url: node.featuredImage?.url || null,
          price: price !== null ? `${price.toFixed(2)}` : null,
          old_price: hasDiscount ? `${compareAt!.toFixed(2)}` : null,
          promo_badge: hasDiscount ? "sale" : null,
          shopify_variant_id: variantId,
        });
      }

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    }

    // Replace existing product cards
    await adminClient
      .from("product_cards")
      .delete()
      .eq("user_id", user.id);

    if (allProducts.length > 0) {
      const rows = allProducts.map((p, i) => ({
        user_id: user.id,
        title: p.title,
        subtitle: p.subtitle,
        product_url: p.product_url,
        image_url: p.image_url,
        price: p.price,
        old_price: p.old_price,
        promo_badge: p.promo_badge,
        shopify_variant_id: p.shopify_variant_id,
        sort_order: i,
      }));

      const { error: insertError } = await adminClient
        .from("product_cards")
        .insert(rows);

      if (insertError) throw insertError;
    }

    await adminClient
      .from("shopify_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        product_count: allProducts.length,
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ success: true, productCount: allProducts.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-shopify-products error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
