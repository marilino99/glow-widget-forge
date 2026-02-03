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
    // Get widget ID from the global variable set by the embed code
    // The embed code sets window.__wj.widgetId before loading this script
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Return the widget initialization script
    const widgetScript = `
(function() {
  'use strict';
  
  var config = window.__wj || {};
  var widgetId = config.widgetId;
  
  if (!widgetId) {
    console.error('[Widjet] No widget ID provided');
    return;
  }

  // Create widget container - hidden until widget loads
  var container = document.createElement('div');
  container.id = 'widjet-container';
  container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;display:none;';
  document.body.appendChild(container);

  // Fetch widget configuration
  fetch('${supabaseUrl}/functions/v1/widget-config?id=' + widgetId)
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.error) {
        console.error('[Widjet] Error loading configuration:', data.error);
        container.remove();
        return;
      }
      renderWidget(data);
      container.style.display = 'block';
    })
    .catch(function(error) {
      console.error('[Widjet] Failed to load widget:', error);
      container.remove();
    });

  function renderWidget(config) {
    var primaryColor = config.widget_color || 'blue';
    var theme = config.widget_theme || 'dark';
    var contactName = config.contact_name || 'Support';
    var offerHelp = config.offer_help || 'Write to us';
    var sayHello = config.say_hello || 'Hello! 👋';
    
    // Color mapping
    var colors = {
      blue: '#3b82f6',
      green: '#22c55e',
      purple: '#a855f7',
      red: '#ef4444',
      orange: '#f97316',
      pink: '#ec4899'
    };
    var bgColor = colors[primaryColor] || colors.blue;
    
    // Create button
    var button = document.createElement('button');
    button.id = 'widjet-button';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    button.style.cssText = 'width:56px;height:56px;border-radius:50%;background:' + bgColor + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.2s;';
    button.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
    button.onmouseout = function() { this.style.transform = 'scale(1)'; };
    
    // Create popup
    var popup = document.createElement('div');
    popup.id = 'widjet-popup';
    popup.style.cssText = 'display:none;position:absolute;bottom:70px;right:0;width:320px;background:' + (theme === 'dark' ? '#1f2937' : 'white') + ';border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.2);overflow:hidden;';
    
    var header = document.createElement('div');
    header.style.cssText = 'background:' + bgColor + ';padding:20px;color:white;';
    header.innerHTML = '<div style="font-weight:600;font-size:16px;">' + contactName + '</div><div style="font-size:14px;opacity:0.9;margin-top:4px;">' + sayHello + '</div>';
    
    var content = document.createElement('div');
    content.style.cssText = 'padding:20px;color:' + (theme === 'dark' ? '#e5e7eb' : '#374151') + ';';
    content.innerHTML = '<div style="font-size:14px;">' + offerHelp + '</div>';
    
    popup.appendChild(header);
    popup.appendChild(content);
    
    var isOpen = false;
    button.onclick = function() {
      isOpen = !isOpen;
      popup.style.display = isOpen ? 'block' : 'none';
    };
    
    container.appendChild(popup);
    container.appendChild(button);
  }
})();
`;

    return new Response(widgetScript, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Widget loader error:", error);
    return new Response(`console.error('[Widjet] Failed to initialize widget');`, {
      headers: corsHeaders,
    });
  }
});
