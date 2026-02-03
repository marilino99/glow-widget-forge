import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = hmac.digest("base64");
  return signature === expectedSignature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const wixAppSecret = Deno.env.get("WIX_APP_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!wixAppSecret) {
      console.error("Missing WIX_APP_SECRET");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get("x-wix-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, wixAppSecret)) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { eventType, instanceId, data } = payload;

    console.log("Received webhook:", eventType, instanceId);

    if (eventType !== "AppInstalled") {
      // We only care about install events in this webhook
      return new Response(
        JSON.stringify({ message: "Event ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if installation already exists
    const { data: existing } = await supabase
      .from("wix_installations")
      .select("id")
      .eq("wix_instance_id", instanceId)
      .maybeSingle();

    if (existing) {
      console.log("Installation already exists for instance:", instanceId);
      return new Response(
        JSON.stringify({ message: "Installation already tracked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For webhook-initiated installs, we create a placeholder record
    // The user will need to link their widget via the dashboard
    const { error: insertError } = await supabase
      .from("wix_installations")
      .insert({
        wix_instance_id: instanceId,
        wix_site_id: data?.siteId || null,
        wix_refresh_token: "pending", // Will be updated when user completes OAuth
        script_injected: false,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to track installation" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Installation tracked" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
