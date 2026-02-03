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
    const { eventType, instanceId } = payload;

    console.log("Received uninstall webhook:", eventType, instanceId);

    if (eventType !== "AppRemoved") {
      return new Response(
        JSON.stringify({ message: "Event ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete the installation record
    const { error: deleteError } = await supabase
      .from("wix_installations")
      .delete()
      .eq("wix_instance_id", instanceId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to remove installation" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Installation removed for instance:", instanceId);

    return new Response(
      JSON.stringify({ message: "Installation removed" }),
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
