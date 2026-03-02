import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback, userEmail } = await req.json();

    if (!feedback || feedback.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Feedback is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Widjet Feedback <noreply@getwidjet.com>",
        to: ["support@getwidjet.com"],
        subject: `New Feedback from ${userEmail || "Unknown user"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #111; margin-bottom: 16px;">New Feedback Received</h2>
            <p style="color: #555; font-size: 14px; margin-bottom: 8px;"><strong>From:</strong> ${userEmail || "Unknown"}</p>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-top: 12px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${feedback}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">Sent from Widjet Builder feedback form</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Resend API error [${res.status}]: ${errorData}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending feedback:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
