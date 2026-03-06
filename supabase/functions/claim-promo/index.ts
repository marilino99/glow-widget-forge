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

  // Serve interstitial page that redirects via JS (hides URL from address bar)
  const targetUrl = "https://lovable.dev/lp/learnn-2512?reward_code=03aa3b40-4c2b-4f78-8cc5-7d7cb0588f97";
  const encoded = btoa(targetUrl);

  return new Response(redirectPage(encoded), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store, no-cache",
    },
  });
});

function redirectPage(encodedUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>Claim your credits</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }
    .card { text-align: center; padding: 3rem 2.5rem; max-width: 420px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: rgba(255,255,255,0.85); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .spinner { width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fallback { display: none; margin-top: 1rem; }
    .fallback a { color: #fff; text-decoration: underline; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>Your credits are ready!</h1>
    <p>We're redirecting you to Lovable to claim your reward. Please wait a moment...</p>
    <div class="spinner"></div>
    <div class="fallback" id="fallback">
      <a id="fallback-link" href="#">Click here if you're not redirected</a>
    </div>
  </div>
  <script>
    (function(){
      try {
        var d = atob("${encodedUrl}");
        setTimeout(function(){ window.location.replace(d); }, 1500);
        setTimeout(function(){
          var f = document.getElementById("fallback");
          var l = document.getElementById("fallback-link");
          if (f && l) { l.href = d; f.style.display = "block"; }
        }, 4000);
      } catch(e) {}
    })();
  </script>
</body>
</html>`;
}

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
