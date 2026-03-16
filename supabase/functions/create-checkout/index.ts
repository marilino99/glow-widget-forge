import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@18.5.0";
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Get return URL from request body, fallback to origin header
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || req.headers.get("origin") || "";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const plan = body.plan || "pro";
    const billingInterval = body.billingInterval || "month";
    const currency = body.currency || "EUR";
    
    const priceIds: Record<string, Record<string, Record<string, string>>> = {
      starter: {
        USD: { month: "price_1T504R9qkctgdXPW3MdCa3Mp", year: "price_1T505i9qkctgdXPWv7rzxoGL" },
        EUR: { month: "price_1TBctU9qkctgdXPWjLQIcBQt", year: "price_1TBctq9qkctgdXPWzB2mjSTM" },
      },
      pro: {
        USD: { month: "price_1T1N439qkctgdXPWs0PudObs", year: "price_1T1N439qkctgdXPWJUIiKmGi" },
        EUR: { month: "price_1T1N439qkctgdXPWs0PudObs", year: "price_1T1N439qkctgdXPWJUIiKmGi" },
      },
      business: {
        USD: { month: "price_1TBcqR9qkctgdXPWpr4OBKAV", year: "price_1TBcqk9qkctgdXPWWi8tCwHj" },
        EUR: { month: "price_1TBcuB9qkctgdXPWNFQ6BKLA", year: "price_1TBcuX9qkctgdXPWzVtIkpc8" },
      },
    };

    const priceId = priceIds[plan]?.[currency]?.[billingInterval] || priceIds[plan]?.USD?.[billingInterval] || priceIds.pro.USD.month;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${returnUrl}/checkout-success`,
      cancel_url: `${returnUrl}/builder`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
