import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/javascript",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Seamless widget loader - no DOM elements until ready
    const widgetScript = `
;(function(w,d,u){
  'use strict';
  
  var c = w.__wj || {};
  var id = c.widgetId;
  
  if (!id) {
    console.error('[Widjet] No widget ID');
    return;
  }

  // Prevent duplicate initialization
  if (w.__wj_loaded) return;
  w.__wj_loaded = true;

  // Load config and render
  var x = new XMLHttpRequest();
  x.open('GET', u + '/functions/v1/widget-config?id=' + id, true);
  x.onreadystatechange = function() {
    if (x.readyState !== 4) return;
    if (x.status !== 200) {
      console.error('[Widjet] Load failed');
      return;
    }
    try {
      var cfg = JSON.parse(x.responseText);
      if (cfg.error) {
        console.error('[Widjet]', cfg.error);
        return;
      }
      render(cfg);
    } catch(e) {
      console.error('[Widjet] Parse error');
    }
  };
  x.send();

  function render(cfg) {
    var colors = {
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#a855f7',
      red: '#ef4444',
      orange: '#f97316',
      pink: '#ec4899'
    };
    var bg = colors[cfg.widget_color] || colors.blue;
    var dark = cfg.widget_theme === 'dark';
    var name = cfg.contact_name || 'Support';
    var help = cfg.offer_help || 'Write to us';
    var hello = cfg.say_hello || 'Hello! 👋';

    // Create styles
    var style = d.createElement('style');
    style.textContent = \`
      #wj-root{position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${bg}}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn svg{width:24px;height:24px}
      #wj-pop{display:none;position:absolute;bottom:70px;right:0;width:320px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;animation:wj-in .2s ease}
      #wj-pop.open{display:block}
      @keyframes wj-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      #wj-head{padding:20px;color:#fff;background:\${bg}}
      #wj-name{font-weight:600;font-size:16px}
      #wj-hello{font-size:14px;opacity:.9;margin-top:4px}
      #wj-body{padding:20px;font-size:14px}
    \`;
    d.head.appendChild(style);

    // Create container
    var root = d.createElement('div');
    root.id = 'wj-root';

    // Create popup
    var pop = d.createElement('div');
    pop.id = 'wj-pop';
    pop.style.background = dark ? '#1f2937' : '#fff';
    pop.innerHTML = '<div id="wj-head"><div id="wj-name">' + esc(name) + '</div><div id="wj-hello">' + esc(hello) + '</div></div><div id="wj-body" style="color:' + (dark ? '#e5e7eb' : '#374151') + '">' + esc(help) + '</div>';

    // Create button
    var btn = d.createElement('button');
    btn.id = 'wj-btn';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    btn.onclick = function() {
      pop.classList.toggle('open');
    };

    root.appendChild(pop);
    root.appendChild(btn);
    d.body.appendChild(root);
  }

  function esc(s) {
    var el = d.createElement('div');
    el.textContent = s;
    return el.innerHTML;
  }
})(window,document,'${supabaseUrl}');
`;

    return new Response(widgetScript, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Widget loader error:", error);
    return new Response(`console.error('[Widjet] Init failed');`, {
      headers: corsHeaders,
    });
  }
});
