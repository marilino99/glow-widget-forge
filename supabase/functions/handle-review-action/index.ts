import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action"); // "approve" or "decline"
  const userId = url.searchParams.get("user_id");
  const userEmail = url.searchParams.get("email");

  if (!action || !userId) {
    return new Response("<h1>Invalid request</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (action === "approve") {
    // Set g2_review_approved = true
    const { error } = await supabase
      .from("profiles")
      .update({ g2_review_approved: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Approve error:", error);
      return new Response("<h1>Error approving review</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Send approval email to user
    if (RESEND_API_KEY && userEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Widjet <noreply@getwidjet.com>",
          to: [userEmail],
          subject: "🎉 Your G2 review has been approved!",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; text-align: center;">
              <h2 style="margin: 0 0 1rem; color: #16a34a;">Your review has been approved!</h2>
              <p style="color: #555; line-height: 1.6;">Thank you for leaving a G2 review! Your promo code is now ready.</p>
              <p style="color: #555; line-height: 1.6;">Log in to your Widjet account and go to the promotion section to claim your reward.</p>
              <a href="https://widjett.lovable.app/builder" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Widjet</a>
            </div>
          `,
        }),
      });
    }

    return new Response(`
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0fdf4;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="color: #16a34a; font-size: 2rem;">✅ Review Approved</h1>
            <p style="color: #555; font-size: 1.1rem;">The user has been notified and can now claim their promo code.</p>
          </div>
        </body>
      </html>
    `, { status: 200, headers: { "Content-Type": "text/html" } });
  }

  if (action === "decline") {
    // Send decline email to user
    if (RESEND_API_KEY && userEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Widjet <noreply@getwidjet.com>",
          to: [userEmail],
          subject: "Update on your G2 review submission",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; text-align: center;">
              <h2 style="margin: 0 0 1rem; color: #dc2626;">Review not approved</h2>
              <p style="color: #555; line-height: 1.6;">Unfortunately, we were unable to verify your G2 review. This could be because the review link is invalid or doesn't match our records.</p>
              <p style="color: #555; line-height: 1.6;">If you think this is a mistake, please submit a valid G2 review link and try again.</p>
              <a href="https://widjett.lovable.app/builder" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Widjet</a>
            </div>
          `,
        }),
      });
    }

    // Reset promo state so user can retry
    await supabase
      .from("profiles")
      .update({ g2_review_approved: false, lovable_promo_claimed: false, promo_token: null })
      .eq("user_id", userId);

    return new Response(`
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fef2f2;">
          <div style="text-align: center; padding: 2rem;">
            <h1 style="color: #dc2626; font-size: 2rem;">❌ Review Declined</h1>
            <p style="color: #555; font-size: 1.1rem;">The user has been notified that their review was not approved.</p>
          </div>
        </body>
      </html>
    `, { status: 200, headers: { "Content-Type": "text/html" } });
  }

  return new Response("<h1>Unknown action</h1>", {
    status: 400,
    headers: { "Content-Type": "text/html" },
  });
});
