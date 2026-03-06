import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub;

  const { reviewUrl, userEmail } = await req.json();

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const approveUrl = `${SUPABASE_URL}/functions/v1/handle-review-action?action=approve&user_id=${userId}&email=${encodeURIComponent(userEmail || "")}`;
  const declineUrl = `${SUPABASE_URL}/functions/v1/handle-review-action?action=decline&user_id=${userId}&email=${encodeURIComponent(userEmail || "")}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Widjet <noreply@getwidjet.com>",
      to: ["support@getwidjet.com"],
      subject: "🔔 New G2 review submitted",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h2 style="margin: 0 0 1rem;">New G2 Review Submitted</h2>
          <p style="color: #555; line-height: 1.6;">A user has submitted a G2 review and is waiting for your approval.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <tr><td style="padding: 0.5rem 0; color: #888; font-size: 0.875rem;">User ID</td><td style="padding: 0.5rem 0; font-size: 0.875rem;">${userId}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #888; font-size: 0.875rem;">Email</td><td style="padding: 0.5rem 0; font-size: 0.875rem;">${userEmail || "N/A"}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #888; font-size: 0.875rem;">Review URL</td><td style="padding: 0.5rem 0; font-size: 0.875rem;"><a href="${reviewUrl}" style="color: #2563eb;">${reviewUrl}</a></td></tr>
          </table>
          <div style="margin-top: 1.5rem; text-align: center;">
            <a href="${approveUrl}" style="display: inline-block; padding: 0.75rem 2rem; background: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 0.75rem;">✅ Approve</a>
            <a href="${declineUrl}" style="display: inline-block; padding: 0.75rem 2rem; background: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">❌ Decline</a>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
