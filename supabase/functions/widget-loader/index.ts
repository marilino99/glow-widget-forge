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
    var inIframe = false;
    try { inIframe = w.self !== w.top; } catch(e) { inIframe = true; }

    var style = d.createElement('style');
    style.textContent = inIframe ? \`
      #wj-root{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;pointer-events:none}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${color.bg};overflow:hidden;position:absolute;bottom:20px;right:20px;pointer-events:auto}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn.hidden{display:none}
      #wj-btn svg{width:24px;height:24px}
      #wj-btn img{width:100%;height:100%;object-fit:cover}
      #wj-pop{display:none;width:calc(100% - 24px);max-width:350px;height:calc(100% - 24px);max-height:560px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;animation:wj-in .2s ease;background:\${bgMain};z-index:2147483647;pointer-events:auto;transform:translateZ(0)}
      #wj-pop.open{display:flex;flex-direction:column}
      @keyframes wj-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
      #wj-scroll{flex:1;overflow-y:auto;position:relative;border-radius:inherit;overscroll-behavior:none}
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
      #wj-chat-emoji,#wj-chat-send{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff}
      #wj-chat-emoji svg,#wj-chat-send svg{width:20px;height:20px}
      #wj-emoji-picker{display:none;position:absolute;bottom:100%;left:16px;right:16px;margin-bottom:8px;padding:12px;border-radius:12px;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      #wj-emoji-picker.open{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
      .wj-emoji{border:none;background:transparent;font-size:16px;cursor:pointer;padding:4px;border-radius:4px;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{padding:8px;text-align:center;font-size:11px;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};border-top:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
    \` : \`
      #wj-root{position:fixed;bottom:20px;\${cfg.widget_position === 'left' ? 'left' : 'right'}:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${color.bg};overflow:hidden}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn svg{width:24px;height:24px}
      #wj-btn img{width:100%;height:100%;object-fit:cover}
      #wj-pop{display:none;position:fixed;bottom:90px;\${cfg.widget_position === 'left' ? 'left' : 'right'}:20px;width:350px;height:560px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;animation:wj-in .2s ease;background:\${bgMain};z-index:2147483647;transform:translateZ(0)}
      #wj-pop.open{display:flex;flex-direction:column}
      @keyframes wj-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      #wj-scroll{flex:1;overflow-y:auto;position:relative;border-radius:inherit;overscroll-behavior:none}
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
      #wj-chat-emoji,#wj-chat-send{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff}
      #wj-chat-emoji svg,#wj-chat-send svg{width:20px;height:20px}
      #wj-emoji-picker{display:none;position:absolute;bottom:100%;left:16px;right:16px;margin-bottom:8px;padding:12px;border-radius:12px;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      #wj-emoji-picker.open{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
      .wj-emoji{border:none;background:transparent;font-size:16px;cursor:pointer;padding:4px;border-radius:4px;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{padding:8px;text-align:center;font-size:12px;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};border-top:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
    \`;
    d.head.appendChild(style);

    // Inject custom CSS if provided
    if (customCss) {
      var customStyle = d.createElement('style');
      customStyle.textContent = customCss;
      d.head.appendChild(customStyle);
    }

    var root = d.createElement('div');
    root.id = 'wj-root';

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
    chatView.innerHTML = '<div id="wj-chat-header"><button id="wj-chat-back"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button><div id="wj-chat-title"><div id="wj-chat-avatar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div><div id="wj-chat-title-text"><span id="wj-chat-name">' + esc(name) + '</span><span id="wj-chat-subtitle">' + esc(tr.contactUs || 'The team can also help') + '</span></div></div><div id="wj-chat-header-right"><button id="wj-chat-more"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button><button id="wj-chat-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button></div></div><div id="wj-chat-msgs"><div id="wj-chat-bubble"><div id="wj-chat-bubble-avatar"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div><div id="wj-chat-bubble-text">' + esc(tr.welcomeMessage) + '</div></div></div><div id="wj-chat-input"><div id="wj-emoji-picker">' + emojiHtml + '</div><div id="wj-chat-input-box"><input type="text" placeholder="' + esc(tr.writeMessage) + '"/><button id="wj-chat-emoji"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button><button id="wj-chat-send"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button></div></div><div id="wj-chat-powered">Powered by <span style="font-weight:500">Widjet</span></div>';

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

    btn.onclick = function() {
      var wasOpen = pop.classList.contains('open');
      pop.classList.toggle('open');
      if (inIframe) btn.classList.toggle('hidden', pop.classList.contains('open'));
      if (!wasOpen) trackEvent('click');
    };

    // Close button handler (minimize)
    pop.querySelector('#wj-close').onclick = function() {
      pop.classList.remove('open');
      if (inIframe) btn.classList.remove('hidden');
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
      pop.classList.remove('open');
      chatView.classList.remove('open');
      homeView.classList.remove('hidden');
      if (inIframe) btn.classList.remove('hidden');
      stopPolling();
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
    var emojiPicker = chatView.querySelector('#wj-emoji-picker');

    // Generate or retrieve visitor ID
    var visitorId = localStorage.getItem('wj_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('wj_visitor_id', visitorId);
    }

    // Retrieve visitor token (server-generated, proves ownership of visitor session)
    var visitorToken = localStorage.getItem('wj_visitor_token') || '';

    // Track last message ID for polling
    var lastMessageId = null;
    var pollInterval = null;
    var renderedMessageIds = {};

    // Update send button style based on input
    function updateSendButton() {
      if (chatInput && chatSendBtn) {
        if (chatInput.value.trim()) {
          chatSendBtn.classList.add('active');
        } else {
          chatSendBtn.classList.remove('active');
        }
      }
    }

    // Render a message bubble
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
        bubble.innerHTML = '<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#a855f7);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" style="width:12px;height:12px"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div><div style="padding:12px 16px;border-radius:16px;background:linear-gradient(135deg,#8b5cf6,#a855f7);color:#fff;font-size:14px;max-width:70%">' + esc(msg.content) + '</div>';
      }
      chatMsgs.appendChild(bubble);
      lastMessageId = msg.id;
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    // Poll for new messages
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

    // Start polling when chat view opens
    function startPolling() {
      if (pollInterval) return;
      pollMessages(); // Initial fetch
      pollInterval = setInterval(pollMessages, 3000); // Poll every 3 seconds
    }

    // Stop polling when chat view closes
    function stopPolling() {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }

    function sendMessage() {
      if (!chatInput) return;
      var msg = chatInput.value.trim();
      if (!msg) return;
      
      // Create temporary message object
      var tempId = 'temp_' + Date.now();
      var tempMsg = { id: tempId, sender_type: 'visitor', content: msg };
      renderMessage(tempMsg);
      
      // Clear input and update button
      chatInput.value = '';
      updateSendButton();
      if (emojiPicker) emojiPicker.classList.remove('open');

      // Send message to backend
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

    // Send on button click
    if (chatSendBtn) {
      chatSendBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendMessage();
      };
    }

    // Send on Enter key and update button on input
    if (chatInput) {
      chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });
      chatInput.addEventListener('input', updateSendButton);
    }

    // Emoji picker toggle
    if (chatEmojiBtn && emojiPicker) {
      chatEmojiBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        emojiPicker.classList.toggle('open');
      };
    }

    // Emoji selection
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
