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

    // Complete widget loader with all builder elements including chat
    const widgetScript = `
;(function(w,d,u){
  'use strict';
  
  var c = w.__wj || {};
  var id = c.widgetId;
  
  if (!id) {
    console.error('[Widjet] No widget ID');
    return;
  }

  if (w.__wj_loaded) return;
  w.__wj_loaded = true;

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
      gray: { bg: '#6b7280', hover: '#4b5563' },
      purple: { bg: '#a855f7', hover: '#9333ea' },
      blue: { bg: '#3b82f6', hover: '#2563eb' },
      cyan: { bg: '#06b6d4', hover: '#0891b2' },
      green: { bg: '#22c55e', hover: '#16a34a' },
      yellow: { bg: '#eab308', hover: '#ca8a04' },
      orange: { bg: '#f97316', hover: '#ea580c' },
      red: { bg: '#ef4444', hover: '#dc2626' },
      pink: { bg: '#ec4899', hover: '#db2777' }
    };
    
    // Support both preset names and custom hex colors
    var wc = cfg.widget_color || 'blue';
    var color;
    if (wc.startsWith('#')) {
      // Custom hex color - darken it for hover
      var hex = wc.replace('#', '');
      var r = parseInt(hex.substr(0,2), 16);
      var g = parseInt(hex.substr(2,2), 16);
      var b = parseInt(hex.substr(4,2), 16);
      // Darken by 15%
      r = Math.max(0, Math.floor(r * 0.85));
      g = Math.max(0, Math.floor(g * 0.85));
      b = Math.max(0, Math.floor(b * 0.85));
      var hover = '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
      color = { bg: wc, hover: hover };
    } else {
      color = colors[wc] || colors.blue;
    }
    var dark = cfg.widget_theme === 'dark';
    var widgetType = cfg.widget_type || 'popup';
    var solid = cfg.background_type === 'solid';
    var gradient = cfg.background_type === 'gradient';
    var bgImage = cfg.background_image || '';
    var name = cfg.contact_name || 'Support';
    var help = cfg.offer_help || 'Write to us';
    var hello = cfg.say_hello || 'Hello! 👋';
    var avatar = cfg.selected_avatar;
    var buttonLogo = cfg.button_logo;
    var products = cfg.product_cards || [];
    var faqs = cfg.faq_items || [];
    var igPosts = cfg.instagram_posts || [];
    var customLinks = cfg.custom_links || [];
    var customCss = cfg.custom_css || '';
    var customJs = cfg.custom_js || '';
    var faqEnabled = cfg.faq_enabled;
    var igEnabled = cfg.instagram_enabled;
    var lang = cfg.language || 'en';
    var whatsappEnabled = cfg.whatsapp_enabled || false;
    var whatsappCountryCode = (cfg.whatsapp_country_code || '+39').replace('+', '');
    var whatsappNumber = cfg.whatsapp_number || '';
    var showBranding = cfg.show_branding !== false;
    var avatarInitial = name ? name.charAt(0).toUpperCase() : 'S';
    var grEnabled = cfg.google_reviews_enabled || false;
    var grName = cfg.google_business_name || '';
    var grRating = cfg.google_business_rating || 0;
    var grTotal = cfg.google_business_ratings_total || 0;
    var grUrl = cfg.google_business_url || '';

    var t = {
      en: { contactUs: 'Contact us', show: 'Show', quickAnswers: 'Quick answers', home: 'Home', contact: 'Contact', followIg: 'Follow us on Instagram', welcomeMessage: 'Welcome! How can I help you?', writeMessage: 'Write a message...', contactWhatsApp: 'Contact us on WhatsApp' },
      es: { contactUs: 'Contáctanos', show: 'Ver', quickAnswers: 'Respuestas rápidas', home: 'Inicio', contact: 'Contacto', followIg: 'Síguenos en Instagram', welcomeMessage: '¡Bienvenido/a! ¿Cómo puedo ayudarte?', writeMessage: 'Escribe un mensaje...', contactWhatsApp: 'Contáctanos por WhatsApp' },
      de: { contactUs: 'Kontakt', show: 'Zeigen', quickAnswers: 'Schnelle Antworten', home: 'Home', contact: 'Kontakt', followIg: 'Folge uns auf Instagram', welcomeMessage: 'Willkommen! Wie kann ich Ihnen helfen?', writeMessage: 'Nachricht schreiben...', contactWhatsApp: 'Kontaktieren Sie uns über WhatsApp' },
      fr: { contactUs: 'Contactez-nous', show: 'Voir', quickAnswers: 'Réponses rapides', home: 'Accueil', contact: 'Contact', followIg: 'Suivez-nous sur Instagram', welcomeMessage: 'Bienvenue ! Comment puis-je vous aider ?', writeMessage: 'Écrivez un message...', contactWhatsApp: 'Contactez-nous sur WhatsApp' },
      it: { contactUs: 'Contattaci', show: 'Mostra', quickAnswers: 'Risposte rapide', home: 'Home', contact: 'Contatto', followIg: 'Seguici su Instagram', welcomeMessage: 'Benvenuto/a! In che modo posso esserti utile?', writeMessage: 'Scrivi un messaggio...', contactWhatsApp: 'Contattaci su WhatsApp' },
      pt: { contactUs: 'Contacte-nos', show: 'Ver', quickAnswers: 'Respostas rápidas', home: 'Início', contact: 'Contacto', followIg: 'Siga-nos no Instagram', welcomeMessage: 'Bem-vindo/a! Como posso ajudar?', writeMessage: 'Escreva uma mensagem...', contactWhatsApp: 'Contacte-nos no WhatsApp' },
      pl: { contactUs: 'Kontakt', show: 'Pokaż', quickAnswers: 'Szybkie odpowiedzi', home: 'Strona główna', contact: 'Kontakt', followIg: 'Obserwuj nas na Instagramie', welcomeMessage: 'Witamy! Jak mogę pomóc?', writeMessage: 'Napisz wiadomość...', contactWhatsApp: 'Skontaktuj się z nami przez WhatsApp' }
    };
    var tr = t[lang] || t.en;

    var bgMain = dark ? '#000' : '#f8f8f8';
    var bgCard = dark ? 'rgba(51,65,85,0.5)' : '#fff';
    var bgFaq = dark ? '#252525' : '#fff';
    var textMain = dark ? '#fff' : '#0f172a';
    var textSub = dark ? 'rgba(255,255,255,0.6)' : '#64748b';
    var borderCol = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    // Detect if running inside an iframe (Wix Embed element)
    // Exclude Lovable preview iframes and the project's own domain from iframe mode
    var inIframe = false;
    try {
      if (w.self !== w.top) {
        var isLovable = w.location.hostname.indexOf('lovable') !== -1 || w.location.hostname.indexOf('lovableproject') !== -1;
        var isOwnDomain = w.location.hostname.indexOf('widjett') !== -1;
        inIframe = !isLovable && !isOwnDomain;
      }
    } catch(e) { inIframe = true; }

    var style = d.createElement('style');
    style.textContent = inIframe ? \`
      #wj-root{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:none}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${color.bg};overflow:hidden;position:absolute;bottom:20px;right:20px;pointer-events:auto}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn.hidden{display:none}
      #wj-btn.pop{animation:wj-btn-pop .4s cubic-bezier(0.34,1.56,0.64,1)}
      #wj-btn svg{width:24px;height:24px}
      #wj-btn img{width:100%;height:100%;object-fit:cover}
      #wj-pop{display:none;width:calc(100% - 24px);max-width:350px;height:calc(100% - 24px);max-height:560px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;background:\${bgMain};z-index:2147483647;pointer-events:auto;transform:translateZ(0)}
      #wj-pop.open{display:flex;flex-direction:column;animation:wj-expand .35s cubic-bezier(0,0,0.2,1)}
      #wj-pop.closing{display:flex;flex-direction:column;animation:wj-collapse .3s cubic-bezier(0.4,0,0.2,1) forwards}
      @keyframes wj-expand{from{opacity:0;transform:scale(0.85) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
      @keyframes wj-collapse{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(0.85) translateY(16px)}}
      @keyframes wj-btn-pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1);opacity:1}100%{transform:scale(1)}}
      #wj-scroll{flex:1;overflow-y:auto;position:relative;border-radius:inherit;background:\${bgMain}}
      #wj-gradient-overlay{display:none}
      \${gradient ? '#wj-gradient-overlay{display:block;position:absolute;top:0;left:0;right:0;height:256px;pointer-events:none;z-index:0;background:linear-gradient(180deg, '+(dark ? color.bg+'88' : color.bg+'30')+' 0%, '+(dark ? color.bg+'44' : color.bg+'15')+' 45%, transparent 100%)}' : ''}
      #wj-head{padding:20px 24px \${solid ? '16px' : '20px'} 24px;position:relative;z-index:1;\${solid ? 'background:'+color.bg+';color:#fff' : ''}\${bgImage ? 'background-image:linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('+bgImage+');background-size:cover;background-position:center;color:#fff' : ''}}
      #wj-hello{font-size:22px;font-weight:700;max-width:70%;word-break:break-word;white-space:pre-line;color:\${(solid || bgImage) ? '#fff' : textMain}}
      #wj-close{position:absolute;right:16px;top:16px;background:none;border:none;cursor:pointer;opacity:0.7;padding:4px}
      #wj-close:hover{opacity:1}
      #wj-close svg{width:16px;height:16px;stroke:\${(solid || bgImage) ? '#fff' : textSub}}
      #wj-contact{margin:\${solid ? '16px 0 0 0' : '0 16px'};padding:16px;border-radius:12px;position:relative;z-index:1;background:\${solid ? 'rgba(30,41,59,0.9)' : bgCard}}
      #wj-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0}
      #wj-cname{font-size:12px;color:\${solid ? 'rgba(255,255,255,0.6)' : textSub}}
      #wj-chelp{font-size:14px;color:\${solid ? '#fff' : textMain}}
      #wj-cbtn{width:100%;margin-top:12px;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer}
      #wj-cbtn:hover{background:\${color.hover}}
      #wj-whatsapp{width:100%;margin-top:8px;padding:10px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'};border-radius:8px;background:transparent;color:\${solid ? '#fff' : textMain};font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
      #wj-whatsapp:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      #wj-whatsapp svg{width:20px;height:20px}
      #wj-products{padding:16px;display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;margin-top:8px}
      #wj-products::-webkit-scrollbar{display:none}
      .wj-prod{flex-shrink:0;width:calc(100% - 48px);border-radius:16px;overflow:hidden;background:\${dark ? '#1e293b' : '#fff'}}
      .wj-prod-img{aspect-ratio:4/3;background:\${dark ? '#cbd5e1' : '#e2e8f0'};display:flex;align-items:center;justify-content:center}
      .wj-prod-img img{width:100%;height:100%;object-fit:cover}
      .wj-prod-info{padding:16px}
      .wj-prod-price{font-size:16px;color:\${textMain}}
      .wj-prod-old{font-size:14px;color:\${textSub};text-decoration:line-through;margin-left:8px}
      .wj-prod-title{font-weight:700;font-size:16px;color:\${textMain}}
      .wj-prod-sub{font-size:14px;color:\${textSub};margin-top:2px;margin-bottom:12px}
      .wj-prod-btn{width:100%;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;display:block;text-align:center;box-sizing:border-box}
      .wj-prod-btn:hover{background:\${color.hover}}
      #wj-ig{padding:0 16px 16px;margin-top:8px}
      #wj-ig-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
      #wj-ig-head svg{width:16px;height:16px;color:#ec4899}
      #wj-ig-head span{font-size:14px;font-weight:500;color:\${textMain}}
      #wj-ig-list{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
      #wj-ig-list::-webkit-scrollbar{display:none}
      .wj-ig-item{width:80px;height:80px;flex-shrink:0;border-radius:8px;overflow:hidden;background:\${dark ? '#374151' : '#e2e8f0'}}
      .wj-ig-item img{width:100%;height:100%;object-fit:cover}
      #wj-faq{padding:0 16px 16px;margin-top:16px}
      #wj-faq-box{border-radius:16px;padding:16px;background:\${bgFaq}}
      #wj-faq-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
      #wj-faq-head svg{width:16px;height:16px;color:\${textSub}}
      #wj-faq-head span{font-size:14px;font-weight:500;color:\${textMain}}
      .wj-faq-item{border-radius:8px}
      .wj-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;font-size:14px;font-weight:500;color:\${textMain}}
      .wj-faq-q:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      .wj-faq-q svg{width:16px;height:16px;color:\${textSub};transition:transform .2s}
      .wj-faq-q.open svg{transform:rotate(180deg)}
      .wj-faq-a{padding:4px 12px 12px;font-size:14px;color:\${textSub};display:none}
      .wj-faq-a.open{display:block}
      #wj-links{padding:0 16px 16px;margin-top:8px}
      #wj-greview{padding:0 16px 16px}
      #wj-greview-box{border-radius:16px;padding:16px;background:\${bgFaq};cursor:pointer;transition:background .15s}
      #wj-greview-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-greview-stars{display:flex;align-items:center;gap:2px}
      .wj-star{width:20px;height:20px;position:relative}
      .wj-star svg{position:absolute;inset:0;width:20px;height:20px}
      .wj-star-empty{color:\${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}}
      .wj-star-fill{color:\${dark ? '#fff' : '#0f172a'}}
      .wj-star-clip{position:absolute;inset:0;overflow:hidden}
      .wj-link-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:8px;border-radius:12px;background:\${dark ? '#1e293b' : '#fff'};text-decoration:none;transition:background .15s}
      .wj-link-item:hover{background:\${dark ? '#334155' : '#f1f5f9'}}
      .wj-link-item:last-child{margin-bottom:0}
      .wj-link-name{font-size:14px;font-weight:500;color:\${textMain}}
      .wj-link-arrow{width:28px;height:28px;border-radius:50%;background:\${dark ? '#374151' : '#e2e8f0'};display:flex;align-items:center;justify-content:center}
      .wj-link-arrow svg{width:14px;height:14px;color:\${textSub}}
      #wj-footer{padding:12px 16px 4px;background:\${bgMain}}
      #wj-nav{display:flex;border-radius:16px;background:\${dark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.7)'};backdrop-filter:blur(8px)}
      .wj-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border:none;background:transparent;cursor:pointer;color:\${textMain};font-size:12px}
      .wj-nav-item.inactive{color:\${textSub}}
      .wj-nav-item svg{width:20px;height:20px}
      #wj-powered{padding:8px;text-align:center;font-size:11px;color:\${textSub};background:\${bgMain}}
      #wj-home-view{display:flex;flex-direction:column;flex:1;min-height:0}
      #wj-chat-view{display:none;flex-direction:column;flex:1;min-height:0;background:\${dark ? '#000' : '#fff'}}
      #wj-chat-view.open{display:flex}
      #wj-home-view.hidden{display:none}
      #wj-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
      #wj-chat-back,#wj-chat-more,#wj-chat-close{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:\${dark ? '#1a1a1a' : '#e2e8f0'};color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-back:hover,#wj-chat-more:hover,#wj-chat-close:hover{background:\${dark ? '#333' : '#cbd5e1'}}
      #wj-chat-back svg,#wj-chat-more svg,#wj-chat-close svg{width:16px;height:16px}
      #wj-chat-title{display:flex;align-items:center;gap:10px}
      #wj-chat-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#a855f7);display:flex;align-items:center;justify-content:center;flex-shrink:0}
      #wj-chat-avatar svg{width:16px;height:16px;color:#fff}
      #wj-chat-title-text{display:flex;flex-direction:column}
      #wj-chat-name{font-size:14px;font-weight:600;line-height:1.2;color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-subtitle{font-size:12px;line-height:1.2;color:\${dark ? 'rgba(255,255,255,0.5)' : '#64748b'}}
      #wj-chat-header-right{display:flex;align-items:center;gap:8px}
      #wj-chat-msgs{flex:1;overflow-y:auto;padding:16px}
      #wj-chat-bubble{display:flex;align-items:flex-start;gap:8px}
      #wj-chat-bubble-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#a855f7);display:flex;align-items:center;justify-content:center;flex-shrink:0}
      #wj-chat-bubble-avatar svg{width:12px;height:12px;color:#fff}
      #wj-chat-bubble-text{padding:12px 16px;border-radius:16px;background:linear-gradient(135deg,#8b5cf6,#a855f7);color:#fff;font-size:14px}
      #wj-chat-input{position:relative;padding:16px}
      #wj-chat-input-box{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:24px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};background:\${dark ? '#111' : '#fff'}}
      #wj-chat-input-box input{flex:1;border:none;background:transparent;font-size:14px;color:\${dark ? '#fff' : '#0f172a'};outline:none}
      #wj-chat-input-box input::placeholder{color:\${dark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}}
      #wj-chat-emoji,#wj-chat-mic,#wj-chat-send{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-mic.listening{background:\${color.bg};color:#fff;animation:wj-pulse 1.5s ease-in-out infinite}
      @keyframes wj-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff}
      #wj-chat-emoji svg,#wj-chat-mic svg,#wj-chat-send svg{width:20px;height:20px}
      #wj-emoji-picker{display:none;position:absolute;bottom:100%;left:16px;right:16px;margin-bottom:8px;padding:12px;border-radius:12px;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      #wj-emoji-picker.open{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
      .wj-emoji{border:none;background:transparent;font-size:16px;cursor:pointer;padding:4px;border-radius:4px;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{padding:8px;text-align:center;font-size:11px;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};border-top:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
    \` : \`
      #wj-root{position:fixed;bottom:20px;\${cfg.widget_position === 'left' ? 'left' : 'right'}:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s,opacity .2s;background:\${color.bg};overflow:hidden}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn.hidden{opacity:0;pointer-events:none;transform:scale(0.5)}
      #wj-btn.pop{animation:wj-btn-pop .4s cubic-bezier(0.34,1.56,0.64,1)}
      #wj-btn svg{width:24px;height:24px}
      #wj-btn img{width:100%;height:100%;object-fit:cover}
      #wj-pop{display:none;position:absolute;bottom:0;\${cfg.widget_position === 'left' ? 'left' : 'right'}:0;width:350px;height:560px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;background:\${bgMain};z-index:2147483647;transform:translateZ(0)}
      #wj-pop.open{display:flex;flex-direction:column;animation:wj-expand .35s cubic-bezier(0,0,0.2,1)}
      #wj-pop.closing{display:flex;flex-direction:column;animation:wj-collapse .3s cubic-bezier(0.4,0,0.2,1) forwards}
      @keyframes wj-expand{from{opacity:0;transform:scale(0.85) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
      @keyframes wj-collapse{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(0.85) translateY(16px)}}
      @keyframes wj-btn-pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1);opacity:1}100%{transform:scale(1)}}
      #wj-scroll{flex:1;overflow-y:auto;position:relative;border-radius:inherit;background:\${bgMain}}
      #wj-gradient-overlay{display:none}
      \${gradient ? '#wj-gradient-overlay{display:block;position:absolute;top:0;left:0;right:0;height:256px;pointer-events:none;z-index:0;background:linear-gradient(180deg, '+(dark ? color.bg+'88' : color.bg+'30')+' 0%, '+(dark ? color.bg+'44' : color.bg+'15')+' 45%, transparent 100%)}' : ''}
      #wj-head{padding:20px 24px \${solid ? '16px' : '20px'} 24px;position:relative;z-index:1;\${solid ? 'background:'+color.bg+';color:#fff' : ''}\${bgImage ? 'background-image:linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('+bgImage+');background-size:cover;background-position:center;color:#fff' : ''}}
      #wj-hello{font-size:24px;font-weight:700;max-width:70%;word-break:break-word;white-space:pre-line;color:\${(solid || bgImage) ? '#fff' : textMain}}
      #wj-close{position:absolute;right:16px;top:16px;background:none;border:none;cursor:pointer;opacity:0.7;padding:4px}
      #wj-close:hover{opacity:1}
      #wj-close svg{width:16px;height:16px;stroke:\${(solid || bgImage) ? '#fff' : textSub}}
      #wj-contact{margin:\${solid ? '16px 0 0 0' : '0 16px'};padding:16px;border-radius:12px;position:relative;z-index:1;background:\${solid ? 'rgba(30,41,59,0.9)' : bgCard}}
      #wj-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0}
      #wj-cname{font-size:12px;color:\${solid ? 'rgba(255,255,255,0.6)' : textSub}}
      #wj-chelp{font-size:14px;color:\${solid ? '#fff' : textMain}}
      #wj-cbtn{width:100%;margin-top:12px;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer}
      #wj-cbtn:hover{background:\${color.hover}}
      #wj-whatsapp{width:100%;margin-top:8px;padding:10px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'};border-radius:8px;background:transparent;color:\${solid ? '#fff' : textMain};font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
      #wj-whatsapp:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      #wj-whatsapp svg{width:20px;height:20px}
      #wj-products{padding:16px;display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;margin-top:8px}
      #wj-products::-webkit-scrollbar{display:none}
      .wj-prod{flex-shrink:0;width:calc(100% - 48px);border-radius:16px;overflow:hidden;background:\${dark ? '#1e293b' : '#fff'}}
      .wj-prod-img{aspect-ratio:4/3;background:\${dark ? '#cbd5e1' : '#e2e8f0'};display:flex;align-items:center;justify-content:center}
      .wj-prod-img img{width:100%;height:100%;object-fit:cover}
      .wj-prod-info{padding:16px}
      .wj-prod-price{font-size:16px;color:\${textMain}}
      .wj-prod-old{font-size:14px;color:\${textSub};text-decoration:line-through;margin-left:8px}
      .wj-prod-title{font-weight:700;font-size:16px;color:\${textMain}}
      .wj-prod-sub{font-size:14px;color:\${textSub};margin-top:2px;margin-bottom:12px}
      .wj-prod-btn{width:100%;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;display:block;text-align:center;box-sizing:border-box}
      .wj-prod-btn:hover{background:\${color.hover}}
      #wj-ig{padding:0 16px 16px;margin-top:8px}
      #wj-ig-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
      #wj-ig-head svg{width:16px;height:16px;color:#ec4899}
      #wj-ig-head span{font-size:14px;font-weight:500;color:\${textMain}}
      #wj-ig-list{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
      #wj-ig-list::-webkit-scrollbar{display:none}
      .wj-ig-item{width:100px;height:100px;flex-shrink:0;border-radius:8px;overflow:hidden;background:\${dark ? '#374151' : '#e2e8f0'}}
      .wj-ig-item img{width:100%;height:100%;object-fit:cover}
      #wj-faq{padding:0 16px 16px;margin-top:16px}
      #wj-faq-box{border-radius:16px;padding:16px;background:\${bgFaq}}
      #wj-faq-head{display:flex;align-items:center;gap:8px;margin-bottom:12px}
      #wj-faq-head svg{width:16px;height:16px;color:\${textSub}}
      #wj-faq-head span{font-size:14px;font-weight:500;color:\${textMain}}
      .wj-faq-item{border-radius:8px}
      .wj-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:none;background:transparent;cursor:pointer;text-align:left;font-size:14px;font-weight:500;color:\${textMain}}
      .wj-faq-q:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      .wj-faq-q svg{width:16px;height:16px;color:\${textSub};transition:transform .2s}
      .wj-faq-q.open svg{transform:rotate(180deg)}
      .wj-faq-a{padding:4px 12px 12px;font-size:14px;color:\${textSub};display:none}
      .wj-faq-a.open{display:block}
      #wj-links{padding:0 16px 16px;margin-top:8px}
      #wj-greview{padding:0 16px 16px}
      #wj-greview-box{border-radius:16px;padding:16px;background:\${bgFaq};cursor:pointer;transition:background .15s}
      #wj-greview-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-greview-stars{display:flex;align-items:center;gap:2px}
      .wj-star{width:20px;height:20px;position:relative}
      .wj-star svg{position:absolute;inset:0;width:20px;height:20px}
      .wj-star-empty{color:\${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}}
      .wj-star-fill{color:\${dark ? '#fff' : '#0f172a'}}
      .wj-star-clip{position:absolute;inset:0;overflow:hidden}
      .wj-link-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:8px;border-radius:12px;background:\${dark ? '#1e293b' : '#fff'};text-decoration:none;transition:background .15s}
      .wj-link-item:hover{background:\${dark ? '#334155' : '#f1f5f9'}}
      .wj-link-item:last-child{margin-bottom:0}
      .wj-link-name{font-size:14px;font-weight:500;color:\${textMain}}
      .wj-link-arrow{width:28px;height:28px;border-radius:50%;background:\${dark ? '#374151' : '#e2e8f0'};display:flex;align-items:center;justify-content:center}
      .wj-link-arrow svg{width:14px;height:14px;color:\${textSub}}
      #wj-footer{padding:12px 16px 4px;background:\${bgMain}}
      #wj-nav{display:flex;border-radius:16px;background:\${dark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.7)'};backdrop-filter:blur(8px)}
      .wj-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border:none;background:transparent;cursor:pointer;color:\${textMain};font-size:12px}
      .wj-nav-item.inactive{color:\${textSub}}
      .wj-nav-item svg{width:20px;height:20px}
      #wj-powered{padding:8px;text-align:center;font-size:12px;color:\${textSub};background:\${bgMain}}
      #wj-home-view{display:flex;flex-direction:column;flex:1;min-height:0}
      #wj-chat-view{display:none;flex-direction:column;flex:1;min-height:0;background:\${dark ? '#000' : '#fff'}}
      #wj-chat-view.open{display:flex}
      #wj-home-view.hidden{display:none}
      #wj-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
      #wj-chat-back,#wj-chat-more,#wj-chat-close{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:\${dark ? '#1a1a1a' : '#e2e8f0'};color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-back:hover,#wj-chat-more:hover,#wj-chat-close:hover{background:\${dark ? '#333' : '#cbd5e1'}}
      #wj-chat-back svg,#wj-chat-more svg,#wj-chat-close svg{width:16px;height:16px}
      #wj-chat-title{display:flex;align-items:center;gap:10px}
      #wj-chat-avatar{width:32px;height:32px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:12px;font-weight:700}
      #wj-chat-avatar svg{width:16px;height:16px;color:#fff}
      #wj-chat-title-text{display:flex;flex-direction:column}
      #wj-chat-name{font-size:14px;font-weight:600;line-height:1.2;color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-subtitle{font-size:12px;line-height:1.2;color:\${dark ? 'rgba(255,255,255,0.5)' : '#64748b'}}
      #wj-chat-header-right{display:flex;align-items:center;gap:8px;position:relative}
      #wj-chat-menu{display:none;position:absolute;right:0;top:40px;z-index:50;width:176px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};background:\${dark ? '#18181b' : '#fff'};overflow:hidden}
      #wj-chat-menu.open{display:block}
      .wj-menu-item{display:flex;width:100%;align-items:center;gap:8px;padding:10px 12px;border:none;cursor:pointer;font-size:14px;white-space:nowrap;background:transparent;color:\${dark ? '#fff' : '#334155'}}
      .wj-menu-item:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      .wj-menu-item:disabled{opacity:0.4;cursor:not-allowed}
      .wj-menu-item svg{width:16px;height:16px;flex-shrink:0}
      #wj-chat-msgs{flex:1;overflow-y:auto;padding:16px}
      #wj-chat-bubble{display:flex;align-items:flex-start;gap:8px}
      #wj-chat-bubble-avatar{width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:10px;font-weight:700}
      #wj-chat-bubble-avatar svg{width:12px;height:12px;color:#fff}
      #wj-chat-bubble-text{padding:12px 16px;border-radius:16px;background:\${color.bg};color:#fff;font-size:14px}
      #wj-chat-input{position:relative;padding:16px}
      #wj-chat-input-box{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:24px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};background:\${dark ? '#111' : '#fff'};transition:border-color .2s}
      #wj-chat-input-box:focus-within{border-color:\${color.bg}}
      #wj-chat-input-box input{flex:1;border:none;background:transparent;font-size:14px;color:\${dark ? '#fff' : '#0f172a'};outline:none}
      #wj-chat-input-box input::placeholder{color:\${dark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}}
      #wj-chat-emoji,#wj-chat-mic,#wj-chat-send{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-mic.listening{background:\${color.bg};color:#fff;animation:wj-pulse 1.5s ease-in-out infinite}
      @keyframes wj-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff}
      #wj-chat-emoji svg,#wj-chat-mic svg,#wj-chat-send svg{width:20px;height:20px}
      #wj-emoji-picker{display:none;position:absolute;bottom:100%;left:16px;right:16px;margin-bottom:8px;padding:12px;border-radius:12px;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      #wj-emoji-picker.open{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
      .wj-emoji{border:none;background:transparent;font-size:16px;cursor:pointer;padding:4px;border-radius:4px;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{padding:8px;text-align:center;font-size:12px;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'}}
    \`;
    d.head.appendChild(style);

    // Bottom bar CSS (added when widget_type is bottom-bar)
    if (widgetType === 'bottom-bar') {
      var bbStyle = d.createElement('style');
      bbStyle.textContent = \`
        #wj-root{position:fixed;bottom:0;left:0;right:0;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;pointer-events:none}
        #wj-bb-launcher{position:fixed;bottom:20px;\${cfg.widget_position === 'left' ? 'left' : 'right'}:20px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${color.bg};overflow:hidden;pointer-events:auto;z-index:2147483648}
        #wj-bb-launcher:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
        #wj-bb-launcher.visible{display:flex;animation:wj-btn-pop .4s cubic-bezier(0.34,1.56,0.64,1)}
        #wj-bb-launcher svg{width:24px;height:24px}
        #wj-bb-launcher img{width:100%;height:100%;object-fit:cover}
        @keyframes wj-btn-pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1);opacity:1}100%{transform:scale(1)}}
        #wj-btn{display:none}
        #wj-pop{display:none}
        #wj-bb-glow{position:fixed;bottom:0;left:0;right:0;height:80px;pointer-events:none;background:linear-gradient(to top, \${color.bg}30 0%, \${color.bg}15 40%, transparent 100%)}
        #wj-bb-wrap{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:100%;max-width:540px;padding:0 16px;box-sizing:border-box;pointer-events:auto;z-index:2147483648}
        #wj-bb-bar{display:flex;align-items:center;gap:12px;border-radius:9999px;padding:14px 20px;box-shadow:0 4px 20px rgba(0,0,0,0.15);border:1px solid \${color.bg};background:\${dark ? '#18181b' : '#fff'};cursor:pointer}
        #wj-bb-bar input{flex:1;border:none;outline:none;background:transparent;font-size:16px;color:\${dark ? '#a1a1aa' : '#94a3b8'};cursor:pointer}
        #wj-bb-bar input::placeholder{color:\${dark ? '#a1a1aa' : '#94a3b8'}}
        #wj-bb-icons{display:flex;align-items:center;gap:6px;flex-shrink:0}
        #wj-bb-icons button{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? '#a1a1aa' : '#94a3b8'};transition:background .15s}
        #wj-bb-icons button:hover{background:\${dark ? '#27272a' : '#f1f5f9'}}
        #wj-bb-icons button svg{width:16px;height:16px}
        #wj-bb-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;pointer-events:auto}
        .wj-bb-pill{display:inline-flex;border-radius:9999px;padding:8px 16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);border:1px solid \${dark ? '#3f3f46' : '#f1f5f9'};background:\${dark ? '#18181b' : '#fff'};cursor:pointer;transition:all .15s;font-size:14px;font-weight:500;color:\${dark ? '#d4d4d8' : '#475569'}}
        .wj-bb-pill:hover{background:\${dark ? '#27272a' : '#f8fafc'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
        #wj-bb-expanded{display:none;position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:100%;max-width:540px;padding:0 16px;box-sizing:border-box;pointer-events:auto;z-index:2147483648}
        #wj-bb-expanded.open{display:block;animation:wj-expand .35s cubic-bezier(0,0,0.2,1)}
        #wj-bb-chat{border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2);border:1px solid \${color.bg};background:\${dark ? '#18181b' : '#fff'}}
        #wj-bb-controls{display:flex;align-items:center;justify-content:flex-end;padding:8px 12px 0}
        #wj-bb-controls button{width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? '#a1a1aa' : '#94a3b8'};transition:background .15s}
        #wj-bb-controls button:hover{background:\${dark ? '#27272a' : '#f1f5f9'}}
        #wj-bb-controls button svg{width:14px;height:14px}
        #wj-bb-msgs{overflow-y:auto;padding:12px 16px;max-height:280px;min-height:120px}
        #wj-bb-input{padding:12px 16px}
        #wj-bb-input-box{display:flex;align-items:center;gap:8px;border-radius:9999px;border:1px solid \${dark ? '#3f3f46' : '#e2e8f0'};padding:8px 16px;background:\${dark ? '#27272a' : '#f8fafc'};transition:border-color .2s}
        #wj-bb-input-box:focus-within{border-color:\${color.bg}}
        #wj-bb-input-box input{flex:1;border:none;outline:none;background:transparent;font-size:14px;color:\${dark ? '#fff' : '#0f172a'}}
        #wj-bb-input-box input::placeholder{color:\${dark ? '#71717a' : '#94a3b8'}}
        #wj-bb-input-box button{width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;transition:all .15s}
        #wj-bb-mic{color:\${dark ? '#a1a1aa' : '#94a3b8'}}
        #wj-bb-mic:hover{color:\${dark ? '#d4d4d8' : '#475569'}}
        #wj-bb-mic.listening{background:\${color.bg};color:#fff;animation:wj-pulse 1.5s ease-in-out infinite}
        #wj-bb-send{background:\${dark ? '#3f3f46' : '#e2e8f0'};color:\${dark ? '#a1a1aa' : '#64748b'}}
        #wj-bb-send:hover{background:\${dark ? '#52525b' : '#cbd5e1'}}
        #wj-bb-send.active{background:\${color.bg};color:#fff}
        #wj-bb-input-box button svg{width:16px;height:16px}
        #wj-bb-powered{display:flex;align-items:center;justify-content:center;gap:4px;padding:10px;font-size:10px;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}}
        #wj-bb-collapsed{pointer-events:auto}
        #wj-bb-collapsed.hidden{display:none}
        @keyframes wj-bb-fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      \`;
      d.head.appendChild(bbStyle);
    }

    // Inject custom CSS if provided
    if (customCss) {
      var customStyle = d.createElement('style');
      customStyle.textContent = customCss;
      d.head.appendChild(customStyle);
    }

    var root = d.createElement('div');
    root.id = 'wj-root';

    if (widgetType === 'bottom-bar') {
      // ============ BOTTOM BAR LAYOUT ============
      var bbCollapsed = d.createElement('div');
      bbCollapsed.id = 'wj-bb-collapsed';
      bbCollapsed.classList.add('hidden');

      // Glow
      var bbGlow = d.createElement('div');
      bbGlow.id = 'wj-bb-glow';
      bbCollapsed.appendChild(bbGlow);

      // FAQ pills container
      var bbPillsWrap = d.createElement('div');
      bbPillsWrap.id = 'wj-bb-wrap';
      bbPillsWrap.style.bottom = '80px';
      var bbPills = d.createElement('div');
      bbPills.id = 'wj-bb-pills';
      bbPills.style.display = 'none';
      if (faqEnabled && faqs.length > 0) {
        faqs.forEach(function(faq) {
          var pill = d.createElement('div');
          pill.className = 'wj-bb-pill';
          pill.textContent = faq.question;
          pill.style.animation = 'wj-bb-fadeIn 0.4s ease-out forwards';
          pill.style.opacity = '0';
          pill.onclick = function() {
            bbPills.style.display = 'none';
            openExpandedChat();
            sendBBMessage(faq.question);
          };
          bbPills.appendChild(pill);
        });
      }
      bbPillsWrap.appendChild(bbPills);
      bbCollapsed.appendChild(bbPillsWrap);

      // Bar
      var bbBarWrap = d.createElement('div');
      bbBarWrap.id = 'wj-bb-wrap';
      var bbBar = d.createElement('div');
      bbBar.id = 'wj-bb-bar';
      bbBar.innerHTML = '<input type="text" readonly placeholder="' + esc(hello) + '"/><div id="wj-bb-icons"><button id="wj-bb-bar-mic"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></button><button id="wj-bb-bar-expand"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button><button id="wj-bb-bar-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button></div>';
      bbBarWrap.appendChild(bbBar);
      bbCollapsed.appendChild(bbBarWrap);

      // Expanded chat
      var bbExpanded = d.createElement('div');
      bbExpanded.id = 'wj-bb-expanded';
      var bbChat = d.createElement('div');
      bbChat.id = 'wj-bb-chat';

      // Controls (minimize + close at top right)
      bbChat.innerHTML = '<div id="wj-bb-controls"><button id="wj-bb-minimize"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button><button id="wj-bb-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button></div>';

      // Messages area
      var bbMsgs = d.createElement('div');
      bbMsgs.id = 'wj-bb-msgs';
      var welcomeBubbleAvatar = avatar
        ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>'
        : '<div style="width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:10px;font-weight:700">' + esc(avatarInitial) + '</div>';
      bbMsgs.innerHTML = '<div style="display:flex;align-items:flex-start;gap:8px">' + welcomeBubbleAvatar + '<div style="padding:10px 16px;border-radius:16px;background:' + color.bg + ';color:#fff;font-size:14px">' + esc(tr.welcomeMessage) + '</div></div>';
      bbChat.appendChild(bbMsgs);

      // Input area
      var bbInputArea = d.createElement('div');
      bbInputArea.id = 'wj-bb-input';
      bbInputArea.innerHTML = '<div id="wj-bb-input-box"><input type="text" placeholder="' + esc(tr.writeMessage) + '"/><button id="wj-bb-mic"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></button><button id="wj-bb-send"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button></div>';
      bbChat.appendChild(bbInputArea);

      // Powered by
      if (showBranding) {
        var bbPowered = d.createElement('div');
        bbPowered.id = 'wj-bb-powered';
        bbPowered.innerHTML = 'Powered by <span style="font-weight:500">Widjet</span>';
        bbChat.appendChild(bbPowered);
      }

      bbExpanded.appendChild(bbChat);

      // Launcher button (tondolino) - shown when bar is closed
      var bbLauncher = d.createElement('button');
      bbLauncher.id = 'wj-bb-launcher';
      if (buttonLogo) {
        bbLauncher.innerHTML = '<img src="' + esc(buttonLogo) + '" alt="Widget"/>';
      } else {
        bbLauncher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      }
      root.appendChild(bbLauncher);

      root.appendChild(bbCollapsed);
      root.appendChild(bbExpanded);

      // Show FAQ pills after bar becomes visible (delayed by 3s)
      function showFaqPills() {
        if (faqEnabled && faqs.length > 0) {
          setTimeout(function() {
            bbPills.style.display = 'flex';
            var pills = bbPills.querySelectorAll('.wj-bb-pill');
            pills.forEach(function(p, i) {
              p.style.animationDelay = (i * 150) + 'ms';
            });
          }, 3000);
        }
      }

      // Track impression
      trackEvent('impression');

      // Start closed: show only the launcher icon
      showLauncher();

      // Event handlers
      function showLauncher() {
        bbLauncher.classList.add('visible');
      }
      function hideLauncher() {
        bbLauncher.classList.remove('visible');
      }

      bbLauncher.onclick = function() {
        hideLauncher();
        bbCollapsed.classList.remove('hidden');
        showFaqPills();
      };

      bbBar.onclick = function() { openExpandedChat(); };
      bbBar.querySelector('#wj-bb-bar-expand').onclick = function(e) { e.stopPropagation(); openExpandedChat(); };
      bbBar.querySelector('#wj-bb-bar-close').onclick = function(e) {
        e.stopPropagation();
        bbCollapsed.classList.add('hidden');
        showLauncher();
      };
      bbBar.querySelector('#wj-bb-bar-mic').onclick = function(e) { e.stopPropagation(); };

      bbChat.querySelector('#wj-bb-minimize').onclick = function() { closeExpandedChat(); };
      bbChat.querySelector('#wj-bb-close').onclick = function() {
        bbExpanded.classList.remove('open');
        bbCollapsed.classList.add('hidden');
        stopPolling();
        showLauncher();
      };

      function openExpandedChat() {
        hideLauncher();
        bbCollapsed.classList.add('hidden');
        bbExpanded.classList.add('open');
        bbPills.style.display = 'none';
        startPolling();
        trackEvent('click');
      }

      function closeExpandedChat() {
        bbExpanded.classList.remove('open');
        bbCollapsed.classList.remove('hidden');
        stopPolling();
      }

      // Chat input handling
      var bbChatInput = bbInputArea.querySelector('input');
      var bbSendBtn = bbInputArea.querySelector('#wj-bb-send');
      var bbMicBtn = bbInputArea.querySelector('#wj-bb-mic');

      function updateBBSend() {
        if (bbChatInput.value.trim()) {
          bbSendBtn.classList.add('active');
        } else {
          bbSendBtn.classList.remove('active');
        }
      }

      function sendBBMessage(text) {
        if (!text || !text.trim()) return;
        var msg = text.trim();
        var tempId = 'temp_' + Date.now();
        renderBBMessage({ id: tempId, sender_type: 'visitor', content: msg });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', u + '/functions/v1/send-chat-message', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState !== 4) return;
          if (xhr.status === 200) {
            try {
              var res = JSON.parse(xhr.responseText);
              if (res.visitorToken) { visitorToken = res.visitorToken; localStorage.setItem('wj_visitor_token', visitorToken); }
              if (res.messageId) { renderedMessageIds[res.messageId] = true; lastMessageId = res.messageId; }
            } catch(e) {}
          }
        };
        xhr.send(JSON.stringify({ widgetId: id, visitorId: visitorId, visitorToken: visitorToken, message: msg, visitorName: 'Visitor' }));
      }

      function renderBBMessage(msg) {
        if (renderedMessageIds[msg.id]) return;
        renderedMessageIds[msg.id] = true;
        var bubble = d.createElement('div');
        if (msg.sender_type === 'visitor') {
          bubble.style.cssText = 'display:flex;justify-content:flex-end;margin-top:12px';
          bubble.innerHTML = '<div style="padding:10px 16px;border-radius:16px;border-top-right-radius:4px;background:' + color.bg + ';color:#fff;font-size:14px;max-width:80%">' + esc(msg.content) + '</div>';
        } else {
          bubble.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin-top:12px';
          bubble.innerHTML = welcomeBubbleAvatar + '<div style="padding:10px 16px;border-radius:16px;background:' + color.bg + ';color:#fff;font-size:14px;max-width:70%">' + esc(msg.content) + '</div>';
        }
        bbMsgs.appendChild(bubble);
        lastMessageId = msg.id;
        bbMsgs.scrollTop = bbMsgs.scrollHeight;
      }

      bbSendBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var msg = bbChatInput.value.trim();
        if (!msg) return;
        sendBBMessage(msg);
        bbChatInput.value = '';
        updateBBSend();
      };

      bbChatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); bbSendBtn.onclick(e); }
      });
      bbChatInput.addEventListener('input', updateBBSend);

      // Voice for bottom bar
      var bbRecognition = null;
      var SpeechRecognition2 = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (SpeechRecognition2 && bbMicBtn) {
        bbMicBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (bbRecognition) { bbRecognition.stop(); return; }
          try {
            var r = new SpeechRecognition2();
            r.lang = lang || 'en';
            r.interimResults = true;
            r.continuous = false;
            bbRecognition = r;
            var ft = bbChatInput.value;
            r.onresult = function(ev) {
              var interim = '';
              for (var i = ev.resultIndex; i < ev.results.length; i++) {
                if (ev.results[i].isFinal) ft += ev.results[i][0].transcript;
                else interim += ev.results[i][0].transcript;
              }
              bbChatInput.value = ft + interim;
              updateBBSend();
            };
            r.onend = function() { bbRecognition = null; bbMicBtn.classList.remove('listening'); };
            r.onerror = function() { bbRecognition = null; bbMicBtn.classList.remove('listening'); };
            bbMicBtn.classList.add('listening');
            r.start();
          } catch(err) {}
        };
      }

      // Polling (shared variables)
      var visitorId = localStorage.getItem('wj_visitor_id');
      if (!visitorId) { visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(); localStorage.setItem('wj_visitor_id', visitorId); }
      var visitorToken = localStorage.getItem('wj_visitor_token') || '';
      var lastMessageId = null;
      var pollInterval = null;
      var renderedMessageIds = {};

      function pollMessages() {
        var pollUrl = u + '/functions/v1/get-chat-messages?visitorId=' + encodeURIComponent(visitorId) + '&widgetId=' + encodeURIComponent(id) + '&visitorToken=' + encodeURIComponent(visitorToken);
        if (lastMessageId) pollUrl += '&lastMessageId=' + encodeURIComponent(lastMessageId);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', pollUrl, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState !== 4 || xhr.status !== 200) return;
          try {
            var res = JSON.parse(xhr.responseText);
            if (res.messages && res.messages.length > 0) {
              res.messages.forEach(function(msg) { renderBBMessage(msg); });
            }
          } catch(e) {}
        };
        xhr.send();
      }
      function startPolling() { if (pollInterval) return; pollMessages(); pollInterval = setInterval(pollMessages, 3000); }
      function stopPolling() { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }

      d.body.appendChild(root);

      // Inject custom JS
      if (customJs) { try { new Function(customJs)(); } catch(e) { console.error('[Widjet] Custom JS error:', e); } }
      return;
    }

    // ============ POPUP LAYOUT (existing code) ============
    var pop = d.createElement('div');
    pop.id = 'wj-pop';

    // HOME VIEW
    var homeView = d.createElement('div');
    homeView.id = 'wj-home-view';

    var scroll = d.createElement('div');
    scroll.id = 'wj-scroll';

    // Header
    var header = d.createElement('div');
    header.id = 'wj-head';
    header.innerHTML = '<div id="wj-hello">' + esc(hello) + '</div><button id="wj-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg></button>';

    // Contact card
    var contact = d.createElement('div');
    contact.id = 'wj-contact';
    var avatarHtml = avatar 
      ? '<img src="' + esc(avatar) + '" id="wj-avatar" alt=""/>' 
      : '<div id="wj-avatar">' + esc(avatarInitial) + '</div>';
    var whatsappBtnHtml = (whatsappEnabled && whatsappNumber) 
      ? '<button id="wj-whatsapp" onclick="window.open(&quot;https://wa.me/' + esc(whatsappCountryCode + whatsappNumber) + '&quot;,&quot;_blank&quot;)"><svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' + esc(tr.contactWhatsApp || 'Contact us on WhatsApp') + '</button>'
      : '';
    contact.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' + avatarHtml + '<div style="flex:1"><div id="wj-cname">' + esc(name) + '</div><div id="wj-chelp">' + esc(help) + '</div></div></div><button id="wj-cbtn">' + esc(tr.contactUs) + '</button>' + whatsappBtnHtml;

    // Add gradient overlay element
    if (gradient) {
      var gradOverlay = d.createElement('div');
      gradOverlay.id = 'wj-gradient-overlay';
      scroll.appendChild(gradOverlay);
    }

    // In solid mode, contact card goes inside header; otherwise after header
    if (solid) {
      header.appendChild(contact);
      scroll.appendChild(header);
    } else {
      scroll.appendChild(header);
      scroll.appendChild(contact);
    }

    // Product cards
    if (products.length > 0) {
      var prodCont = d.createElement('div');
      prodCont.id = 'wj-products';
      products.forEach(function(p) {
        var card = d.createElement('div');
        card.className = 'wj-prod';
        var imgHtml = p.image_url 
          ? '<img src="' + esc(p.image_url) + '" alt=""/>' 
          : '<div style="width:48px;height:48px;background:#94a3b8;border-radius:4px"></div>';
        var priceHtml = p.price 
          ? '<div><span class="wj-prod-price">' + esc(p.price) + '</span>' + (p.old_price ? '<span class="wj-prod-old">' + esc(p.old_price) + '</span>' : '') + '</div>' 
          : '';
        var subHtml = p.subtitle 
          ? '<div class="wj-prod-sub">' + esc(p.subtitle) + '</div>' 
          : '<div style="margin-bottom:12px"></div>';
        var btnHtml = p.product_url 
          ? '<a href="' + esc(p.product_url) + '" target="_blank" rel="noopener" class="wj-prod-btn">' + esc(tr.show) + '</a>' 
          : '<button class="wj-prod-btn">' + esc(tr.show) + '</button>';
        card.innerHTML = '<div class="wj-prod-img">' + imgHtml + '</div><div class="wj-prod-info">' + priceHtml + '<div class="wj-prod-title">' + esc(p.title) + '</div>' + subHtml + btnHtml + '</div>';
        prodCont.appendChild(card);
      });
      scroll.appendChild(prodCont);
    }

    // Instagram posts
    if (igEnabled && igPosts.length > 0) {
      var igCont = d.createElement('div');
      igCont.id = 'wj-ig';
      igCont.innerHTML = '<div id="wj-ig-head"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1.5"/></svg><span>' + esc(tr.followIg) + '</span></div>';
      var igList = d.createElement('div');
      igList.id = 'wj-ig-list';
      igPosts.forEach(function(post) {
        var item = d.createElement('a');
        item.className = 'wj-ig-item';
        item.href = post.url;
        item.target = '_blank';
        item.rel = 'noopener';
        if (post.thumbnail_url) {
          item.innerHTML = '<img src="' + esc(post.thumbnail_url) + '" alt=""/>';
        }
        igList.appendChild(item);
      });
      igCont.appendChild(igList);
      scroll.appendChild(igCont);
    }

    // FAQ
    if (faqEnabled && faqs.length > 0) {
      var faqCont = d.createElement('div');
      faqCont.id = 'wj-faq';
      faqCont.innerHTML = '<div id="wj-faq-box"><div id="wj-faq-head"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg><span>' + esc(tr.quickAnswers) + '</span></div><div id="wj-faq-items"></div></div>';
      var faqItems = faqCont.querySelector('#wj-faq-items');
      faqs.forEach(function(faq) {
        var item = d.createElement('div');
        item.className = 'wj-faq-item';
        item.innerHTML = '<button class="wj-faq-q"><span>' + esc(faq.question || 'Untitled') + '</span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></button><div class="wj-faq-a">' + esc(faq.answer || '') + '</div>';
        item.querySelector('.wj-faq-q').onclick = function() {
          var hasAnswer = (faq.answer || '').trim().length > 0;
          if (!hasAnswer) {
            homeView.classList.add('hidden');
            chatView.classList.add('open');
            startPolling();
            sendMessageText(faq.question);
            return;
          }
          var isOpen = this.classList.contains('open');
          faqItems.querySelectorAll('.wj-faq-q').forEach(function(q) { q.classList.remove('open'); });
          faqItems.querySelectorAll('.wj-faq-a').forEach(function(a) { a.classList.remove('open'); });
          if (!isOpen) {
            this.classList.add('open');
            item.querySelector('.wj-faq-a').classList.add('open');
          }
        };
        faqItems.appendChild(item);
      });
      scroll.appendChild(faqCont);
    }

    // Custom Links
    if (customLinks.length > 0) {
      var linksCont = d.createElement('div');
      linksCont.id = 'wj-links';
      customLinks.forEach(function(link) {
        var item = d.createElement('a');
        item.className = 'wj-link-item';
        item.href = link.url;
        item.target = '_blank';
        item.rel = 'noopener';
        item.innerHTML = '<span class="wj-link-name">' + esc(link.name || 'Untitled') + '</span><div class="wj-link-arrow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></div>';
        linksCont.appendChild(item);
      });
      scroll.appendChild(linksCont);
    }

    // Google Reviews inline card
    if (grEnabled && grName) {
      var grCont = d.createElement('div');
      grCont.id = 'wj-greview';
      var starsSvg = '';
      for (var s = 1; s <= 5; s++) {
        var isFull = s <= Math.floor(grRating);
        var isHalf = !isFull && s === Math.ceil(grRating) && grRating % 1 >= 0.25;
        var starFillSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        var starEmptySvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        if (isFull) {
          starsSvg += '<div class="wj-star"><span class="wj-star-empty">' + starEmptySvg + '</span><div class="wj-star-clip" style="width:100%"><span class="wj-star-fill">' + starFillSvg + '</span></div></div>';
        } else if (isHalf) {
          starsSvg += '<div class="wj-star"><span class="wj-star-empty">' + starEmptySvg + '</span><div class="wj-star-clip" style="width:50%"><span class="wj-star-fill">' + starFillSvg + '</span></div></div>';
        } else {
          starsSvg += '<div class="wj-star"><span class="wj-star-empty">' + starEmptySvg + '</span></div>';
        }
      }
      grCont.innerHTML = '<div id="wj-greview-box"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:24px;font-weight:700;color:' + textMain + '">' + grRating + '</span><div id="wj-greview-stars">' + starsSvg + '</div></div><p style="font-size:14px;color:' + textSub + ';margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(grName) + '</p><p style="font-size:14px;color:' + textSub + ';margin:4px 0 0">Check <span style="font-weight:700;color:' + textMain + '">' + grTotal + '</span> reviews on <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></p></div>';
      grCont.querySelector('#wj-greview-box').onclick = function() {
        if (grUrl) w.open(grUrl, '_blank', 'noopener,noreferrer');
      };
      scroll.appendChild(grCont);
    }

    homeView.appendChild(scroll);

    // Footer nav
    var footer = d.createElement('div');
    footer.id = 'wj-footer';
    footer.innerHTML = '<div id="wj-nav"><button class="wj-nav-item"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>' + esc(tr.home) + '</span></button><button class="wj-nav-item inactive"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>' + esc(tr.contact) + '</span></button></div>';
    homeView.appendChild(footer);

    // Powered by (conditional based on showBranding)
    if (showBranding) {
      var powered = d.createElement('div');
      powered.id = 'wj-powered';
      powered.innerHTML = 'Powered by <span style="font-weight:500">Widjet</span>';
      homeView.appendChild(powered);
    }

    // CHAT VIEW
    var chatView = d.createElement('div');
    chatView.id = 'wj-chat-view';
    var emojis = ['😀','😂','😊','🥰','😍','🤔','😢','😭','😡','🥳','👍','👎','❤️','🔥','✨','🎉','💯','🙏','👋','🤝'];
    var emojiHtml = emojis.map(function(e) { return '<button class="wj-emoji">' + e + '</button>'; }).join('');
    var chatAvatarHtml = avatar 
      ? '<img src="' + esc(avatar) + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>' 
      : '<div id="wj-chat-avatar">' + esc(avatarInitial) + '</div>';
    var bubbleAvatarHtml = avatar 
      ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>' 
      : '<div id="wj-chat-bubble-avatar">' + esc(avatarInitial) + '</div>';
    chatView.innerHTML = '<div id="wj-chat-header"><button id="wj-chat-back"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button><div id="wj-chat-title">' + chatAvatarHtml + '<div id="wj-chat-title-text"><span id="wj-chat-name">' + esc(name) + '</span><span id="wj-chat-subtitle">' + esc(tr.contactUs || 'The team can also help') + '</span></div></div><div id="wj-chat-header-right"><button id="wj-chat-more"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button><div id="wj-chat-menu"><button class="wj-menu-item" id="wj-menu-clear"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>Clear chat</button><button class="wj-menu-item" id="wj-menu-download"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Download transcript</button></div><button id="wj-chat-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button></div></div><div id="wj-chat-msgs"><div id="wj-chat-bubble">' + bubbleAvatarHtml + '<div id="wj-chat-bubble-text">' + esc(tr.welcomeMessage) + '</div></div></div><div id="wj-chat-input"><div id="wj-emoji-picker">' + emojiHtml + '</div><div id="wj-chat-input-box"><input type="text" placeholder="' + esc(tr.writeMessage) + '"/><button id="wj-chat-emoji"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button><button id="wj-chat-mic"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></button><button id="wj-chat-send"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button></div></div><div id="wj-chat-powered">Powered by <span style="font-weight:500">Widjet</span></div>';

    pop.appendChild(homeView);
    pop.appendChild(chatView);

    // Button
    var btn = d.createElement('button');
    btn.id = 'wj-btn';
    btn.innerHTML = buttonLogo 
      ? '<img src="' + esc(buttonLogo) + '" alt=""/>' 
      : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>';
    // Analytics tracking helper
    function trackEvent(eventType) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', u + '/functions/v1/track-widget-event', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          widget_id: id,
          event_type: eventType,
          visitor_id: visitorId,
          page_url: w.location.href
        }));
      } catch(e) {}
    }

    // Track impression on load
    trackEvent('impression');

    // Animated close: play collapse, then hide and show button with pop
    function closeWidget() {
      pop.classList.remove('open');
      pop.classList.add('closing');
      setTimeout(function() {
        pop.classList.remove('closing');
        btn.classList.remove('hidden');
        btn.classList.add('pop');
        setTimeout(function() { btn.classList.remove('pop'); }, 400);
      }, 300);
    }

    btn.onclick = function() {
      if (pop.classList.contains('open') || pop.classList.contains('closing')) return;
      pop.classList.add('open');
      btn.classList.add('hidden');
      trackEvent('click');
    };

    // Close button handler (minimize)
    pop.querySelector('#wj-close').onclick = function() {
      closeWidget();
    };

    // Contact Us button - opens chat
    pop.querySelector('#wj-cbtn').onclick = function() {
      homeView.classList.add('hidden');
      chatView.classList.add('open');
      startPolling();
    };

    // Chat back button - returns to home
    chatView.querySelector('#wj-chat-back').onclick = function() {
      chatView.classList.remove('open');
      homeView.classList.remove('hidden');
      stopPolling();
    };

    // Chat close button - minimizes widget
    chatView.querySelector('#wj-chat-close').onclick = function() {
      chatView.classList.remove('open');
      homeView.classList.remove('hidden');
      closeWidget();
      stopPolling();
    };

    // Three-dot menu toggle
    var chatMenu = chatView.querySelector('#wj-chat-menu');
    var chatMoreBtn = chatView.querySelector('#wj-chat-more');
    chatMoreBtn.onclick = function(e) {
      e.stopPropagation();
      chatMenu.classList.toggle('open');
    };
    d.addEventListener('mousedown', function(e) {
      if (chatMenu && !chatMenu.contains(e.target) && e.target !== chatMoreBtn) {
        chatMenu.classList.remove('open');
      }
    });
    // Clear chat
    chatView.querySelector('#wj-menu-clear').onclick = function() {
      var msgs = chatView.querySelector('#wj-chat-msgs');
      msgs.innerHTML = '<div id="wj-chat-bubble">' + bubbleAvatarHtml + '<div id="wj-chat-bubble-text">' + esc(tr.welcomeMessage) + '</div></div>';
      chatMenu.classList.remove('open');
      renderedMessageIds = {};
      lastMessageId = null;
      if (visitorToken) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', u + '/functions/v1/clear-chat', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          widgetId: id,
          visitorId: visitorId,
          visitorToken: visitorToken
        }));
      }
    };
    // Download transcript
    chatView.querySelector('#wj-menu-download').onclick = function() {
      var msgs = chatView.querySelector('#wj-chat-msgs');
      var lines = [];
      var bubbles = msgs.querySelectorAll('div[style]');
      bubbles.forEach(function(el) {
        var text = el.textContent.trim();
        if (text && text.length > 0 && text !== esc(tr.welcomeMessage)) lines.push(text);
      });
      if (lines.length === 0) return;
      var blob = new Blob([lines.join('\\n\\n')], { type: 'text/plain' });
      var a = d.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'chat-transcript.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      chatMenu.classList.remove('open');
    };

    // Footer contact nav button - opens chat
    var navBtns = footer.querySelectorAll('.wj-nav-item');
    if (navBtns[1]) {
      navBtns[1].onclick = function() {
        homeView.classList.add('hidden');
        chatView.classList.add('open');
        startPolling();
      };
    }

    // Chat send message functionality
    var chatMsgs = chatView.querySelector('#wj-chat-msgs');
    var chatInputBox = chatView.querySelector('#wj-chat-input-box');
    var chatInput = chatInputBox ? chatInputBox.querySelector('input') : null;
    var chatSendBtn = chatView.querySelector('#wj-chat-send');
    var chatEmojiBtn = chatView.querySelector('#wj-chat-emoji');
    var chatMicBtn = chatView.querySelector('#wj-chat-mic');
    var emojiPicker = chatView.querySelector('#wj-emoji-picker');

    // Generate or retrieve visitor ID
    var visitorId = localStorage.getItem('wj_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('wj_visitor_id', visitorId);
    }

    var visitorToken = localStorage.getItem('wj_visitor_token') || '';
    var lastMessageId = null;
    var pollInterval = null;
    var renderedMessageIds = {};

    function updateSendButton() {
      if (chatInput && chatSendBtn) {
        if (chatInput.value.trim()) {
          chatSendBtn.classList.add('active');
        } else {
          chatSendBtn.classList.remove('active');
        }
      }
    }

    function renderMessage(msg) {
      if (renderedMessageIds[msg.id]) return;
      renderedMessageIds[msg.id] = true;
      var bubble = d.createElement('div');
      bubble.style.cssText = msg.sender_type === 'visitor' 
        ? 'display:flex;justify-content:flex-end;margin-top:12px'
        : 'display:flex;align-items:flex-start;gap:12px;margin-top:12px';
      if (msg.sender_type === 'visitor') {
        bubble.innerHTML = '<div style="padding:12px 16px;border-radius:16px;border-top-right-radius:4px;background:' + color.bg + ';color:#fff;font-size:14px;max-width:80%">' + esc(msg.content) + '</div>';
      } else {
        bubble.innerHTML = (avatar ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>' : '<div style="width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:10px;font-weight:700">' + esc(avatarInitial) + '</div>') + '<div style="padding:12px 16px;border-radius:16px;background:' + color.bg + ';color:#fff;font-size:14px;max-width:70%">' + esc(msg.content) + '</div>';
      }
      chatMsgs.appendChild(bubble);
      lastMessageId = msg.id;
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function pollMessages() {
      var pollUrl = u + '/functions/v1/get-chat-messages?visitorId=' + encodeURIComponent(visitorId) + '&widgetId=' + encodeURIComponent(id) + '&visitorToken=' + encodeURIComponent(visitorToken);
      if (lastMessageId) {
        pollUrl += '&lastMessageId=' + encodeURIComponent(lastMessageId);
      }
      var xhr = new XMLHttpRequest();
      xhr.open('GET', pollUrl, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4 || xhr.status !== 200) return;
        try {
          var res = JSON.parse(xhr.responseText);
          if (res.messages && res.messages.length > 0) {
            res.messages.forEach(function(msg) {
              renderMessage(msg);
            });
          }
        } catch(e) {
          console.error('[Widjet] Poll error');
        }
      };
      xhr.send();
    }

    function startPolling() {
      if (pollInterval) return;
      pollMessages();
      pollInterval = setInterval(pollMessages, 3000);
    }

    function stopPolling() {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }

    function sendMessageText(text) {
      if (!text || !text.trim()) return;
      var msg = text.trim();
      var tempId = 'temp_' + Date.now();
      var tempMsg = { id: tempId, sender_type: 'visitor', content: msg };
      renderMessage(tempMsg);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', u + '/functions/v1/send-chat-message', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
          try {
            var res = JSON.parse(xhr.responseText);
            if (res.visitorToken) {
              visitorToken = res.visitorToken;
              localStorage.setItem('wj_visitor_token', visitorToken);
            }
            if (res.messageId) {
              renderedMessageIds[res.messageId] = true;
              lastMessageId = res.messageId;
            }
          } catch(e) {}
        }
      };
      xhr.send(JSON.stringify({
        widgetId: id,
        visitorId: visitorId,
        visitorToken: visitorToken,
        message: msg,
        visitorName: 'Visitor'
      }));
    }

    function sendMessage() {
      if (!chatInput) return;
      var msg = chatInput.value.trim();
      if (!msg) return;
      var tempId = 'temp_' + Date.now();
      var tempMsg = { id: tempId, sender_type: 'visitor', content: msg };
      renderMessage(tempMsg);
      chatInput.value = '';
      updateSendButton();
      if (emojiPicker) emojiPicker.classList.remove('open');

      var xhr = new XMLHttpRequest();
      xhr.open('POST', u + '/functions/v1/send-chat-message', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
          try {
            var res = JSON.parse(xhr.responseText);
            if (res.visitorToken) {
              visitorToken = res.visitorToken;
              localStorage.setItem('wj_visitor_token', visitorToken);
            }
            if (res.messageId) {
              renderedMessageIds[res.messageId] = true;
              lastMessageId = res.messageId;
            }
          } catch(e) {}
        }
      };
      xhr.send(JSON.stringify({
        widgetId: id,
        visitorId: visitorId,
        visitorToken: visitorToken,
        message: msg,
        visitorName: 'Visitor'
      }));
    }

    if (chatSendBtn) {
      chatSendBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendMessage();
      };
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });
      chatInput.addEventListener('input', updateSendButton);
    }

    if (chatEmojiBtn && emojiPicker) {
      chatEmojiBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        emojiPicker.classList.toggle('open');
      };
    }

    if (emojiPicker && chatInput) {
      var emojiButtons = emojiPicker.querySelectorAll('.wj-emoji');
      emojiButtons.forEach(function(btn) {
        btn.onclick = function(e) {
          e.preventDefault();
          chatInput.value += this.textContent;
          emojiPicker.classList.remove('open');
          chatInput.focus();
          updateSendButton();
        };
      });
    }

    var wjRecognition = null;
    if (chatMicBtn && chatInput) {
      var SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (SpeechRecognition) {
        chatMicBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (wjRecognition) {
            wjRecognition.stop();
            return;
          }
          try {
            var recognition = new SpeechRecognition();
            recognition.lang = lang || 'en';
            recognition.interimResults = true;
            recognition.continuous = false;
            wjRecognition = recognition;
            var finalTranscript = chatInput.value;

            recognition.onresult = function(ev) {
              var interim = '';
              for (var i = ev.resultIndex; i < ev.results.length; i++) {
                if (ev.results[i].isFinal) {
                  finalTranscript += ev.results[i][0].transcript;
                } else {
                  interim += ev.results[i][0].transcript;
                }
              }
              chatInput.value = finalTranscript + interim;
              updateSendButton();
            };
            recognition.onend = function() {
              wjRecognition = null;
              chatMicBtn.classList.remove('listening');
            };
            recognition.onerror = function() {
              wjRecognition = null;
              chatMicBtn.classList.remove('listening');
            };
            chatMicBtn.classList.add('listening');
            recognition.start();
          } catch(err) {
            console.error('[Widjet] Speech recognition error:', err);
          }
        };
      } else {
        chatMicBtn.style.display = 'none';
      }
    }

    root.appendChild(pop);
    root.appendChild(btn);
    d.body.appendChild(root);

    // Inject custom JS if provided
    if (customJs) {
      try { new Function(customJs)(); } catch(e) { console.error('[Widjet] Custom JS error:', e); }
    }
  }

  function esc(s) {
    if (!s) return '';
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
