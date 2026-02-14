import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

    const resend = new Resend(resendApiKey);

    const contentType = req.headers.get("content-type") || "";
    
    let widgetId: string | null = null;
    let details: string | null = null;
    let senderName = "Anonymous";
    let senderEmail: string | null = null;
    let isFeedback = false;
    let formData: FormData | null = null;

    if (contentType.includes("application/json")) {
      const json = await req.json();
      // Feedback mode: simple JSON with message
      if (json.type === "feedback") {
        isFeedback = true;
        details = json.message;
        senderName = "Builder User";
        senderEmail = "feedback@widjet.io";
      } else {
        widgetId = json.widget_id;
        details = json.details;
        senderName = json.sender_name || "Anonymous";
        senderEmail = json.sender_email;
      }
    } else {
      formData = await req.formData();
      widgetId = formData.get("widget_id") as string;
      details = formData.get("details") as string;
      senderName = (formData.get("sender_name") as string) || "Anonymous";
      senderEmail = formData.get("sender_email") as string;
    }

    if (!details) {
      return new Response(
        JSON.stringify({ error: "Missing required field: details/message" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!isFeedback && (!widgetId || !senderEmail)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: widget_id, details, sender_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recipientEmail: string;
    let attachmentHtml: string[] = [];

    if (isFeedback) {
      // Send feedback directly to support
      recipientEmail = "support@widjet.io";
    } else {
      // Get the forward email from widget configuration
      const { data: config, error: configError } = await supabase
        .from("widget_configurations")
        .select("forward_email, contact_name")
        .eq("id", widgetId!)
        .single();

      if (configError || !config?.forward_email) {
        console.error("Config error:", configError);
        return new Response(
          JSON.stringify({ error: "Widget configuration not found or forward email not set" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      recipientEmail = config.forward_email;

      // Upload attachments from formData
      if (formData) {
        for (let i = 0; i < 3; i++) {
          const file = formData.get(`file_${i}`) as File | null;
          if (!file) continue;

          const fileName = `${widgetId}/${Date.now()}_${file.name}`;
          const arrayBuffer = await file.arrayBuffer();
          const { error: uploadError } = await supabase.storage
            .from("bug-attachments")
            .upload(fileName, arrayBuffer, {
              contentType: file.type,
              upsert: false,
            });

          if (!uploadError) {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from("bug-attachments")
              .createSignedUrl(fileName, 60 * 60 * 24 * 7);
            const url = signedUrlData?.signedUrl || "";
            if (!signedUrlError && url) {
              attachmentHtml.push(
                `<li><a href="${url}" style="color: #2563eb;">${file.name}</a></li>`
              );
            }
          } else {
            console.error("Upload error:", uploadError);
          }
        }
      }
    }

    const subject = isFeedback ? `💡 Feedback from Builder` : `🐛 Bug Report from ${senderName}`;
    const heading = isFeedback ? "Product Feedback" : "Bug Report";

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Bug Report <onboarding@resend.dev>",
      to: [recipientEmail],
      replyTo: senderEmail || undefined,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">${heading}</h2>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">From</p>
            <p style="margin: 0; font-weight: 600;">${senderName}${senderEmail ? ` &lt;${senderEmail}&gt;` : ""}</p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">${isFeedback ? "Message" : "Problem Description"}</p>
            <p style="margin: 0; white-space: pre-wrap;">${details}</p>
          </div>

          ${attachmentHtml.length > 0 ? `
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">Attachments (${attachmentHtml.length})</p>
            <ul style="margin: 0; padding-left: 16px;">${attachmentHtml.join("")}</ul>
          </div>
          ` : ""}

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            Sent via Widjet ${isFeedback ? "feedback" : "bug report"} form
          </p>
        </div>
      `,
    });

    console.log("Bug report email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-bug-report:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
