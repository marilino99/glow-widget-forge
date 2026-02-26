import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // Count monthly AI responses even for free users
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: aiCount } = await supabaseClient
        .from("chat_messages")
        .select("id, conversations!inner(widget_owner_id)", { count: "exact", head: true })
        .eq("is_ai_response", true)
        .eq("conversations.widget_owner_id", user.id)
        .gte("created_at", startOfMonth);

      return new Response(JSON.stringify({ subscribed: false, plan: "free", ai_responses_this_month: aiCount ?? 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let plan = "free";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      // Determine plan from product ID
      const productId = subscription.items.data[0]?.price?.product;
      if (productId === "prod_U36GQsirConMMK" || productId === "prod_U36Iuwp618AUVM") {
        plan = "starter";
      } else {
        plan = "pro";
      }
      try {
        const endTimestamp = subscription.current_period_end;
        if (endTimestamp) {
          const endDate = new Date(typeof endTimestamp === "number" ? endTimestamp * 1000 : endTimestamp);
          if (!isNaN(endDate.getTime())) {
            subscriptionEnd = endDate.toISOString();
          }
        }
      } catch {
        // Ignore date parsing errors
      }
    }

    // Count monthly AI responses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: aiCount } = await supabaseClient
      .from("chat_messages")
      .select("id, conversations!inner(widget_owner_id)", { count: "exact", head: true })
      .eq("is_ai_response", true)
      .eq("conversations.widget_owner_id", user.id)
      .gte("created_at", startOfMonth);

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan: plan,
      subscription_end: subscriptionEnd,
      ai_responses_this_month: aiCount ?? 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
