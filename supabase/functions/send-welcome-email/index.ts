import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "Widjet <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Widjet! 🎉",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 40px 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Widjet!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">We're excited to have you on board 🚀</p>
          </div>
          
          <div style="padding: 32px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              Hey there! Thanks for signing up. Widjet helps you create beautiful product recommendation widgets for your website — no coding required.
            </p>
            
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Here's how to get started:
            </p>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; color: #1e293b; font-weight: 600;">1. Complete your onboarding</p>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">Tell us about your business so we can customize your widget.</p>
              
              <p style="margin: 0 0 12px; color: #1e293b; font-weight: 600;">2. Customize your widget</p>
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">Pick colors, add products, and make it match your brand.</p>
              
              <p style="margin: 0 0 12px; color: #1e293b; font-weight: 600;">3. Add it to your website</p>
              <p style="margin: 0; color: #64748b; font-size: 14px;">Copy one line of code and you're live!</p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://widjett.lovable.app/login" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              Need help? Just reply to this email. We're here for you!
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending welcome email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
