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

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(expiredPage("Invalid link"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Find profile with this token that hasn't been claimed yet
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, lovable_promo_claimed")
    .eq("promo_token", token)
    .single();

  if (error || !profile) {
    return new Response(expiredPage("This link is invalid or has already been used."), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (profile.lovable_promo_claimed) {
    return new Response(expiredPage("This link has already been used."), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Mark as claimed
  await supabase
    .from("profiles")
    .update({ lovable_promo_claimed: true })
    .eq("id", profile.id);

  // Redirect to Lovable
  return new Response(null, {
    status: 302,
    headers: {
      Location: "https://lovable.dev",
      ...corsHeaders,
    },
  });
});

function expiredPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; color: #333; }
    .card { text-align: center; padding: 3rem 2rem; max-width: 400px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #666; font-size: 0.95rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link Expired</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
