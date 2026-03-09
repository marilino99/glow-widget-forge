import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_PRODUCTS_QUERY = `
  query ($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          onlineStoreUrl
          featuredImage {
            url
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            maxVariantPrice {
              amount
              currencyCode
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

    // Verify user with their JWT
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

    // Use service role to read the storefront token
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: connection, error: connError } = await adminClient
      .from("shopify_connections")
      .select("store_domain, storefront_token")
      .eq("user_id", user.id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "No Shopify connection found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { store_domain, storefront_token } = connection;

    // Fetch products from Shopify Storefront API
    const allProducts: any[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage && allProducts.length < 50) {
      const res = await fetch(
        `https://${store_domain}/api/2024-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": storefront_token,
          },
          body: JSON.stringify({
            query: SHOPIFY_PRODUCTS_QUERY,
            variables: { first: 50, after },
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shopify API error [${res.status}]: ${text}`);
      }

      const json = await res.json();
      if (json.errors) {
        throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
      }

      const { edges, pageInfo } = json.data.products;
      for (const { node } of edges) {
        const price = node.priceRange?.minVariantPrice;
        const compareAt = node.compareAtPriceRange?.maxVariantPrice;
        const hasDiscount =
          compareAt &&
          parseFloat(compareAt.amount) > 0 &&
          parseFloat(compareAt.amount) > parseFloat(price?.amount || "0");

        allProducts.push({
          title: node.title,
          subtitle: node.description?.substring(0, 120) || null,
          product_url: node.onlineStoreUrl || null,
          image_url: node.featuredImage?.url || null,
          price: price ? `${parseFloat(price.amount).toFixed(2)} ${price.currencyCode}` : null,
          old_price: hasDiscount
            ? `${parseFloat(compareAt.amount).toFixed(2)} ${compareAt.currencyCode}`
            : null,
          promo_badge: hasDiscount ? "sale" : null,
        });
      }

      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    }

    // Delete existing product cards for this user (synced ones will be replaced)
    await adminClient
      .from("product_cards")
      .delete()
      .eq("user_id", user.id);

    // Insert new products
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
        sort_order: i,
      }));

      const { error: insertError } = await adminClient
        .from("product_cards")
        .insert(rows);

      if (insertError) throw insertError;
    }

    // Update last_synced_at and product_count
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
