const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/javascript",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
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
  
  // Support widgetId from query string (for Shopify ScriptTag)
  if (!c.widgetId) {
    try {
      var scripts = d.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src || '';
        if (src.indexOf('widget-loader') !== -1) {
          var match = src.match(/[?&]widgetId=([^&]+)/);
          if (match) { c.widgetId = match[1]; w.__wj = c; break; }
        }
      }
    } catch(e) {}
  }
  
  var id = c.widgetId;
  
  if (!id) {
    console.error('[Widjet] No widget ID');
    return;
  }

  function esc(s) {
    if (!s) return '';
    var el = d.createElement('div');
    el.textContent = s;
    return el.innerHTML;
  }

  if (w.__wj_loaded) return;
  w.__wj_loaded = true;

  // Detect visitor country, region (continent), city from client side
  var visitorCountry = '';
  var visitorRegion = '';
  var visitorCity = '';

  // Country code to continent mapping
  var continentMap = {
    AF:'Africa',AO:'Africa',BJ:'Africa',BW:'Africa',BF:'Africa',BI:'Africa',CV:'Africa',CM:'Africa',CF:'Africa',TD:'Africa',KM:'Africa',CD:'Africa',CG:'Africa',CI:'Africa',DJ:'Africa',EG:'Africa',GQ:'Africa',ER:'Africa',SZ:'Africa',ET:'Africa',GA:'Africa',GM:'Africa',GH:'Africa',GN:'Africa',GW:'Africa',KE:'Africa',LS:'Africa',LR:'Africa',LY:'Africa',MG:'Africa',MW:'Africa',ML:'Africa',MR:'Africa',MU:'Africa',MA:'Africa',MZ:'Africa',NA:'Africa',NE:'Africa',NG:'Africa',RW:'Africa',ST:'Africa',SN:'Africa',SC:'Africa',SL:'Africa',SO:'Africa',ZA:'Africa',SS:'Africa',SD:'Africa',TZ:'Africa',TG:'Africa',TN:'Africa',UG:'Africa',ZM:'Africa',ZW:'Africa',
    AG:'Americas',AR:'Americas',BS:'Americas',BB:'Americas',BZ:'Americas',BO:'Americas',BR:'Americas',CA:'Americas',CL:'Americas',CO:'Americas',CR:'Americas',CU:'Americas',DM:'Americas',DO:'Americas',EC:'Americas',SV:'Americas',GD:'Americas',GT:'Americas',GY:'Americas',HT:'Americas',HN:'Americas',JM:'Americas',MX:'Americas',NI:'Americas',PA:'Americas',PY:'Americas',PE:'Americas',KN:'Americas',LC:'Americas',VC:'Americas',SR:'Americas',TT:'Americas',US:'Americas',UY:'Americas',VE:'Americas',
    AM:'Asia',AZ:'Asia',BH:'Asia',BD:'Asia',BT:'Asia',BN:'Asia',KH:'Asia',CN:'Asia',CY:'Asia',GE:'Asia',IN:'Asia',ID:'Asia',IR:'Asia',IQ:'Asia',IL:'Asia',JP:'Asia',JO:'Asia',KZ:'Asia',KW:'Asia',KG:'Asia',LA:'Asia',LB:'Asia',MY:'Asia',MV:'Asia',MN:'Asia',MM:'Asia',NP:'Asia',KP:'Asia',OM:'Asia',PK:'Asia',PS:'Asia',PH:'Asia',QA:'Asia',SA:'Asia',SG:'Asia',KR:'Asia',LK:'Asia',SY:'Asia',TW:'Asia',TJ:'Asia',TH:'Asia',TL:'Asia',TR:'Asia',TM:'Asia',AE:'Asia',UZ:'Asia',VN:'Asia',YE:'Asia',
    AL:'Europe',AD:'Europe',AT:'Europe',BY:'Europe',BE:'Europe',BA:'Europe',BG:'Europe',HR:'Europe',CZ:'Europe',DK:'Europe',EE:'Europe',FI:'Europe',FR:'Europe',DE:'Europe',GR:'Europe',HU:'Europe',IS:'Europe',IE:'Europe',IT:'Europe',XK:'Europe',LV:'Europe',LI:'Europe',LT:'Europe',LU:'Europe',MT:'Europe',MD:'Europe',MC:'Europe',ME:'Europe',NL:'Europe',MK:'Europe',NO:'Europe',PL:'Europe',PT:'Europe',RO:'Europe',RU:'Europe',SM:'Europe',RS:'Europe',SK:'Europe',SI:'Europe',ES:'Europe',SE:'Europe',CH:'Europe',UA:'Europe',GB:'Europe',VA:'Europe',
    AU:'Oceania',FJ:'Oceania',KI:'Oceania',MH:'Oceania',FM:'Oceania',NR:'Oceania',NZ:'Oceania',PW:'Oceania',PG:'Oceania',WS:'Oceania',SB:'Oceania',TO:'Oceania',TV:'Oceania',VU:'Oceania',
    AQ:'Antarctica'
  };

  try {
    var geoXhr = new XMLHttpRequest();
    geoXhr.open('GET', 'https://ipapi.co/json/', true);
    geoXhr.timeout = 3000;
    geoXhr.onreadystatechange = function() {
      if (geoXhr.readyState !== 4) return;
      if (geoXhr.status === 200) {
        try {
          var geo = JSON.parse(geoXhr.responseText);
          if (geo.country_name && geo.country_name !== 'Undefined') visitorCountry = geo.country_name;
          if (geo.country_code && continentMap[geo.country_code]) visitorRegion = continentMap[geo.country_code];
          if (geo.city) visitorCity = geo.city;
        } catch(e) {}
      }
    };
    geoXhr.send();
  } catch(e) {}

  // Detect browser and system
  var visitorBrowser = '';
  var visitorSystem = '';
  try {
    var ua = navigator.userAgent || '';
    if (ua.indexOf('Firefox') > -1) visitorBrowser = 'Firefox';
    else if (ua.indexOf('Edg/') > -1) visitorBrowser = 'Edge';
    else if (ua.indexOf('OPR') > -1 || ua.indexOf('Opera') > -1) visitorBrowser = 'Opera';
    else if (ua.indexOf('Chrome') > -1) visitorBrowser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) visitorBrowser = 'Mobile Safari';
    else visitorBrowser = 'Other';

    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) visitorSystem = 'iOS';
    else if (ua.indexOf('Android') > -1) visitorSystem = 'Android';
    else if (ua.indexOf('Mac OS') > -1) visitorSystem = 'macOS';
    else if (ua.indexOf('Windows') > -1) visitorSystem = 'Windows';
    else if (ua.indexOf('Linux') > -1) visitorSystem = 'Linux';
    else visitorSystem = 'Other';
  } catch(e) {}

  console.log('[Widjet] Script loaded, fetching config...');

  // Track loader_boot event immediately
  try {
    var bootXhr = new XMLHttpRequest();
    bootXhr.open('POST', u + '/functions/v1/track-widget-event', true);
    bootXhr.setRequestHeader('Content-Type', 'application/json');
    bootXhr.send(JSON.stringify({ widget_id: id, event_type: 'loader_boot', page_url: w.location.href }));
  } catch(e) {}

  var x = new XMLHttpRequest();
  x.open('GET', u + '/functions/v1/widget-config?id=' + id, true);
  x.onreadystatechange = function() {
    if (x.readyState !== 4) return;
    if (x.status !== 200) {
      console.error('[Widjet] Load failed, status:', x.status);
      return;
    }
    var cfg;
    try {
      cfg = JSON.parse(x.responseText);
    } catch(e) {
      console.error('[Widjet] JSON parse error:', e.message);
      return;
    }
    if (cfg.error) {
      console.error('[Widjet]', cfg.error);
      return;
    }
    console.log('[Widjet] Config loaded, rendering...');
    try {
      render(cfg);
      console.log('[Widjet] Render complete');
    } catch(e) {
      console.error('[Widjet] Render error:', e.message, e.stack);
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
    // Detect if widget color is light → use dark text on buttons
    var cbgHex = color.bg.replace('#','');
    var cR = parseInt(cbgHex.substr(0,2),16), cG = parseInt(cbgHex.substr(2,2),16), cB = parseInt(cbgHex.substr(4,2),16);
    var luminance = (0.299*cR + 0.587*cG + 0.114*cB) / 255;
    var btnText = luminance > 0.6 ? '#1e293b' : '#fff';
    var dark = cfg.widget_theme === 'dark';
    var lt = !dark;
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
    var productCarouselEnabled = cfg.product_carousel_enabled !== false;
    var shopifyDomain = cfg.shopify_store_domain || '';
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
     var ctaText = cfg.cta_text || '';
     var inspireEnabled = cfg.inspire_enabled || false;
     var inspireVideos = cfg.inspire_videos || [];
     var homeSectionOrder = cfg.home_section_order || ['product-carousel', 'faq', 'custom-links', 'inspire-me'];
     var voiceEnabled = cfg.voice_enabled || false;
     var customChips = cfg.custom_chips;
     var chipLabels = (Array.isArray(customChips) && customChips.length >= 3) ? customChips : [tr.chipFind, tr.chipTrack, tr.chipInfo];

     var t = {
      en: { contactUs: 'Contact us', show: 'Show', quickAnswers: 'Quick answers', home: 'Home', contact: 'Contact', followIg: 'Follow us on Instagram', welcomeMessage: 'Welcome! How can I help you?', writeMessage: 'Write a message...', contactWhatsApp: 'Contact us on WhatsApp', chipFind: 'Find the right product for me', chipTrack: 'Track my order', chipInfo: 'I need more information' },
      es: { contactUs: 'Contáctanos', show: 'Ver', quickAnswers: 'Respuestas rápidas', home: 'Inicio', contact: 'Contacto', followIg: 'Síguenos en Instagram', welcomeMessage: '¡Bienvenido/a! ¿Cómo puedo ayudarte?', writeMessage: 'Escribe un mensaje...', contactWhatsApp: 'Contáctanos por WhatsApp', chipFind: 'Encontrar el producto adecuado', chipTrack: 'Rastrear mi pedido', chipInfo: 'Necesito más información' },
      de: { contactUs: 'Kontakt', show: 'Zeigen', quickAnswers: 'Schnelle Antworten', home: 'Home', contact: 'Kontakt', followIg: 'Folge uns auf Instagram', welcomeMessage: 'Willkommen! Wie kann ich Ihnen helfen?', writeMessage: 'Nachricht schreiben...', contactWhatsApp: 'Kontaktieren Sie uns über WhatsApp', chipFind: 'Das richtige Produkt finden', chipTrack: 'Meine Bestellung verfolgen', chipInfo: 'Ich brauche mehr Informationen' },
      fr: { contactUs: 'Contactez-nous', show: 'Voir', quickAnswers: 'Réponses rapides', home: 'Accueil', contact: 'Contact', followIg: 'Suivez-nous sur Instagram', welcomeMessage: 'Bienvenue ! Comment puis-je vous aider ?', writeMessage: 'Écrivez un message...', contactWhatsApp: 'Contactez-nous sur WhatsApp', chipFind: 'Trouver le bon produit', chipTrack: 'Suivre ma commande', chipInfo: "J'ai besoin de plus d'informations" },
      it: { contactUs: 'Contattaci', show: 'Mostra', quickAnswers: 'Risposte rapide', home: 'Home', contact: 'Contatto', followIg: 'Seguici su Instagram', welcomeMessage: 'Benvenuto/a! In che modo posso esserti utile?', writeMessage: 'Scrivi un messaggio...', contactWhatsApp: 'Contattaci su WhatsApp', chipFind: 'Cercare il prodotto adatto a me', chipTrack: 'Tracciare il mio ordine', chipInfo: 'Ho bisogno di più informazioni' },
      pt: { contactUs: 'Contacte-nos', show: 'Ver', quickAnswers: 'Respostas rápidas', home: 'Início', contact: 'Contacto', followIg: 'Siga-nos no Instagram', welcomeMessage: 'Bem-vindo/a! Como posso ajudar?', writeMessage: 'Escreva uma mensagem...', contactWhatsApp: 'Contacte-nos no WhatsApp', chipFind: 'Encontrar o produto certo', chipTrack: 'Rastrear meu pedido', chipInfo: 'Preciso de mais informações' },
      pl: { contactUs: 'Kontakt', show: 'Pokaż', quickAnswers: 'Szybkie odpowiedzi', home: 'Strona główna', contact: 'Kontakt', followIg: 'Obserwuj nas na Instagramie', welcomeMessage: 'Witamy! Jak mogę pomóc?', writeMessage: 'Napisz wiadomość...', contactWhatsApp: 'Skontaktuj się z nami przez WhatsApp', chipFind: 'Znajdź odpowiedni produkt', chipTrack: 'Śledzić moje zamówienie', chipInfo: 'Potrzebuję więcej informacji' }
    };
    var tr = t[lang] || t.en;

    var bgMain = dark ? '#000' : '#f8f8f8';
    var bgCard = dark ? 'rgba(51,65,85,0.5)' : '#fff';
    var bgFaq = dark ? '#252525' : '#fff';
    var textMain = dark ? '#fff' : '#0f172a';
    var textSub = dark ? 'rgba(255,255,255,0.6)' : '#64748b';
    var logoUrl = 'https://jqvcafbrccpmygiihyry.supabase.co/storage/v1/object/public/brand-assets/widjet-logo-navbar.png';
    var poweredHtml = '<a href="https://getwidjet.com" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:4px;color:inherit;text-decoration:none;">Powered by <img src="' + logoUrl + '" alt="Widjet"/></a>';

    var inspireView = d.createElement('div');
    inspireView.id = 'wj-inspire-view';
    inspireView.style.display = 'none';


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
      #wj-pop{display:none;width:calc(100% - 24px);max-width:380px;height:calc(100% - 24px);max-height:660px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;background:\${bgMain};z-index:2147483647;pointer-events:auto;transform:translateZ(0)}
      #wj-pop.open{display:flex;flex-direction:column;animation:wj-expand .35s cubic-bezier(0.16,1,0.3,1)}
      #wj-pop.closing{display:flex;flex-direction:column;animation:wj-collapse .3s cubic-bezier(0.4,0,0.2,1) forwards}
       @keyframes wj-expand{0%{opacity:0}100%{opacity:1}}
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
      #wj-contact{margin:\${solid ? '16px 0 0 0' : '0 16px'};padding:16px 16px 8px 16px;border-radius:12px;position:relative;z-index:1;background:\${solid ? 'rgba(30,41,59,0.9)' : bgCard}}
      #wj-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0}
      #wj-cname{font-size:12px;color:\${solid ? 'rgba(255,255,255,0.6)' : textSub}}
      #wj-chelp{font-size:14px;color:\${solid ? '#fff' : textMain}}
      #wj-cbtn{width:100%;margin-top:12px;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:\${btnText};font-size:14px;font-weight:500;cursor:pointer}
      #wj-cbtn:hover{background:\${color.hover}}
      #wj-whatsapp{width:100%;margin-top:8px;padding:10px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'};border-radius:8px;background:transparent;color:\${solid ? '#fff' : textMain};font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
      #wj-whatsapp:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      #wj-whatsapp svg{width:20px;height:20px}
      #wj-products{padding:16px 16px 0 16px;display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;margin-top:16px}
      #wj-products::-webkit-scrollbar{display:none}
      .wj-prod{flex-shrink:0;width:calc(100% - 48px);border-radius:16px;overflow:hidden;background:\${dark ? '#1e293b' : '#fff'}}
      .wj-prod-img{aspect-ratio:4/3;background:\${dark ? '#cbd5e1' : '#e2e8f0'};display:flex;align-items:center;justify-content:center}
      .wj-prod-img img{width:100%;height:100%;object-fit:cover}
      .wj-prod-info{padding:16px}
      .wj-prod-price{font-size:16px;color:\${textMain}}
      .wj-prod-old{font-size:14px;color:\${textSub};text-decoration:line-through;margin-left:8px}
      .wj-prod-title{font-weight:700;font-size:16px;color:\${textMain}}
      .wj-prod-sub{font-size:14px;color:\${textSub};margin-top:2px;margin-bottom:12px}
      .wj-prod-actions{display:flex;gap:6px;align-items:stretch}
      .wj-prod-btn{flex:1;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;display:block;text-align:center;box-sizing:border-box}
      .wj-prod-btn:hover{background:\${color.hover}}
      .wj-prod-cart-btn{display:flex;align-items:center;justify-content:center;width:40px;border:none;border-radius:8px;background:\${lt?'#f1f5f9':'rgba(255,255,255,0.1)'};color:\${lt?'#475569':'rgba(255,255,255,0.7)'};cursor:pointer;transition:background 0.15s}
      .wj-prod-cart-btn:hover{background:\${lt?'#e2e8f0':'rgba(255,255,255,0.2)'}}
      #wj-ig{padding:0 16px 16px;margin-top:8px}
      #wj-ig-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
      #wj-ig-head svg{width:16px;height:16px;color:#ec4899}
      #wj-ig-head span{font-size:14px;font-weight:500;color:\${textMain}}
      #wj-ig-list{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
      #wj-ig-list::-webkit-scrollbar{display:none}
      .wj-ig-item{width:80px;height:80px;flex-shrink:0;border-radius:8px;overflow:hidden;background:\${dark ? '#374151' : '#e2e8f0'}}
      .wj-ig-item img{width:100%;height:100%;object-fit:cover}
      #wj-faq{padding:0 16px 0;margin-top:16px}
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
      #wj-links{padding:0 16px 0;margin-top:16px}
      #wj-greview{padding:0 16px 16px}
      #wj-greview-box{border-radius:16px;padding:16px;background:\${bgFaq};cursor:pointer;transition:background .15s}
      #wj-greview-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-greview-stars{display:flex;align-items:center;gap:2px}
      #wj-inspire-section{padding:0 16px 0;margin-top:16px}
      #wj-inspire-box{display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;background:\${bgFaq};cursor:pointer;transition:background .15s;overflow:hidden}
      #wj-inspire-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-inspire-box video{width:72px;height:96px;border-radius:12px;object-fit:cover;flex-shrink:0}
      #wj-inspire-box-right{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
      #wj-inspire-box-title{font-size:15px;font-weight:600;color:\${textMain}}
      #wj-inspire-box-sub{font-size:12px;color:\${textSub}}
      #wj-inspire-box-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1.5px solid \${color.bg};background:transparent;color:\${color.bg};font-size:13px;font-weight:500;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap;align-self:flex-start}
      #wj-inspire-box-btn:hover{background:\${color.bg};color:\${btnText}}
      .wj-star{width:20px;height:20px;position:relative}
      .wj-star svg{position:absolute;inset:0;width:20px;height:20px}
      .wj-star-empty{color:\${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}}
      .wj-star-fill{color:\${dark ? '#fff' : '#0f172a'}}
      .wj-star-clip{position:absolute;inset:0;overflow:hidden}
      .wj-link-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:8px;border-radius:12px;background:\${dark ? '#1e293b' : '#fff'};text-decoration:none;transition:background .15s}
      .wj-link-item:hover{background:\${dark ? '#334155' : '#f1f5f9'}}
      .wj-link-item:last-child{margin-bottom:0}
      .wj-link-name{font-size:14px;font-weight:500;color:\${textMain}}
      .wj-link-arrow{width:28px;height:28px;border-radius:50%;background:\${color.bg};display:flex;align-items:center;justify-content:center}
      .wj-link-arrow svg{width:14px;height:14px;color:\${btnText}}
      #wj-footer{padding:12px 16px 4px;background:\${bgMain}}
      #wj-nav{display:flex;border-radius:16px;background:\${dark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.7)'};backdrop-filter:blur(8px)}
      .wj-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border:none;background:transparent;cursor:pointer;color:\${textMain};font-size:12px}
      .wj-nav-item.inactive{color:\${textSub}}
      .wj-nav-item svg{width:20px;height:20px}
      #wj-powered{display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;font-size:10px;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'};background:\${bgMain}}
      #wj-powered img{height:16px;width:auto;margin-left:-6px;\${dark ? 'opacity:0.3;filter:invert(1)' : 'opacity:0.4'}}
      #wj-home-view{display:flex;flex-direction:column;flex:1;min-height:0}
      #wj-chat-view{display:none;flex-direction:column;flex:1;min-height:0;background:\${dark ? '#000' : '#fff'}}
      #wj-chat-view.open{display:flex}
      #wj-home-view.hidden{display:none}
      #wj-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;}
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
      #wj-chat-chips{display:flex;flex-direction:column;align-items:flex-end;gap:8px;margin-top:12px}
      .wj-chat-chip{padding:10px 16px;border-radius:20px;border:1px solid \${dark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'};background:\${dark ? 'rgba(255,255,255,0.05)' : '#fff'};color:\${dark ? '#fff' : '#334155'};font-size:14px;font-weight:400;cursor:pointer;transition:all 0.15s;text-align:center;white-space:nowrap}
      .wj-chat-chip:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};border-color:\${dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1'}}
      .wj-discovery-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;width:100%;box-sizing:border-box}
      .wj-discovery-chip{display:inline-flex;flex-direction:row;gap:4px;align-items:center;justify-content:center;box-sizing:border-box;margin:0;padding:6px 10px;border-radius:20px;border:1px solid \${dark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'};background:\${dark ? 'rgba(255,255,255,0.05)' : '#fff'};color:\${dark ? '#fff' : '#334155'};font-size:11px;font-weight:400;line-height:1.4;letter-spacing:normal;text-transform:none;text-align:center;white-space:nowrap;cursor:pointer;transition:all 0.15s;appearance:none;text-decoration:none;overflow:visible}
      .wj-discovery-chip:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};border-color:\${dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1'}}
      .wj-chip-emoji{flex-shrink:0;font-style:normal;line-height:1}
      .wj-chip-label{line-height:1.3;white-space:nowrap}
      .wj-prod-wrap{position:relative}
      .wj-prod-arrow{position:absolute;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:#fff;border:1px solid #e5e7eb;box-shadow:0 2px 6px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.2s;z-index:10}
      .wj-prod-wrap:hover .wj-prod-arrow{opacity:1}
      .wj-prod-arrow-left{left:4px}
      .wj-prod-arrow-right{right:4px}
      #wj-chat-input{position:relative;padding:16px}
      #wj-chat-input-box{display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:24px;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};background:\${dark ? '#111' : '#fff'}}
      #wj-chat-input-box input{flex:1;border:none;background:transparent;font-size:14px;color:\${dark ? '#fff' : '#0f172a'};outline:none}
      #wj-chat-input-box input::placeholder{color:\${dark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}}
      #wj-chat-emoji,#wj-chat-mic,#wj-chat-send{width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-mic.listening{background:\${color.bg};color:#fff;animation:wj-pulse 1.5s ease-in-out infinite}
      @keyframes wj-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      #wj-voice-btn{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:\${color.bg};transition:transform .2s;flex-shrink:0}
      #wj-voice-btn:hover{transform:scale(1.05)}
      #wj-voice-btn svg{width:20px;height:20px}
      #wj-voice-view{display:none;flex-direction:column;align-items:center;justify-content:space-between;position:absolute;inset:0;z-index:100;background:#ededee;overflow:hidden}
      #wj-voice-view.open{display:flex}
      #wj-voice-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.8);color:#6b7280;transition:color .15s;z-index:2;box-shadow:0 1px 2px rgba(0,0,0,0.05)}
      #wj-voice-close:hover{color:#374151}
      #wj-voice-close svg{width:20px;height:20px}
      #wj-voice-blob-wrap{width:200px;height:200px;margin-top:auto;margin-bottom:auto;position:relative;border-radius:50%;overflow:hidden;transition:transform 0.4s ease}
      #wj-voice-blob-wrap.has-products{transform:translateY(-60px)}
     #wj-voice-products{display:none;gap:10px;padding:0 16px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none;position:absolute;bottom:160px;left:0;right:0;z-index:10;opacity:0;transform:translateY(20px);transition:opacity 0.4s ease,transform 0.4s ease}
     #wj-voice-products.visible{display:flex;opacity:1;transform:translateY(0)}
     #wj-voice-products::-webkit-scrollbar{display:none}
     #wj-voice-chips{display:none;flex-wrap:wrap;justify-content:center;gap:8px;padding:0 20px;position:absolute;bottom:170px;left:0;right:0;z-index:10;opacity:0;transform:translateY(12px);transition:opacity 0.35s ease,transform 0.35s ease}
     #wj-voice-chips.visible{display:flex;opacity:1;transform:translateY(0)}
     .wj-voice-chip{border:none;cursor:pointer;padding:10px 18px;border-radius:20px;font-size:13px;font-weight:500;color:#374151;background:rgba(255,255,255,0.85);backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:background 0.15s,transform 0.15s}
     .wj-voice-chip:hover{background:#fff;transform:scale(1.04)}
     .wj-voice-chip:active{transform:scale(0.97)}
      .wj-voice-prod-card{flex-shrink:0;width:120px;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
      .wj-voice-prod-card img{width:100%;aspect-ratio:1/1;object-fit:cover}
      .wj-voice-prod-card .wj-vpc-title{font-size:10px;padding:4px 8px 2px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#374151;font-weight:500}
      .wj-voice-prod-card .wj-vpc-price{font-size:11px;font-weight:700;padding:0 8px 6px;margin:0;color:#111}
      #wj-voice-blob-video{width:140%;height:140%;object-fit:cover;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1;background:transparent}
      #wj-voice-bottom{display:flex;flex-direction:column;align-items:center;padding-bottom:12px}
      #wj-voice-status{font-size:16px;font-weight:500;color:#6b7280;background:rgba(255,255,255,0.7);padding:6px 20px;border-radius:20px;backdrop-filter:blur(8px)}
      #wj-voice-transcript{margin-top:6px;font-size:13px;color:#9ca3af;max-width:80%;text-align:center;min-height:18px}
      #wj-voice-controls{display:flex;gap:24px;margin-top:16px}
      #wj-voice-stop{width:56px;height:56px;border-radius:50%;border:2px solid #e5e7eb;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#fff;color:#374151;transition:all .15s;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
      #wj-voice-stop:hover{background:#f3f4f6}
      #wj-voice-stop svg{width:22px;height:22px}
      #wj-voice-mute{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:#ef4444;color:#fff;transition:all .15s;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
      #wj-voice-mute:hover{background:#dc2626}
      #wj-voice-mute.muted{background:#6b7280}
      #wj-voice-mute svg{width:22px;height:22px}
      #wj-voice-powered{margin-top:12px;display:flex;align-items:center;justify-content:center;gap:4px;font-size:10px;color:#94a3b8}
      #wj-voice-powered img{height:16px;width:auto;margin-left:-6px;opacity:0.4}
      @-webkit-keyframes wj-dot-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
      @keyframes wj-dot-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
      #wj-typing{display:flex;align-items:flex-start;gap:12px;margin-top:12px}
      #wj-typing-avatar{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      #wj-typing-dots{padding:10px 16px;border-radius:16px;display:flex;gap:4px;align-items:center}
      #wj-typing-dots .wj-dot{width:8px;height:8px;border-radius:9999px;background:rgba(255,255,255,0.6);display:inline-block;will-change:transform;-webkit-animation:wj-dot-bounce 1s infinite;animation:wj-dot-bounce 1s infinite}
      #wj-typing-dots .wj-dot:nth-child(2){animation-delay:0.15s;-webkit-animation-delay:0.15s}
      #wj-typing-dots .wj-dot:nth-child(3){animation-delay:0.3s;-webkit-animation-delay:0.3s}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff}
      #wj-chat-emoji svg,#wj-chat-mic svg,#wj-chat-send svg{width:20px;height:20px}
      #wj-emoji-picker{display:none;position:absolute;bottom:100%;left:16px;right:16px;margin-bottom:8px;padding:12px;border-radius:12px;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15)}
      #wj-emoji-picker.open{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
      .wj-emoji{border:none;background:transparent;font-size:16px;cursor:pointer;padding:4px;border-radius:4px;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{display:flex;align-items:center;justify-content:center;gap:4px;padding:8px;font-size:10px;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'};border-top:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}}
      #wj-chat-powered img{height:16px;width:auto;margin-left:-6px;\${dark ? 'opacity:0.3;filter:invert(1)' : 'opacity:0.4'}}
      .wj-feedback{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;padding-right:4px}
      .wj-feedback-btn{width:36px;height:36px;border-radius:50%;border:1.5px solid \${dark ? 'rgba(255,255,255,0.2)' : color.bg + '44'};background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s;padding:0}
      .wj-feedback-btn:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : color.bg + '15'};border-color:\${color.bg}}
      .wj-feedback-btn.selected{background:\${color.bg + '22'};border-color:\${color.bg}}
    \` : \`
      #wj-root{position:fixed !important;bottom:20px !important;\${cfg.widget_position === 'left' ? 'left' : 'right'}:20px;z-index:2147483647 !important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important}
      #wj-btn{width:56px !important;height:56px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;color:#fff !important;box-shadow:0 4px 12px rgba(0,0,0,.15) !important;transition:transform .2s,box-shadow .2s,opacity .2s;background:\${color.bg};overflow:hidden !important}
      #wj-btn:hover{transform:scale(1.05) !important;box-shadow:0 6px 16px rgba(0,0,0,.2) !important}
      #wj-btn.hidden{opacity:0 !important;pointer-events:none !important;transform:scale(0.5) !important}
      #wj-btn.pop{animation:wj-btn-pop .4s cubic-bezier(0.34,1.56,0.64,1)}
      #wj-btn svg{width:24px !important;height:24px !important}
      #wj-btn img{width:100% !important;height:100% !important;object-fit:cover !important}
      #wj-pop{display:none !important;position:absolute !important;bottom:0 !important;\${cfg.widget_position === 'left' ? 'left' : 'right'}:0;width:380px !important;height:660px !important;border-radius:16px !important;box-shadow:0 10px 40px rgba(0,0,0,.2) !important;overflow:hidden !important;background:\${bgMain};z-index:2147483647 !important;transform:translateZ(0) !important}
      #wj-pop.open{display:flex !important;flex-direction:column !important;animation:wj-expand .35s cubic-bezier(0.16,1,0.3,1)}
      #wj-pop.closing{display:flex !important;flex-direction:column !important;animation:wj-collapse .3s cubic-bezier(0.4,0,0.2,1) forwards}
      @keyframes wj-expand{0%{opacity:0}100%{opacity:1 !important}}
      @keyframes wj-collapse{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0 !important;transform:scale(0.85) translateY(16px) !important}}
      @keyframes wj-btn-pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1) !important;opacity:1 !important}100%{transform:scale(1) !important}}
      #wj-scroll{flex:1 !important;overflow-y:auto !important;position:relative !important;border-radius:inherit !important;background:\${bgMain}}
      #wj-gradient-overlay{display:none !important}
      \${gradient ? '#wj-gradient-overlay{display:block !important;position:absolute !important;top:0 !important;left:0 !important;right:0 !important;height:256px !important;pointer-events:none !important;z-index:0 !important;background:linear-gradient(180deg, '+(dark ? color.bg+'88' : color.bg+'30')+' 0%, '+(dark ? color.bg+'44' : color.bg+'15')+' 45%, transparent 100%) !important}' : ''}
      #wj-head{padding:20px 24px \${solid ? '16px' : '20px'} 24px !important;position:relative !important;z-index:1 !important;\${solid ? 'background:'+color.bg+' !important;color:#fff !important' : ''}\${bgImage ? 'background-image:linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('+bgImage+') !important;background-size:cover !important;background-position:center !important;color:#fff !important' : ''}}
      #wj-hello{font-size:24px !important;font-weight:700 !important;max-width:70% !important;word-break:break-word !important;white-space:pre-line !important;color:\${(solid || bgImage) ? '#fff' : textMain}}
      #wj-close{position:absolute !important;right:16px !important;top:16px !important;background:none !important;border:none !important;cursor:pointer !important;opacity:0.7 !important;padding:4px !important}
      #wj-close:hover{opacity:1 !important}
      #wj-close svg{width:16px !important;height:16px !important;stroke:\${(solid || bgImage) ? '#fff' : textSub}}
      #wj-contact{margin:\${solid ? '16px 0 0 0' : '0 16px'};padding:16px 16px 8px 16px !important;border-radius:12px !important;position:relative !important;z-index:1 !important;background:\${solid ? 'rgba(30,41,59,0.9)' : bgCard}}
      #wj-avatar{width:40px !important;height:40px !important;border-radius:50% !important;object-fit:cover !important;background:#0f172a !important;display:flex !important;align-items:center !important;justify-content:center !important;color:#fff !important;font-weight:700 !important;font-size:14px !important;flex-shrink:0 !important}
      #wj-cname{font-size:12px !important;color:\${solid ? 'rgba(255,255,255,0.6)' : textSub}}
      #wj-chelp{font-size:14px !important;color:\${solid ? '#fff' : textMain}}
      #wj-pop #wj-cbtn{width:100% !important;margin-top:12px !important;padding:10px !important;border:none !important;border-radius:8px !important;background:\${color.bg} !important;color:\${btnText} !important;font-size:14px !important;font-weight:500 !important;cursor:pointer !important;font-family:inherit !important;line-height:1.5 !important;letter-spacing:normal !important;text-transform:none !important;text-align:center !important;-webkit-appearance:none !important;appearance:none !important;outline:none !important;box-shadow:none !important}
      #wj-pop #wj-cbtn:hover{background:\${color.hover} !important}
      #wj-whatsapp{width:100% !important;margin-top:8px !important;padding:10px !important;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'} !important;border-radius:8px !important;background:transparent !important;color:\${solid ? '#fff' : textMain} !important;font-size:14px !important;font-weight:500 !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:8px !important;font-family:inherit !important;line-height:1.5 !important;letter-spacing:normal !important;text-transform:none !important}
      #wj-whatsapp:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} !important}
      #wj-whatsapp svg{width:20px !important;height:20px !important}
      #wj-products{padding:16px !important;display:flex !important;gap:12px !important;overflow-x:auto !important;scrollbar-width:none !important;-ms-overflow-style:none !important;margin-top:8px !important}
      #wj-products::-webkit-scrollbar{display:none !important}
      .wj-prod{flex-shrink:0 !important;width:calc(100% - 48px) !important;border-radius:16px !important;overflow:hidden !important;background:\${dark ? '#1e293b' : '#fff'}}
      .wj-prod-img{aspect-ratio:4/3 !important;background:\${dark ? '#cbd5e1' : '#e2e8f0'};display:flex !important;align-items:center !important;justify-content:center !important}
      .wj-prod-img img{width:100% !important;height:100% !important;object-fit:cover !important}
      .wj-prod-info{padding:16px !important}
      .wj-prod-price{font-size:16px !important;color:\${textMain}}
      .wj-prod-old{font-size:14px !important;color:\${textSub};text-decoration:line-through !important;margin-left:8px !important}
      .wj-prod-title{font-weight:700 !important;font-size:16px !important;color:\${textMain}}
      .wj-prod-sub{font-size:14px !important;color:\${textSub};margin-top:2px !important;margin-bottom:12px !important}
      .wj-prod-actions{display:flex !important;gap:6px !important;align-items:stretch !important}
      .wj-prod-btn{flex:1 !important;padding:10px !important;border:none !important;border-radius:8px !important;background:\${color.bg};color:#fff !important;font-size:14px !important;font-weight:500 !important;cursor:pointer !important;text-decoration:none !important;display:block !important;text-align:center !important;box-sizing:border-box !important}
      .wj-prod-btn:hover{background:\${color.hover}}
      .wj-prod-cart-btn{display:flex !important;align-items:center !important;justify-content:center !important;width:40px !important;border:none !important;border-radius:8px !important;background:\${lt?'#f1f5f9':'rgba(255,255,255,0.1)'};color:\${lt?'#475569':'rgba(255,255,255,0.7)'};cursor:pointer !important;transition:background 0.15s}
      .wj-prod-cart-btn:hover{background:\${lt?'#e2e8f0':'rgba(255,255,255,0.2)'}}
      #wj-ig{padding:0 16px 16px !important;margin-top:8px !important}
      #wj-ig-head{display:flex !important;align-items:center !important;gap:8px !important;margin-bottom:8px !important}
      #wj-ig-head svg{width:16px !important;height:16px !important;color:#ec4899 !important}
      #wj-ig-head span{font-size:14px !important;font-weight:500 !important;color:\${textMain}}
      #wj-ig-list{display:flex !important;gap:8px !important;overflow-x:auto !important;scrollbar-width:none !important;-ms-overflow-style:none !important}
      #wj-ig-list::-webkit-scrollbar{display:none !important}
      .wj-ig-item{width:100px !important;height:100px !important;flex-shrink:0 !important;border-radius:8px !important;overflow:hidden !important;background:\${dark ? '#374151' : '#e2e8f0'}}
      .wj-ig-item img{width:100% !important;height:100% !important;object-fit:cover !important}
      #wj-faq{padding:0 16px 16px !important;margin-top:16px !important}
      #wj-faq-box{border-radius:16px !important;padding:16px !important;background:\${bgFaq}}
      #wj-faq-head{display:flex !important;align-items:center !important;gap:8px !important;margin-bottom:12px !important}
      #wj-faq-head svg{width:16px !important;height:16px !important;color:\${textSub}}
      #wj-faq-head span{font-size:14px !important;font-weight:500 !important;color:\${textMain}}
      .wj-faq-item{border-radius:8px !important}
      .wj-faq-q{width:100% !important;display:flex !important;align-items:center !important;justify-content:space-between !important;padding:8px 12px !important;border:none !important;background:transparent !important;cursor:pointer !important;text-align:left !important;font-size:14px !important;font-weight:500 !important;color:\${textMain}}
      .wj-faq-q:hover{background:\${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
      .wj-faq-q svg{width:16px !important;height:16px !important;color:\${textSub};transition:transform .2s}
      .wj-faq-q.open svg{transform:rotate(180deg) !important}
      .wj-faq-a{padding:4px 12px 12px !important;font-size:14px !important;color:\${textSub};display:none !important}
      .wj-faq-a.open{display:block !important}
      #wj-links{padding:0 16px 16px !important;margin-top:8px !important}
      #wj-greview{padding:0 16px 16px !important}
      #wj-greview-box{border-radius:16px !important;padding:16px !important;background:\${bgFaq};cursor:pointer !important;transition:background .15s}
      #wj-greview-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-greview-stars{display:flex !important;align-items:center !important;gap:2px !important}
      #wj-inspire-section{padding:0 16px 16px !important;margin-top:8px !important}
      #wj-inspire-box{display:flex !important;align-items:center !important;gap:14px !important;padding:16px !important;border-radius:16px !important;background:\${bgFaq};cursor:pointer !important;transition:background .15s;overflow:hidden !important}
      #wj-inspire-box:hover{background:\${dark ? '#2a2a2a' : '#f1f5f9'}}
      #wj-inspire-box video{width:72px !important;height:96px !important;border-radius:12px !important;object-fit:cover !important;flex-shrink:0 !important}
      #wj-inspire-box-right{display:flex !important;flex-direction:column !important;gap:6px !important;flex:1 !important;min-width:0 !important}
      #wj-inspire-box-title{font-size:15px !important;font-weight:600 !important;color:\${textMain}}
      #wj-inspire-box-sub{font-size:12px !important;color:\${textSub}}
      #wj-inspire-box-btn{display:inline-flex !important;align-items:center !important;gap:6px !important;padding:8px 16px !important;border-radius:20px !important;border:1.5px solid \${color.bg} !important;background:transparent !important;color:\${color.bg} !important;font-size:13px !important;font-weight:500 !important;cursor:pointer !important;transition:background .15s,color .15s;white-space:nowrap !important;align-self:flex-start !important}
      #wj-inspire-box-btn:hover{background:\${color.bg} !important;color:\${btnText} !important}
      .wj-star{width:20px !important;height:20px !important;position:relative !important}
      .wj-star svg{position:absolute !important;inset:0 !important;width:20px !important;height:20px !important}
      .wj-star-empty{color:\${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}}
      .wj-star-fill{color:\${dark ? '#fff' : '#0f172a'}}
      .wj-star-clip{position:absolute !important;inset:0 !important;overflow:hidden !important}
      .wj-link-item{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:12px 16px !important;margin-bottom:8px !important;border-radius:12px !important;background:\${dark ? '#1e293b' : '#fff'};text-decoration:none !important;transition:background .15s}
      .wj-link-item:hover{background:\${dark ? '#334155' : '#f1f5f9'}}
      .wj-link-item:last-child{margin-bottom:0 !important}
      .wj-link-name{font-size:14px !important;font-weight:500 !important;color:\${textMain}}
      .wj-link-arrow{width:28px !important;height:28px !important;border-radius:50% !important;background:\${color.bg} !important;display:flex !important;align-items:center !important;justify-content:center !important}
      .wj-link-arrow svg{width:14px !important;height:14px !important;color:\${btnText} !important}
      #wj-inspire-view{display:none;flex-direction:column !important;flex:1 !important;min-height:0 !important;background:#000 !important;position:absolute !important;inset:0 !important;z-index:10 !important}
      #wj-inspire-view video{width:100% !important;height:100% !important;object-fit:cover !important}
      #wj-footer{padding:12px 16px 4px !important;background:\${bgMain}}
      #wj-nav{display:flex !important;border-radius:16px !important;background:\${dark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.7)'};backdrop-filter:blur(8px) !important}
      .wj-nav-item{flex:1 !important;display:flex !important;flex-direction:column !important;align-items:center !important;gap:4px !important;padding:12px !important;border:none !important;background:transparent !important;cursor:pointer !important;color:\${textMain};font-size:12px !important}
      .wj-nav-item.inactive{color:\${textSub}}
      .wj-nav-item svg{width:20px !important;height:20px !important}
      #wj-powered{display:flex !important;align-items:center !important;justify-content:center !important;gap:4px !important;padding:8px !important;font-size:10px !important;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'};background:\${bgMain}}
      #wj-powered img{height:16px !important;width:auto !important;margin-left:-6px !important;\${dark ? 'opacity:0.3 !important;filter:invert(1) !important' : 'opacity:0.4 !important'}}
      #wj-home-view{display:flex !important;flex-direction:column !important;flex:1 !important;min-height:0 !important}
      #wj-chat-view{display:none !important;flex-direction:column !important;flex:1 !important;min-height:0 !important;background:\${dark ? '#000' : '#fff'}}
      #wj-chat-view.open{display:flex !important}
      #wj-home-view.hidden{display:none !important}
      #wj-chat-header{display:flex !important;align-items:center !important;justify-content:space-between !important;padding:12px 16px !important;}
      #wj-chat-back,#wj-chat-more,#wj-chat-close{width:32px !important;height:32px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:\${dark ? '#1a1a1a' : '#e2e8f0'};color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-back:hover,#wj-chat-more:hover,#wj-chat-close:hover{background:\${dark ? '#333' : '#cbd5e1'}}
      #wj-chat-back svg,#wj-chat-more svg,#wj-chat-close svg{width:16px !important;height:16px !important}
      #wj-chat-title{display:flex !important;align-items:center !important;gap:10px !important}
      #wj-chat-avatar{width:32px !important;height:32px !important;border-radius:50% !important;background:#000 !important;display:flex !important;align-items:center !important;justify-content:center !important;flex-shrink:0 !important;color:#fff !important;font-size:12px !important;font-weight:700 !important}
      #wj-chat-avatar svg{width:16px !important;height:16px !important;color:#fff !important}
      #wj-chat-title-text{display:flex !important;flex-direction:column !important}
      #wj-chat-name{font-size:14px !important;font-weight:600 !important;line-height:1.2 !important;color:\${dark ? '#fff' : '#0f172a'}}
      #wj-chat-subtitle{font-size:12px !important;line-height:1.2 !important;color:\${dark ? 'rgba(255,255,255,0.5)' : '#64748b'}}
      #wj-chat-header-right{display:flex !important;align-items:center !important;gap:8px !important;position:relative !important}
      #wj-chat-menu{display:none !important;position:absolute !important;right:0 !important;top:40px !important;z-index:50 !important;width:176px !important;border-radius:12px !important;box-shadow:0 4px 12px rgba(0,0,0,0.15) !important;border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};background:\${dark ? '#18181b' : '#fff'};overflow:hidden !important}
      #wj-chat-menu.open{display:block !important}
      .wj-menu-item{display:flex !important;width:100% !important;align-items:center !important;gap:8px !important;padding:10px 12px !important;border:none !important;cursor:pointer !important;font-size:14px !important;white-space:nowrap !important;background:transparent !important;color:\${dark ? '#fff' : '#334155'}}
      .wj-menu-item:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      .wj-menu-item:disabled{opacity:0.4 !important;cursor:not-allowed !important}
      .wj-menu-item svg{width:16px !important;height:16px !important;flex-shrink:0 !important}
      #wj-chat-msgs{flex:1 !important;overflow-y:auto !important;padding:16px !important}
      #wj-chat-bubble{display:flex !important;align-items:flex-start !important;gap:8px !important}
      #wj-chat-bubble-avatar{width:24px !important;height:24px !important;border-radius:50% !important;background:#000 !important;display:flex !important;align-items:center !important;justify-content:center !important;flex-shrink:0 !important;color:#fff !important;font-size:10px !important;font-weight:700 !important}
      #wj-chat-bubble-avatar svg{width:12px !important;height:12px !important;color:#fff !important}
      #wj-chat-bubble-text{padding:12px 16px !important;border-radius:16px !important;background:\${color.bg};color:#fff !important;font-size:14px !important}
      #wj-chat-chips{display:flex;flex-direction:column !important;align-items:flex-end !important;gap:8px !important;margin-top:12px !important}
      .wj-chat-chip{padding:10px 16px !important;border-radius:20px !important;border:1px solid \${dark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'};background:\${dark ? 'rgba(255,255,255,0.05)' : '#fff'};color:\${dark ? '#fff' : '#334155'};font-size:14px !important;font-weight:400 !important;cursor:pointer !important;transition:all 0.15s;text-align:center !important;white-space:nowrap !important}
      .wj-chat-chip:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};border-color:\${dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1'}}
      .wj-discovery-chips{display:flex !important;flex-wrap:wrap !important;gap:5px !important;margin-top:8px !important;width:100% !important;box-sizing:border-box !important;padding:0 !important;margin-bottom:0 !important}
      .wj-discovery-chip{display:inline-flex !important;flex-direction:row !important;gap:4px !important;align-items:center !important;justify-content:center !important;box-sizing:border-box !important;margin:0 !important;padding:6px 10px !important;border-radius:20px !important;border:1px solid \${dark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'} !important;background:\${dark ? 'rgba(255,255,255,0.05)' : '#fff'} !important;color:\${dark ? '#fff' : '#334155'} !important;font-size:11px !important;font-weight:400 !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif !important;line-height:1.4 !important;letter-spacing:normal !important;text-transform:none !important;text-align:center !important;white-space:nowrap !important;cursor:pointer !important;transition:all 0.15s !important;appearance:none !important;-webkit-appearance:none !important;text-decoration:none !important;outline:none !important;height:auto !important;float:none !important;position:static !important;overflow:visible !important}
      .wj-discovery-chip:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'} !important;border-color:\${dark ? 'rgba(255,255,255,0.25)' : '#cbd5e1'} !important}
      .wj-chip-emoji{flex-shrink:0 !important;font-style:normal !important;line-height:1 !important;display:inline !important;float:none !important;margin:0 !important;padding:0 !important}
      .wj-chip-label{line-height:1.3 !important;white-space:nowrap !important;display:inline !important;float:none !important;margin:0 !important;padding:0 !important}
      .wj-prod-wrap{position:relative !important}
      .wj-prod-arrow{position:absolute !important;top:50% !important;transform:translateY(-50%) !important;width:28px !important;height:28px !important;border-radius:50% !important;background:#fff !important;border:1px solid #e5e7eb !important;box-shadow:0 2px 6px rgba(0,0,0,0.12) !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;opacity:0 !important;transition:opacity 0.2s !important;z-index:10 !important}
      .wj-prod-wrap:hover .wj-prod-arrow{opacity:1 !important}
      .wj-prod-arrow-left{left:4px !important}
      .wj-prod-arrow-right{right:4px !important}
      #wj-chat-input{position:relative !important;padding:16px !important}
      #wj-chat-input-box{display:flex !important;align-items:center !important;gap:8px !important;padding:8px 16px !important;border-radius:24px !important;border:1px solid \${dark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'};background:\${dark ? '#111' : '#fff'};transition:border-color .2s}
      #wj-chat-input-box:focus-within{border-color:\${color.bg}}
      #wj-chat-input-box input{flex:1 !important;border:none !important;background:transparent !important;font-size:14px !important;color:\${dark ? '#fff' : '#0f172a'};outline:none !important}
      #wj-chat-input-box input::placeholder{color:\${dark ? 'rgba(255,255,255,0.4)' : '#94a3b8'}}
      #wj-chat-emoji,#wj-chat-mic,#wj-chat-send{width:32px !important;height:32px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:transparent !important;color:\${dark ? 'rgba(255,255,255,0.5)' : '#94a3b8'};transition:all .2s}
      #wj-chat-mic.listening{background:\${color.bg};color:#fff !important;animation:wj-pulse 1.5s ease-in-out infinite}
      @keyframes wj-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      #wj-voice-btn{width:36px !important;height:36px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:\${color.bg} !important;transition:transform .2s;flex-shrink:0 !important}
      #wj-voice-btn:hover{transform:scale(1.05) !important}
      #wj-voice-btn svg{width:20px !important;height:20px !important}
      #wj-voice-view{display:none !important;flex-direction:column !important;align-items:center !important;justify-content:space-between !important;position:absolute !important;inset:0 !important;z-index:100 !important;background:#ededee !important;overflow:hidden !important}
      #wj-voice-view.open{display:flex !important}
      #wj-voice-close{position:absolute !important;top:16px !important;right:16px !important;width:32px !important;height:32px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:rgba(255,255,255,0.8) !important;color:#6b7280 !important;transition:color .15s;z-index:2 !important;box-shadow:0 1px 2px rgba(0,0,0,0.05) !important}
      #wj-voice-close:hover{color:#374151 !important}
      #wj-voice-close svg{width:20px !important;height:20px !important}
      #wj-voice-blob-wrap{width:200px !important;height:200px !important;margin-top:auto !important;margin-bottom:auto !important;position:relative !important;border-radius:50% !important;overflow:hidden !important;transition:transform 0.4s ease !important}
      #wj-voice-blob-wrap.has-products{transform:translateY(-60px) !important}
     #wj-voice-products{display:none !important;gap:10px !important;padding:0 16px !important;overflow-x:auto !important;scrollbar-width:none !important;-ms-overflow-style:none !important;position:absolute !important;bottom:160px !important;left:0 !important;right:0 !important;z-index:10 !important;opacity:0 !important;transform:translateY(20px) !important;transition:opacity 0.4s ease,transform 0.4s ease !important}
     #wj-voice-products.visible{display:flex !important;opacity:1 !important;transform:translateY(0) !important}
     #wj-voice-products::-webkit-scrollbar{display:none !important}
     #wj-voice-chips{display:none !important;flex-wrap:wrap !important;justify-content:center !important;gap:8px !important;padding:0 20px !important;position:absolute !important;bottom:170px !important;left:0 !important;right:0 !important;z-index:10 !important;opacity:0 !important;transform:translateY(12px) !important;transition:opacity 0.35s ease,transform 0.35s ease !important}
     #wj-voice-chips.visible{display:flex !important;opacity:1 !important;transform:translateY(0) !important}
     .wj-voice-chip{border:none !important;cursor:pointer !important;padding:10px 18px !important;border-radius:20px !important;font-size:13px !important;font-weight:500 !important;color:#374151 !important;background:rgba(255,255,255,0.85) !important;backdrop-filter:blur(8px) !important;box-shadow:0 2px 8px rgba(0,0,0,0.08) !important;transition:background 0.15s,transform 0.15s !important}
     .wj-voice-chip:hover{background:#fff !important;transform:scale(1.04) !important}
     .wj-voice-chip:active{transform:scale(0.97) !important}
      .wj-voice-prod-card{flex-shrink:0 !important;width:120px !important;border-radius:12px !important;overflow:hidden !important;display:flex !important;flex-direction:column !important;background:#fff !important;box-shadow:0 2px 8px rgba(0,0,0,0.1) !important}
      .wj-voice-prod-card img{width:100% !important;aspect-ratio:1/1 !important;object-fit:cover !important}
      .wj-voice-prod-card .wj-vpc-title{font-size:10px !important;padding:4px 8px 2px !important;margin:0 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;color:#374151 !important;font-weight:500 !important}
      .wj-voice-prod-card .wj-vpc-price{font-size:11px !important;font-weight:700 !important;padding:0 8px 6px !important;margin:0 !important;color:#111 !important}
      #wj-voice-blob-video{width:140% !important;height:140% !important;object-fit:cover !important;position:absolute !important;top:50% !important;left:50% !important;transform:translate(-50%,-50%) !important;z-index:1 !important;background:transparent !important}
      #wj-voice-bottom{display:flex !important;flex-direction:column !important;align-items:center !important;padding-bottom:12px !important}
      #wj-voice-status{font-size:16px !important;font-weight:500 !important;color:#6b7280 !important;background:rgba(255,255,255,0.7) !important;padding:6px 20px !important;border-radius:20px !important;backdrop-filter:blur(8px) !important}
      #wj-voice-transcript{margin-top:6px !important;font-size:13px !important;color:#9ca3af !important;max-width:80% !important;text-align:center !important;min-height:18px !important}
      #wj-voice-controls{display:flex !important;gap:24px !important;margin-top:16px !important}
      #wj-voice-stop{width:56px !important;height:56px !important;border-radius:50% !important;border:2px solid #e5e7eb !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:#fff !important;color:#374151 !important;transition:all .15s;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1) !important}
      #wj-voice-stop:hover{background:#f3f4f6 !important}
      #wj-voice-stop svg{width:22px !important;height:22px !important}
      #wj-voice-mute{width:56px !important;height:56px !important;border-radius:50% !important;border:none !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important;background:#ef4444 !important;color:#fff !important;transition:all .15s;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1) !important}
      #wj-voice-mute:hover{background:#dc2626 !important}
      #wj-voice-mute.muted{background:#6b7280 !important}
      #wj-voice-mute svg{width:22px !important;height:22px !important}
      #wj-voice-powered{margin-top:12px !important;display:flex !important;align-items:center !important;justify-content:center !important;gap:4px !important;font-size:10px !important;color:#94a3b8 !important}
      #wj-voice-powered img{height:16px !important;width:auto !important;margin-left:-6px !important;opacity:0.4 !important}
      @-webkit-keyframes wj-dot-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
      @keyframes wj-dot-bounce{0%,100%{transform:translateY(-25%);animation-timing-function:cubic-bezier(0.8,0,1,1)}50%{transform:translateY(0);animation-timing-function:cubic-bezier(0,0,0.2,1)}}
      #wj-typing{display:flex !important;align-items:flex-start !important;gap:12px !important;margin-top:12px !important}
      #wj-typing-avatar{width:24px !important;height:24px !important;border-radius:50% !important;display:flex !important;align-items:center !important;justify-content:center !important;flex-shrink:0 !important}
      #wj-typing-dots{padding:10px 16px !important;border-radius:16px !important;display:flex !important;gap:4px !important;align-items:center !important}
      #wj-typing-dots .wj-dot{width:8px !important;height:8px !important;border-radius:9999px !important;background:rgba(255,255,255,0.6) !important;display:inline-block !important;will-change:transform !important;-webkit-animation:wj-dot-bounce 1s infinite !important;animation:wj-dot-bounce 1s infinite !important}
      #wj-typing-dots .wj-dot:nth-child(2){animation-delay:0.15s !important;-webkit-animation-delay:0.15s !important}
      #wj-typing-dots .wj-dot:nth-child(3){animation-delay:0.3s !important;-webkit-animation-delay:0.3s !important}
      #wj-chat-send{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-send:hover{background:\${dark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}}
      #wj-chat-send.active{background:\${color.bg};color:#fff !important}
      #wj-chat-emoji svg,#wj-chat-mic svg,#wj-chat-send svg{width:20px !important;height:20px !important}
      #wj-emoji-picker{display:none !important;position:absolute !important;bottom:100% !important;left:16px !important;right:16px !important;margin-bottom:8px !important;padding:12px !important;border-radius:12px !important;background:\${dark ? '#111' : '#fff'};border:1px solid \${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};box-shadow:0 4px 12px rgba(0,0,0,0.15) !important}
      #wj-emoji-picker.open{display:grid !important;grid-template-columns:repeat(10,1fr) !important;gap:4px !important}
      .wj-emoji{border:none !important;background:transparent !important;font-size:16px !important;cursor:pointer !important;padding:4px !important;border-radius:4px !important;transition:background .15s}
      .wj-emoji:hover{background:\${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}}
      #wj-chat-powered{display:flex !important;align-items:center !important;justify-content:center !important;gap:4px !important;padding:8px !important;font-size:10px !important;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'}}
      #wj-chat-powered img{height:16px !important;width:auto !important;margin-left:-6px !important;\${dark ? 'opacity:0.3 !important;filter:invert(1) !important' : 'opacity:0.4 !important'}}
      #wj-pop button,#wj-pop a,#wj-pop input,#wj-pop .wj-nav-item,#wj-pop .wj-chat-chip,#wj-pop .wj-prod-btn,#wj-pop .wj-prod-cart-btn{pointer-events:auto !important;cursor:pointer !important}
      #wj-pop *{pointer-events:auto !important}
      @media (max-width: 640px){
        body.wj-open{overflow:hidden !important;position:fixed !important;width:100% !important;height:100% !important;top:0 !important;left:0 !important}
        #wj-pop{position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;width:100% !important;height:100% !important;border-radius:0 !important;max-width:none !important;max-height:none !important}
        #wj-pop.open{animation:none !important}
        #wj-btn{position:fixed !important;bottom:20px !important;right:20px !important}
      }
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
        #wj-bb-expanded.open{display:block;animation:wj-expand .35s cubic-bezier(0.16,1,0.3,1)}
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
        #wj-bb-powered img{height:16px;width:auto;margin-left:-6px;\${dark ? 'opacity:0.3;filter:invert(1)' : 'opacity:0.4'}}
        #wj-bb-collapsed{pointer-events:auto}
        #wj-bb-collapsed.hidden{display:none}
        @keyframes wj-bb-fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      \`;
      d.head.appendChild(bbStyle);
    }

    // Search bar CSS (added when widget_type is search-bar)
    if (widgetType === 'search-bar') {
      var sbStyle = d.createElement('style');
      sbStyle.textContent = \`
        #wj-root{position:relative;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;pointer-events:none}
        #wj-btn{display:none}
        #wj-pop{display:none}
        #wj-sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2147483646;pointer-events:auto;animation:wj-sb-fade-in .2s ease}
        #wj-sb-overlay.open{display:block}
        @keyframes wj-sb-fade-in{from{opacity:0}to{opacity:1}}
        #wj-sb-container{position:fixed;top:0;left:0;right:0;z-index:2147483647;pointer-events:auto;display:none;flex-direction:column;align-items:center;padding:60px 16px 16px}
        #wj-sb-container.open{display:flex;animation:wj-sb-slide-down .3s cubic-bezier(0.16,1,0.3,1)}
        @keyframes wj-sb-slide-down{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        #wj-sb-box{width:100%;max-width:640px;background:\${dark ? '#18181b' : '#fff'};border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;border:1px solid \${dark ? '#3f3f46' : '#e2e8f0'}}
        #wj-sb-input-wrap{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid \${dark ? '#3f3f46' : '#e2e8f0'}}
        #wj-sb-input-wrap svg{width:20px;height:20px;color:\${dark ? '#a1a1aa' : '#94a3b8'};flex-shrink:0}
        #wj-sb-input{flex:1;border:none;outline:none;background:transparent;font-size:16px;color:\${dark ? '#fff' : '#0f172a'}}
        #wj-sb-input::placeholder{color:\${dark ? '#71717a' : '#94a3b8'}}
        #wj-sb-close{width:32px;height:32px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:\${dark ? '#27272a' : '#f1f5f9'};color:\${dark ? '#a1a1aa' : '#64748b'};flex-shrink:0;transition:background .15s}
        #wj-sb-close:hover{background:\${dark ? '#3f3f46' : '#e2e8f0'}}
        #wj-sb-close svg{width:16px;height:16px}
        #wj-sb-results{max-height:400px;overflow-y:auto;padding:0}
        #wj-sb-results:empty{display:none}
        #wj-sb-results::-webkit-scrollbar{width:6px}
        #wj-sb-results::-webkit-scrollbar-thumb{background:\${dark ? '#3f3f46' : '#cbd5e1'};border-radius:3px}
        #wj-sb-hint{padding:16px 20px;display:flex;align-items:center;gap:8px;color:\${dark ? '#71717a' : '#94a3b8'};font-size:14px}
        #wj-sb-hint svg{width:16px;height:16px;flex-shrink:0}
        .wj-sb-ai-msg{padding:16px 20px;font-size:14px;line-height:1.6;color:\${dark ? '#e4e4e7' : '#334155'};border-bottom:1px solid \${dark ? '#27272a' : '#f1f5f9'}}
        .wj-sb-loading{padding:20px;display:flex;align-items:center;justify-content:center;gap:8px;color:\${dark ? '#a1a1aa' : '#64748b'};font-size:14px}
        .wj-sb-loading-dot{width:6px;height:6px;border-radius:50%;background:\${color.bg};animation:wj-sb-bounce .6s infinite alternate}
        .wj-sb-loading-dot:nth-child(2){animation-delay:.2s}
        .wj-sb-loading-dot:nth-child(3){animation-delay:.4s}
        @keyframes wj-sb-bounce{from{opacity:0.3;transform:translateY(0)}to{opacity:1;transform:translateY(-4px)}}
        .wj-sb-products{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;padding:16px 20px}
        .wj-sb-prod{border-radius:12px;overflow:hidden;background:\${dark ? '#27272a' : '#f8fafc'};transition:box-shadow .15s;cursor:pointer;text-decoration:none;display:block}
        .wj-sb-prod:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1)}
        .wj-sb-prod-img{aspect-ratio:1;background:\${dark ? '#3f3f46' : '#e2e8f0'};display:flex;align-items:center;justify-content:center;overflow:hidden}
        .wj-sb-prod-img img{width:100%;height:100%;object-fit:cover}
        .wj-sb-prod-info{padding:10px}
        .wj-sb-prod-title{font-size:13px;font-weight:600;color:\${dark ? '#fff' : '#0f172a'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .wj-sb-prod-price{font-size:13px;color:\${color.bg};font-weight:600;margin-top:2px}
        .wj-sb-prod-old{font-size:12px;color:\${dark ? '#71717a' : '#94a3b8'};text-decoration:line-through;margin-left:4px}
        #wj-sb-powered{display:flex;align-items:center;justify-content:center;gap:4px;padding:10px;font-size:10px;color:\${dark ? 'rgba(255,255,255,0.3)' : '#94a3b8'};border-top:1px solid \${dark ? '#27272a' : '#f1f5f9'}}
        #wj-sb-powered img{height:16px;width:auto;margin-left:-6px;\${dark ? 'opacity:0.3;filter:invert(1)' : 'opacity:0.4'}}
        #wj-sb-trigger{display:none}
      \`;
      d.head.appendChild(sbStyle);
    }

    // Inject custom CSS if provided
    if (customCss) {
      var customStyle = d.createElement('style');
      customStyle.textContent = customCss;
      d.head.appendChild(customStyle);
    }

    var root = d.createElement('div');
    root.id = 'wj-root';
    root.style.cssText = inIframe
      ? 'position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;z-index:2147483647 !important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;display:flex !important;align-items:center !important;justify-content:center !important;pointer-events:none !important;visibility:visible !important;opacity:1 !important;'
      : 'position:fixed !important;bottom:20px !important;' + (cfg.widget_position === 'left' ? 'left:20px !important;' : 'right:20px !important;') + 'z-index:2147483647 !important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;visibility:visible !important;opacity:1 !important;pointer-events:none !important;';

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
      bbBar.innerHTML = '<input type="text" readonly placeholder="' + esc(hello) + '"/><div id="wj-bb-icons"><button id="wj-bb-bar-mic"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="2.5" height="8" rx="1.25" fill="currentColor" opacity="0.9"/><rect x="8.5" y="5" width="2.5" height="14" rx="1.25" fill="currentColor"/><rect x="13" y="7" width="2.5" height="10" rx="1.25" fill="currentColor"/><rect x="17.5" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.9"/></svg></button><button id="wj-bb-bar-expand"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button><button id="wj-bb-bar-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button></div>';
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
      bbInputArea.innerHTML = '<div id="wj-bb-input-box"><input type="text" placeholder="' + esc(tr.writeMessage) + '"/><button id="wj-bb-mic"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="2.5" height="8" rx="1.25" fill="currentColor" opacity="0.9"/><rect x="8.5" y="5" width="2.5" height="14" rx="1.25" fill="currentColor"/><rect x="13" y="7" width="2.5" height="10" rx="1.25" fill="currentColor"/><rect x="17.5" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.9"/></svg></button><button id="wj-bb-send"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button></div>';
      bbChat.appendChild(bbInputArea);

      // Powered by
      if (showBranding) {
        var bbPowered = d.createElement('div');
        bbPowered.id = 'wj-bb-powered';
        bbPowered.innerHTML = poweredHtml;
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

      // Tracking moved after DOM append

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
        xhr.send(JSON.stringify({ widgetId: id, visitorId: visitorId, visitorToken: visitorToken, message: msg, visitorName: 'Visitor', visitorCountry: visitorCountry, visitorRegion: visitorRegion, visitorCity: visitorCity, visitorBrowser: visitorBrowser, visitorSystem: visitorSystem }));
      }

      function renderBBMessage(msg) {
        if (renderedMessageIds[msg.id]) return;
        renderedMessageIds[msg.id] = true;
        var bubble = d.createElement('div');
        if (msg.sender_type === 'visitor') {
          bubble.style.cssText = 'display:flex;justify-content:flex-end;margin-top:12px';
          bubble.innerHTML = '<div style="padding:10px 16px;border-radius:16px;border-top-right-radius:4px;background:#f3f4f6;color:#1e293b;font-size:14px;max-width:80%">' + esc(msg.content) + '</div>';
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

      // Track after real DOM mount
      trackEvent('impression');
      trackEvent('widget_rendered');
      setTimeout(function() { checkLauncherVisibility(bbLauncher); }, 500);

      // Inject custom JS
      if (customJs) { try { new Function(customJs)(); } catch(e) { console.error('[Widjet] Custom JS error:', e); } }
      return;
    }

    // ============ SEARCH BAR LAYOUT ============
    if (widgetType === 'search-bar') {
      // Visitor tracking
      var visitorId = localStorage.getItem('wj_visitor_id');
      if (!visitorId) { visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(); localStorage.setItem('wj_visitor_id', visitorId); }
      var visitorToken = localStorage.getItem('wj_visitor_token') || '';
      var lastMessageId = null;
      var renderedMessageIds = {};

      // Create overlay
      var sbOverlay = d.createElement('div');
      sbOverlay.id = 'wj-sb-overlay';

      // Create container
      var sbContainer = d.createElement('div');
      sbContainer.id = 'wj-sb-container';

      // Create search box
      var sbBox = d.createElement('div');
      sbBox.id = 'wj-sb-box';

      // Input wrap
      var sbInputWrap = d.createElement('div');
      sbInputWrap.id = 'wj-sb-input-wrap';
      sbInputWrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input id="wj-sb-input" type="text" placeholder="' + esc(hello || 'Search products...') + '" autocomplete="off"/><button id="wj-sb-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg></button>';
      sbBox.appendChild(sbInputWrap);

      // Results area
      var sbResults = d.createElement('div');
      sbResults.id = 'wj-sb-results';
      sbBox.appendChild(sbResults);

      // Powered by
      if (showBranding) {
        var sbPowered = d.createElement('div');
        sbPowered.id = 'wj-sb-powered';
        sbPowered.innerHTML = poweredHtml;
        sbBox.appendChild(sbPowered);
      }

      sbContainer.appendChild(sbBox);
      root.appendChild(sbOverlay);
      root.appendChild(sbContainer);

      // Tracking moved after DOM append

      // Hijack existing search inputs on the page
      function hijackSearchInputs() {
        var searchSelectors = [
          'input[type="search"]',
          'input[name="q"]',
          'input[name="search"]',
          'input[name="query"]',
          '.search-input input',
          '.search__input',
          '#Search',
          '#SearchModal input',
          'predictive-search input',
          '[data-search-input]',
          'form[action="/search"] input[type="text"]',
          'form[action="/search"] input[type="search"]'
        ];

        searchSelectors.forEach(function(sel) {
          try {
            var inputs = d.querySelectorAll(sel);
            inputs.forEach(function(inp) {
              if (inp.dataset.wjHijacked) return;
              inp.dataset.wjHijacked = 'true';
              inp.addEventListener('focus', function(e) {
                e.preventDefault();
                e.target.blur();
                openSearchBar();
              });
              inp.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openSearchBar();
              });
            });
          } catch(e) {}
        });

        // Also hijack search icons/buttons
        var iconSelectors = [
          'a[href="/search"]',
          'button[data-action*="search"]',
          '.search-modal__toggle-open',
          'details-modal[data-modal-content*="search"] summary',
          '[data-search-toggle]'
        ];
        iconSelectors.forEach(function(sel) {
          try {
            var els = d.querySelectorAll(sel);
            els.forEach(function(el) {
              if (el.dataset.wjHijacked) return;
              el.dataset.wjHijacked = 'true';
              el.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openSearchBar();
              });
            });
          } catch(e) {}
        });
      }

      // Run hijack after DOM is ready and also observe for dynamically added elements
      hijackSearchInputs();
      setTimeout(hijackSearchInputs, 1000);
      setTimeout(hijackSearchInputs, 3000);

      // Also observe DOM changes (for Shopify themes that load search modals lazily)
      try {
        var observer = new MutationObserver(function() { hijackSearchInputs(); });
        observer.observe(d.body, { childList: true, subtree: true });
        // Stop observing after 10s to avoid performance issues
        setTimeout(function() { observer.disconnect(); }, 10000);
      } catch(e) {}

      function openSearchBar() {
        sbOverlay.classList.add('open');
        sbContainer.classList.add('open');
        var sbInput = d.getElementById('wj-sb-input');
        if (sbInput) { setTimeout(function() { sbInput.focus(); }, 100); }
        trackEvent('click');
      }

      function closeSearchBar() {
        sbOverlay.classList.remove('open');
        sbContainer.classList.remove('open');
        sbResults.innerHTML = '';
        var sbInput = d.getElementById('wj-sb-input');
        if (sbInput) sbInput.value = '';
      }

      // Close handlers
      sbOverlay.onclick = closeSearchBar;
      d.getElementById('wj-sb-close').onclick = closeSearchBar;
      d.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sbContainer.classList.contains('open')) closeSearchBar();
      });

      // Search input handler
      var sbInput = d.getElementById('wj-sb-input');
      var searchTimeout = null;

      function showLoading() {
        sbResults.innerHTML = '<div class="wj-sb-loading"><div class="wj-sb-loading-dot"></div><div class="wj-sb-loading-dot"></div><div class="wj-sb-loading-dot"></div></div>';
      }

      function renderSearchResults(msg) {
        var html = '';
        // AI text response
        if (msg.content) {
          html += '<div class="wj-sb-ai-msg">' + esc(msg.content) + '</div>';
        }
        // Product cards
        if (msg.metadata && msg.metadata.products && msg.metadata.products.length > 0) {
          html += '<div class="wj-sb-products">';
          msg.metadata.products.forEach(function(prod) {
            var url = prod.productUrl || '#';
            var varId = prod.shopifyVariantId || '';
            if (!varId && products.length > 0) {
              var matchedProd = products.find(function(p) { return p.title === prod.title; });
              if (matchedProd && matchedProd.shopify_variant_id) varId = matchedProd.shopify_variant_id;
            }
            var imgHtml = prod.imageUrl
              ? '<img src="' + esc(prod.imageUrl) + '" alt="' + esc(prod.title || '') + '"/>'
              : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:' + textSub + ';padding:8px;text-align:center">' + esc(prod.title || '') + '</div>';
            html += '<a class="wj-sb-prod" href="' + esc(url) + '" rel="noopener">';
            html += '<div class="wj-sb-prod-img">' + imgHtml + '</div>';
            html += '<div class="wj-sb-prod-info">';
            html += '<div class="wj-sb-prod-title">' + esc(prod.title || '') + '</div>';
            if (prod.price) {
              html += '<div class="wj-sb-prod-price">' + esc(prod.price);
              if (prod.oldPrice) html += '<span class="wj-sb-prod-old">' + esc(prod.oldPrice) + '</span>';
              html += '</div>';
            }
            html += '</div></a>';
          });
          html += '</div>';
        }
        sbResults.innerHTML = html;
      }

      // Also show product cards from config as initial suggestions
      function showProductSuggestions() {
        if (products.length > 0) {
          var html = '<div class="wj-sb-products">';
          products.forEach(function(p) {
            var url = p.product_url || '#';
            var imgHtml = p.image_url
              ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.title || '') + '"/>'
              : '';
            html += '<a class="wj-sb-prod" href="' + esc(url) + '" rel="noopener">';
            html += '<div class="wj-sb-prod-img">' + imgHtml + '</div>';
            html += '<div class="wj-sb-prod-info">';
            html += '<div class="wj-sb-prod-title">' + esc(p.title || '') + '</div>';
            if (p.price) {
              html += '<div class="wj-sb-prod-price">' + esc(p.price);
              if (p.old_price) html += '<span class="wj-sb-prod-old">' + esc(p.old_price) + '</span>';
              html += '</div>';
            }
            html += '</div></a>';
          });
          html += '</div>';
          sbResults.innerHTML = html;
        }
      }

      function sendSearchQuery(query) {
        if (!query || !query.trim()) { sbResults.innerHTML = ''; showProductSuggestions(); return; }
        showLoading();
        var tempId = 'temp_' + Date.now();
        renderedMessageIds[tempId] = true;

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
              // Now poll for the AI response
              pollForAnswer();
            } catch(e) { sbResults.innerHTML = ''; }
          } else {
            sbResults.innerHTML = '';
          }
        };
        xhr.send(JSON.stringify({
          widgetId: id,
          visitorId: visitorId,
          visitorToken: visitorToken,
          message: query.trim(),
          visitorName: 'Visitor',
          visitorCountry: visitorCountry,
          visitorRegion: visitorRegion,
          visitorCity: visitorCity,
          visitorBrowser: visitorBrowser,
          visitorSystem: visitorSystem
        }));
      }

      function pollForAnswer() {
        var attempts = 0;
        var maxAttempts = 20;
        var pollTimer = setInterval(function() {
          attempts++;
          if (attempts > maxAttempts) { clearInterval(pollTimer); sbResults.innerHTML = ''; return; }
          var pollUrl = u + '/functions/v1/get-chat-messages?visitorId=' + encodeURIComponent(visitorId) + '&widgetId=' + encodeURIComponent(id) + '&visitorToken=' + encodeURIComponent(visitorToken);
          if (lastMessageId) pollUrl += '&lastMessageId=' + encodeURIComponent(lastMessageId);
          var xhr = new XMLHttpRequest();
          xhr.open('GET', pollUrl, true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4 || xhr.status !== 200) return;
            try {
              var res = JSON.parse(xhr.responseText);
              if (res.messages && res.messages.length > 0) {
                var aiMsg = null;
                res.messages.forEach(function(msg) {
                  if (!renderedMessageIds[msg.id]) {
                    renderedMessageIds[msg.id] = true;
                    lastMessageId = msg.id;
                    if (msg.sender_type !== 'visitor') aiMsg = msg;
                  }
                });
                if (aiMsg) {
                  clearInterval(pollTimer);
                  renderSearchResults(aiMsg);
                }
              }
            } catch(e) {}
          };
          xhr.send();
        }, 1500);
      }

      if (sbInput) {
        sbInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendSearchQuery(sbInput.value);
          }
        });
      }

      d.body.appendChild(root);

      // Track after real DOM mount
      trackEvent('impression');
      trackEvent('widget_rendered');

      // Inject custom JS
      if (customJs) { try { new Function(customJs)(); } catch(e) { console.error('[Widjet] Custom JS error:', e); } }
      return;
    }

    var pop = d.createElement('div');
    pop.id = 'wj-pop';

    // Prevent Shopify theme from intercepting clicks inside the widget
    pop.addEventListener('click', function(e) { e.stopPropagation(); }, false);
    pop.addEventListener('mousedown', function(e) { e.stopPropagation(); }, false);
    pop.addEventListener('mouseup', function(e) { e.stopPropagation(); }, false);
    pop.addEventListener('touchstart', function(e) { e.stopPropagation(); }, false);
    pop.addEventListener('touchend', function(e) { e.stopPropagation(); }, false);

    // Launcher button
    var btn = d.createElement('button');
    btn.id = 'wj-btn';
    if (buttonLogo) {
      btn.innerHTML = '<img src="' + esc(buttonLogo) + '" alt=""/>';
    } else {
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';
    }
    btn.style.pointerEvents = 'auto';

    function showLauncher(withPop) {
      btn.classList.remove('hidden');
      if (withPop) { btn.classList.add('pop'); setTimeout(function() { btn.classList.remove('pop'); }, 400); }
    }

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
    var voiceBtnHtml = voiceEnabled ? '<button id="wj-voice-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="2.5" height="8" rx="1.25" fill="white" opacity="0.9"/><rect x="8.5" y="5" width="2.5" height="14" rx="1.25" fill="white"/><rect x="13" y="7" width="2.5" height="10" rx="1.25" fill="white"/><rect x="17.5" y="9" width="2.5" height="6" rx="1.25" fill="white" opacity="0.9"/></svg></button>' : '';
    contact.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' + avatarHtml + '<div style="flex:1"><div id="wj-cname">' + esc(name) + '</div><div id="wj-chelp">' + esc(help) + '</div></div>' + voiceBtnHtml + '</div><button id="wj-cbtn">' + esc(ctaText || tr.contactUs) + '</button>' + whatsappBtnHtml;

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

    // Add to Shopify cart helper
    function addToShopifyCart(variantId, btnEl) {
      if (!variantId) return;
      
      // Visual feedback: show checkmark immediately
      var origHtml = '';
      if (btnEl) {
        origHtml = btnEl.innerHTML;
        btnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        btnEl.style.background = '#22c55e';
        btnEl.style.color = '#fff';
      }

      function resetBtn() {
        if (btnEl) { btnEl.innerHTML = origHtml; btnEl.style.background = ''; btnEl.style.color = ''; }
      }

      // Always try same-origin /cart/add.js first (works when widget is on the Shopify store)
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId), quantity: 1 })
      }).then(function(res) {
        if (!res.ok) throw new Error('Cart add failed');
        return res.json();
      }).then(function(data) {
        // Verify it's a real Shopify response (has variant_id or id)
        if (!data || (!data.id && !data.variant_id && !data.items)) throw new Error('Not a Shopify response');
        showCartToast();
        // Force Shopify theme/cart UI to update immediately (with retries for async themes)
        try {
          var syncAttempt = 0;
          var maxSyncAttempts = 4;

          function applyCartCount(count) {
            var selectors = [
              '.cart-count-bubble span',
              '.cart-count',
              '[data-cart-count]',
              '.cart-count-badge',
              '#cart-icon-bubble span',
              '.header__cart-count',
              '.site-header__cart-count',
              '.js-cart-count',
              '.cart-link__count',
              '.cart__count',
              '.CartCount',
              'cart-count',
              '.mini-cart__count',
              '#HeaderCartCount',
              '.cart-items-count'
            ];
            selectors.forEach(function(sel) {
              try {
                var els = d.querySelectorAll(sel);
                els.forEach(function(el) {
                  el.textContent = count;
                  if (el.setAttribute) el.setAttribute('data-cart-count', String(count));
                });
              } catch(e) {}
            });
          }

          function refreshThemeSections() {
            try {
              var sectionIds = [];
              var seen = {};
              var sectionEls = d.querySelectorAll('[id^="shopify-section-"]');
              sectionEls.forEach(function(el) {
                var sid = (el.id || '').replace('shopify-section-', '');
                if (!sid) return;
                if (!/cart|header|mini|drawer|icon/i.test(sid)) return;
                if (seen[sid]) return;
                seen[sid] = true;
                sectionIds.push(sid);
              });

              if (sectionIds.length === 0) {
                sectionIds = ['cart-icon-bubble', 'cart-drawer', 'header', 'cart-notification', 'mini-cart'];
              }

              fetch('/?sections=' + encodeURIComponent(sectionIds.join(',')) + '&_=' + Date.now(), { cache: 'no-store' })
                .then(function(r) { return r.json(); })
                .then(function(sections) {
                  if (!sections) return;
                  Object.keys(sections).forEach(function(key) {
                    var sectionEl = d.getElementById('shopify-section-' + key);
                    if (!sectionEl || !sections[key]) return;
                    sectionEl.innerHTML = new DOMParser().parseFromString(sections[key], 'text/html').body.innerHTML;
                  });
                }).catch(function() {});
            } catch(e) {}
          }

          function emitThemeEvents(cart) {
            try {
              d.dispatchEvent(new CustomEvent('cart:refresh'));
              d.dispatchEvent(new CustomEvent('cart:update', { detail: { cart: cart } }));
              d.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart } }));
            } catch(e) {}

            // Dawn / modern Shopify pubsub
            try {
              if (w.publish && w.PUB_SUB_EVENTS && w.PUB_SUB_EVENTS.cartUpdate) {
                w.publish(w.PUB_SUB_EVENTS.cartUpdate, {
                  source: 'widjet',
                  cartData: cart,
                  variantId: parseInt(variantId, 10)
                });
              }
            } catch(e) {}
          }

          function syncCartUi() {
            syncAttempt += 1;
            fetch('/cart.js?ts=' + Date.now(), { cache: 'no-store' })
              .then(function(r) { return r.json(); })
              .then(function(cart) {
                if (!cart || cart.item_count == null) return;
                applyCartCount(cart.item_count);
                emitThemeEvents(cart);
                if (syncAttempt === 1) refreshThemeSections();
              })
              .catch(function() {})
              .then(function() {
                if (syncAttempt < maxSyncAttempts) {
                  setTimeout(syncCartUi, syncAttempt === 1 ? 180 : 450);
                }
              });
          }

          syncCartUi();
        } catch(e) {}
        setTimeout(resetBtn, 1200);
      }).catch(function() {
        // Not on Shopify store — fallback: open cart permalink in new tab
        resetBtn();
        if (shopifyDomain) {
          w.open('https://' + shopifyDomain + '/cart/' + variantId + ':1', '_blank');
        }
      });
    }

    function showCartToast() {
      var existing = d.getElementById('wj-cart-toast');
      if (existing) existing.remove();
      var toast = d.createElement('div');
      toast.id = 'wj-cart-toast';
      toast.style.cssText = 'position:fixed;bottom:90px;right:24px;background:#10b981;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:2147483647;transition:opacity 0.3s;font-family:-apple-system,BlinkMacSystemFont,sans-serif';
      toast.textContent = '✓ Added to cart!';
      d.body.appendChild(toast);
      setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 2500);
    }

    // Build section elements (but don't append yet - we'll append in homeSectionOrder)
    var sectionElements = {};

    // Product cards
    if (products.length > 0 && productCarouselEnabled) {
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
          ? '<a href="' + esc(p.product_url) + '" rel="noopener" class="wj-prod-btn">' + esc(tr.show) + '</a>' 
          : '<button class="wj-prod-btn">' + esc(tr.show) + '</button>';
        var cartBtnHtml = '';
        if (shopifyDomain && p.shopify_variant_id) {
          cartBtnHtml = '<button class="wj-prod-cart-btn" data-variant="' + esc(p.shopify_variant_id) + '"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>';
        }
        card.innerHTML = '<div class="wj-prod-img">' + imgHtml + '</div><div class="wj-prod-info">' + priceHtml + '<div class="wj-prod-title">' + esc(p.title) + '</div>' + subHtml + '<div class="wj-prod-actions">' + btnHtml + cartBtnHtml + '</div></div>';
        var cartBtn = card.querySelector('.wj-prod-cart-btn');
        if (cartBtn) {
          cartBtn.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            addToShopifyCart(this.getAttribute('data-variant'), this);
          });
        }
        prodCont.appendChild(card);
      });
      sectionElements['product-carousel'] = prodCont;
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
      sectionElements['faq'] = faqCont;
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
      sectionElements['custom-links'] = linksCont;
    }

    // Inspire Me box
    if (inspireEnabled) {
      var inspireSec = d.createElement('div');
      inspireSec.id = 'wj-inspire-section';
      var hasVideos = inspireVideos.length > 0;
      var mediaHtml = '';
      if (hasVideos) {
        var thumbs = inspireVideos.slice(0, 3);
        mediaHtml = '<div style="display:flex;gap:6px;flex-shrink:0">';
        thumbs.forEach(function(v) {
          mediaHtml += '<video src="' + esc(v.video_url || '') + '" muted autoplay loop playsinline style="width:72px;height:96px;border-radius:12px;object-fit:cover;flex-shrink:0"></video>';
        });
        mediaHtml += '</div>';
      } else {
        mediaHtml = '<div style="width:72px;height:96px;border-radius:12px;background:linear-gradient(135deg,#f97316,#ec4899,#8b5cf6);background-size:200% 200%;animation:wjInspirePh 3s ease infinite;flex-shrink:0"></div><style>@keyframes wjInspirePh{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}</style>';
      }
      inspireSec.innerHTML = '<div id="wj-inspire-box">' + mediaHtml + '<div id="wj-inspire-box-right"><div id="wj-inspire-box-title">✨ Discover more</div><button id="wj-inspire-box-btn">Inspire Me</button></div></div>';
      sectionElements['inspire-me'] = inspireSec;

      if (hasVideos) {
        var isMuted = true;

        // Build reels container
        var reelsScroll = d.createElement('div');
        reelsScroll.style.cssText = 'flex:1 !important;overflow-y:auto !important;scroll-snap-type:y mandatory !important;-webkit-overflow-scrolling:touch !important';

        // Mute/unmute button
        var muteBtn = d.createElement('button');
        muteBtn.style.cssText = 'position:absolute !important;top:12px !important;left:12px !important;z-index:60 !important;display:flex !important;align-items:center !important;gap:6px !important;padding:0 12px !important;height:36px !important;border-radius:18px !important;border:none !important;background:rgba(0,0,0,0.5) !important;backdrop-filter:blur(8px) !important;color:#fff !important;font-size:12px !important;cursor:pointer !important;transition:background .15s !important';
        muteBtn.innerHTML = '🔇 Tap to unmute';
        muteBtn.addEventListener('click', function() {
          isMuted = !isMuted;
          muteBtn.innerHTML = isMuted ? '🔇 Tap to unmute' : '🔊 Playing';
          reelsScroll.querySelectorAll('video').forEach(function(v) { v.muted = isMuted; });
        });

        // Video counter dots
        var dotsWrap = d.createElement('div');
        dotsWrap.style.cssText = 'position:absolute !important;top:14px !important;left:50% !important;transform:translateX(-50%) !important;z-index:60 !important;display:flex !important;gap:4px !important';
        var dots = [];
        inspireVideos.forEach(function(_, i) {
          var dot = d.createElement('div');
          dot.style.cssText = 'height:4px !important;border-radius:2px !important;transition:all .2s !important;' + (i === 0 ? 'width:20px !important;background:#fff !important' : 'width:6px !important;background:rgba(255,255,255,0.4) !important');
          dots.push(dot);
          dotsWrap.appendChild(dot);
        });

        // Slide animation keyframes
        var animStyle = d.createElement('style');
        animStyle.textContent = '@keyframes wjSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
        inspireView.appendChild(animStyle);

        // Track expanded state per slide
        var expandedSlides = {};

        inspireVideos.forEach(function(vid, vidIdx) {
          var slide = d.createElement('div');
          slide.style.cssText = 'height:100% !important;scroll-snap-align:start !important;position:relative !important;flex-shrink:0 !important';

          var video = d.createElement('video');
          video.src = vid.video_url;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.style.cssText = 'position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;object-fit:cover !important';
          video.addEventListener('click', function() {
            isMuted = !isMuted;
            muteBtn.innerHTML = isMuted ? '🔇 Tap to unmute' : '🔊 Playing';
            reelsScroll.querySelectorAll('video').forEach(function(v) { v.muted = isMuted; });
          });

          slide.appendChild(video);

          // Progress bar
          var progressWrap = d.createElement('div');
          progressWrap.style.cssText = 'position:absolute !important;bottom:0 !important;left:0 !important;right:0 !important;height:3px !important;background:rgba(255,255,255,0.2) !important;z-index:20 !important';
          var progressBar = d.createElement('div');
          progressBar.style.cssText = 'height:100% !important;background:#fff !important;width:0% !important;transition:width .2s linear !important;border-radius:2px !important';
          progressWrap.appendChild(progressBar);
          slide.appendChild(progressWrap);
          video.addEventListener('timeupdate', function() {
            if (video.duration) { progressBar.style.width = ((video.currentTime / video.duration) * 100) + '%'; }
          });

          // Gradient overlay at bottom
          var gradOverlay = d.createElement('div');
          gradOverlay.style.cssText = 'position:absolute !important;inset:auto 0 0 0 !important;height:180px !important;background:linear-gradient(transparent,rgba(0,0,0,0.85)) !important;pointer-events:none !important;z-index:5 !important';
          slide.appendChild(gradOverlay);

          // Product overlay — stacked deck with expand/collapse
          if (vid.linked_product_ids && vid.linked_product_ids.length > 0 && products.length > 0) {
            var linkedProds = vid.linked_product_ids.map(function(pid) {
              return products.find(function(p) { return p.id === pid; });
            }).filter(Boolean);

            if (linkedProds.length > 0) {
              var overlay = d.createElement('div');
              overlay.style.cssText = 'position:absolute !important;inset:auto 0 24px 0 !important;padding:0 12px !important;z-index:10 !important;animation:wjSlideUp 0.5s ease-out both !important';

              function buildCardHtml(prod) {
                var imgHtml = prod.image_url ? '<img src="' + esc(prod.image_url) + '" style="width:48px !important;height:48px !important;border-radius:8px !important;object-fit:cover !important;flex-shrink:0 !important"/>' : '<div style="width:48px !important;height:48px !important;border-radius:8px !important;background:rgba(255,255,255,0.1) !important;flex-shrink:0 !important"></div>';
                var priceHtml = prod.price ? '<span style="font-size:15px !important;font-weight:700 !important;color:#fff !important">' + esc(prod.price) + '</span>' : '';
                var oldPriceHtml = prod.old_price ? '<span style="font-size:12px !important;color:rgba(255,255,255,0.5) !important;text-decoration:line-through !important">' + esc(prod.old_price) + '</span>' : '';
                return imgHtml + '<div style="display:flex !important;flex-direction:column !important;gap:4px !important;min-width:0 !important;flex:1 !important"><span style="font-size:13px !important;font-weight:600 !important;color:#fff !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important">' + esc(prod.title) + '</span><div style="display:flex !important;align-items:center !important;gap:6px !important">' + priceHtml + oldPriceHtml + '</div></div><div style="flex-shrink:0 !important;width:36px !important;height:36px !important;border-radius:50% !important;background:rgba(255,255,255,0.2) !important;display:flex !important;align-items:center !important;justify-content:center !important"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg></div>';
              }

              function renderCards(isExpanded) {
                overlay.innerHTML = '';
                if (isExpanded) {
                  // Expanded: vertical stack
                  var stack = d.createElement('div');
                  stack.style.cssText = 'display:flex !important;flex-direction:column !important;gap:8px !important';
                  linkedProds.forEach(function(prod, pIdx) {
                    var card = d.createElement('div');
                    card.style.cssText = 'display:flex !important;align-items:center !important;gap:10px !important;border-radius:12px !important;background:rgba(0,0,0,0.65) !important;backdrop-filter:blur(12px) !important;padding:10px 12px !important;cursor:pointer !important;transition:all .3s !important;animation:wjSlideUp 0.3s ease-out ' + (pIdx * 60) + 'ms both !important';
                    card.innerHTML = buildCardHtml(prod);
                    card.querySelector('div[style*="border-radius:50%"]').addEventListener('click', function(e) {
                      e.stopPropagation();
                      if (shopifyDomain && prod.shopify_variant_id) {
                        addToShopifyCart(prod.shopify_variant_id, null);
                      } else if (prod.product_url) {
                        w.open(prod.product_url, '_blank');
                      }
                    });
                    stack.appendChild(card);
                  });
                  overlay.appendChild(stack);
                } else {
                  // Collapsed: stacked deck
                  var deck = d.createElement('div');
                  deck.style.cssText = 'position:relative !important;height:64px !important;cursor:pointer !important';
                  linkedProds.slice(0, 3).forEach(function(prod, pIdx) {
                    var card = d.createElement('div');
                    card.style.cssText = 'position:absolute !important;left:0 !important;right:0 !important;display:flex !important;align-items:center !important;gap:10px !important;border-radius:12px !important;background:rgba(0,0,0,0.65) !important;backdrop-filter:blur(12px) !important;padding:10px 12px !important;transition:all .3s !important;bottom:' + (pIdx * 5) + 'px !important;transform:scale(' + (1 - pIdx * 0.04) + ') !important;opacity:' + (pIdx === 0 ? 1 : 0.7 - pIdx * 0.2) + ' !important;z-index:' + (10 - pIdx) + ' !important';
                    card.innerHTML = buildCardHtml(prod);
                    deck.appendChild(card);
                  });
                  if (linkedProds.length > 1) {
                    var badge = d.createElement('div');
                    badge.style.cssText = 'position:absolute !important;top:-8px !important;right:8px !important;z-index:20 !important;background:rgba(255,255,255,0.25) !important;backdrop-filter:blur(4px) !important;color:#fff !important;font-size:10px !important;font-weight:600 !important;padding:2px 8px !important;border-radius:10px !important';
                    badge.textContent = linkedProds.length + ' products';
                    deck.appendChild(badge);
                  }
                  overlay.appendChild(deck);
                }
              }

              renderCards(false);
              overlay.addEventListener('click', function(e) {
                e.stopPropagation();
                expandedSlides[vidIdx] = !expandedSlides[vidIdx];
                renderCards(expandedSlides[vidIdx]);
              });

              slide.appendChild(overlay);
            }
          }

          reelsScroll.appendChild(slide);
        });

        // Close button
        var inspireClose = d.createElement('button');
        inspireClose.style.cssText = 'position:absolute !important;top:12px !important;right:12px !important;z-index:60 !important;width:36px !important;height:36px !important;border-radius:50% !important;border:none !important;background:rgba(0,0,0,0.5) !important;backdrop-filter:blur(8px) !important;color:#fff !important;cursor:pointer !important;display:flex !important;align-items:center !important;justify-content:center !important';
        inspireClose.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>';

        inspireView.appendChild(reelsScroll);
        inspireView.appendChild(dotsWrap);
        inspireView.appendChild(muteBtn);
        inspireView.appendChild(inspireClose);

        // Event: open inspire (from box button or entire box)
        var openInspire = function() {
          homeView.style.display = 'none';
          inspireView.style.display = 'flex';
          var firstVid = reelsScroll.querySelector('video');
          if (firstVid) firstVid.play().catch(function(){});
        };
        inspireSec.querySelector('#wj-inspire-box-btn').addEventListener('click', function(e) { e.stopPropagation(); openInspire(); });
        inspireSec.querySelector('#wj-inspire-box').addEventListener('click', openInspire);

        // Event: close inspire
        inspireClose.addEventListener('click', function() {
          inspireView.style.display = 'none';
          homeView.style.display = 'flex';
          // Pause all videos
          reelsScroll.querySelectorAll('video').forEach(function(v) { v.pause(); });
        });

        // Autoplay on scroll snap
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            var vid = entry.target.querySelector('video');
            if (!vid) return;
            if (entry.isIntersecting) {
              vid.play().catch(function(){});
              // Update dots
              var slides = Array.from(reelsScroll.children);
              var activeIdx = slides.indexOf(entry.target);
              dots.forEach(function(dot, i) {
                dot.style.cssText = 'height:4px !important;border-radius:2px !important;transition:all .2s !important;' + (i === activeIdx ? 'width:20px !important;background:#fff !important' : 'width:6px !important;background:rgba(255,255,255,0.4) !important');
              });
            } else {
              vid.pause();
            }
          });
        }, { root: reelsScroll, threshold: 0.6 });

        reelsScroll.querySelectorAll('div[style*="scroll-snap-align"]').forEach(function(slide) {
          observer.observe(slide);
        });

        // Tap to unmute/mute
        reelsScroll.addEventListener('click', function(e) {
          if (e.target.closest('div[style*="backdrop-filter"]')) return; // Don't toggle on product card click
          var vid = e.target.closest('div[style*="scroll-snap-align"]');
          if (vid) {
            var v = vid.querySelector('video');
            if (v) v.muted = !v.muted;
          }
        });
      }
    }

    // Append sections in homeSectionOrder
    homeSectionOrder.forEach(function(key) {
      if (sectionElements[key]) {
        scroll.appendChild(sectionElements[key]);
      }
    });

    // ====== DOM ASSEMBLY (homeView → scroll, footer, branding) ======
    homeView.appendChild(scroll);

    // Navigation footer
    var footer = d.createElement('div');
    footer.id = 'wj-footer';
    footer.innerHTML = '<div id="wj-nav"><button class="wj-nav-item"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>' + esc(tr.home) + '</button><button class="wj-nav-item inactive"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>' + esc(tr.contact) + '</button></div>';
    homeView.appendChild(footer);

    // Branding below nav footer
    if (showBranding) {
      var powered = d.createElement('div');
      powered.id = 'wj-powered';
      powered.innerHTML = poweredHtml;
      homeView.appendChild(powered);
    }

    // ====== CHAT VIEW ======
    var chatView = d.createElement('div');
    chatView.id = 'wj-chat-view';

    var chatAvatarHtml = avatar
      ? '<img src="' + esc(avatar) + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover"/>'
      : '<div id="wj-chat-avatar">' + esc(avatarInitial) + '</div>';

    var bubbleAvatarHtml = avatar
      ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>'
      : '<div style="width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:10px;font-weight:700">' + esc(avatarInitial) + '</div>';

    var emojis = ['😀','😂','❤️','👍','🎉','🔥','😍','🤔','👋','✨','😊','🙏','💪','😅','🥰','😎','💯','🤗','😇','🤩','✅','⭐','💜','🌟','😢','🙌','💡','🎁','🤝','❓'];
    var emojiHtml = '';
    emojis.forEach(function(e) { emojiHtml += '<button class="wj-emoji">' + e + '</button>'; });

    var chatMicHtml = voiceEnabled ? '<button id="wj-chat-mic"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="2.5" height="8" rx="1.25" fill="currentColor" opacity="0.9"/><rect x="8.5" y="5" width="2.5" height="14" rx="1.25" fill="currentColor"/><rect x="13" y="7" width="2.5" height="10" rx="1.25" fill="currentColor"/><rect x="17.5" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" opacity="0.9"/></svg></button>' : '';
    chatView.innerHTML = '<div id="wj-chat-header"><div id="wj-chat-title"><button id="wj-chat-back"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg></button>' + chatAvatarHtml + '<div id="wj-chat-title-text"><div id="wj-chat-name">' + esc(name) + '</div><div id="wj-chat-subtitle">Online</div></div></div><div id="wj-chat-header-right"><button id="wj-chat-more"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><div id="wj-chat-menu"><button class="wj-menu-item" id="wj-menu-clear"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Clear chat</button><button class="wj-menu-item" id="wj-menu-download"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Download</button></div><button id="wj-chat-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg></button></div></div><div id="wj-chat-msgs"><div id="wj-chat-bubble">' + bubbleAvatarHtml + '<div id="wj-chat-bubble-text">' + esc(tr.welcomeMessage) + '</div></div><div id="wj-chat-chips"><button class="wj-chat-chip">' + esc(chipLabels[0]) + '</button><button class="wj-chat-chip">' + esc(chipLabels[1]) + '</button><button class="wj-chat-chip">' + esc(chipLabels[2]) + '</button></div></div><div id="wj-chat-input"><div id="wj-emoji-picker">' + emojiHtml + '</div><div id="wj-chat-input-box"><input type="text" placeholder="' + esc(tr.writeMessage) + '"/><button id="wj-chat-emoji"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>' + chatMicHtml + '<button id="wj-chat-send"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg></button></div></div>' + (showBranding ? '<div id="wj-chat-powered">' + poweredHtml + '</div>' : '');

    // ====== FINAL ASSEMBLY: append views to pop ======
    pop.appendChild(homeView);
    if (inspireEnabled) { pop.appendChild(inspireView); }
    pop.appendChild(chatView);

    // ====== VOICE VIEW ======
    var voiceView = d.createElement('div');
    voiceView.id = 'wj-voice-view';
    voiceView.innerHTML = '<button id="wj-voice-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg></button><div id="wj-voice-blob-wrap"><video id="wj-voice-blob-video" src="https://widjett.lovable.app/videos/voice-blob.webm" autoplay loop muted playsinline></video></div><div id="wj-voice-chips"></div><div id="wj-voice-products"></div><div id="wj-voice-bottom"><div id="wj-voice-status">Connecting</div><div id="wj-voice-transcript"></div><div id="wj-voice-controls"><button id="wj-voice-stop"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button><button id="wj-voice-mute"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="2" x2="22" y2="22"/></svg></button></div>' + (showBranding ? '<div id="wj-voice-powered">' + poweredHtml + '</div>' : '') + '</div>';
    pop.appendChild(voiceView);

    function hideLauncher() {
      btn.classList.add('hidden');
    }

    // Animated close: play collapse, then hide and show button with pop
    function closeWidget() {
      pop.classList.remove('open');
      pop.classList.add('closing');
      if (window.innerWidth <= 640) { document.body.classList.remove('wj-open'); }
      setTimeout(function() {
        pop.classList.remove('closing');
        pop.style.display = 'none';
        showLauncher(true);
      }, 300);
    }

    btn.onclick = function() {
      if (pop.classList.contains('open') || pop.classList.contains('closing')) return;
      pop.style.display = 'flex';
      pop.classList.add('open');
      if (window.innerWidth <= 640) { document.body.classList.add('wj-open'); }
      hideLauncher();
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

    // ====== VOICE VIEW LOGIC ======
    var voiceCloseBtn = voiceView.querySelector('#wj-voice-close');
    var voiceMuteBtn = voiceView.querySelector('#wj-voice-mute');
    var voiceStopBtn = voiceView.querySelector('#wj-voice-stop');
    var voiceStatus = voiceView.querySelector('#wj-voice-status');
    var voiceTranscript = voiceView.querySelector('#wj-voice-transcript');
    var voiceBlobVideo = voiceView.querySelector('#wj-voice-blob-video');
    var voiceRecognition = null;
    var voiceMuted = false;
    var lastSpokenText = '';
    var pendingReplyUtterance = null;
    var noSpeechRetries = 0;
    var MAX_NO_SPEECH = 3;
    var keepAliveInterval = null;
    var primeBrowserTtsTimeout = null;
    var browserTtsPrimed = false;
    var preferBrowserTts = false;
    var currentTtsXhr = null;
    var ttsGeneration = 0;
    var unlockedAudio = null; // Persistent Audio element unlocked in user gesture
    function setVoiceVideoRate(rate) { if (voiceBlobVideo) try { voiceBlobVideo.playbackRate = rate; } catch(e) {} }

    var voiceLangMap = { en: 'en-US', it: 'it-IT', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR' };
    function getVoiceLang() { return voiceLangMap[lang] || 'en-US'; }
    function createUtterance(text) {
      var u = new SpeechSynthesisUtterance(text || '');
      u.lang = getVoiceLang();
      u.rate = 1.0;
      return u;
    }
    function nudgeSynth() {
      if (!w.speechSynthesis) return;
      try { w.speechSynthesis.resume(); } catch(e) {}
    }

    function clearPrimeBrowserTtsTimeout() {
      if (primeBrowserTtsTimeout) {
        clearTimeout(primeBrowserTtsTimeout);
        primeBrowserTtsTimeout = null;
      }
    }

    function primeBrowserTts(onReady) {
      if (!w.speechSynthesis || browserTtsPrimed) {
        if (onReady) onReady();
        return;
      }

      clearPrimeBrowserTtsTimeout();

      var completed = false;
      function finishPriming() {
        if (completed) return;
        completed = true;
        clearPrimeBrowserTtsTimeout();
        browserTtsPrimed = true;
        if (onReady) onReady();
      }

      try {
        var primeUtterance = createUtterance('.');
        primeUtterance.volume = 0;
        primeUtterance.onend = finishPriming;
        primeUtterance.onerror = finishPriming;
        w.speechSynthesis.speak(primeUtterance);
        primeBrowserTtsTimeout = setTimeout(finishPriming, 120);
      } catch(e) {
        finishPriming();
      }
    }

    function openVoiceView() {
      var SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice is not supported in this browser. Try Chrome or Safari.');
        return;
      }
      var greeting = (tr.welcomeMessage || hello || 'Welcome! How can I help you?').trim();
      pendingReplyUtterance = createUtterance('');

      // Reset preferBrowserTts so ElevenLabs is retried each session
      preferBrowserTts = false;

      // Unlock a persistent Audio element in user gesture context (critical for iOS)
      try {
        unlockedAudio = new Audio();
        unlockedAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
        unlockedAudio.volume = 1;
        unlockedAudio.play().then(function(){ unlockedAudio.pause(); unlockedAudio.currentTime = 0; }).catch(function(){ unlockedAudio = null; });
      } catch(e){ unlockedAudio = null; }

      voiceView.classList.add('open');
      homeView.classList.add('hidden');
      chatView.classList.remove('open');
      voiceStatus.textContent = 'Connecting...';
      setVoiceVideoRate(0.5);
      voiceTranscript.textContent = '';
      voiceMuted = false;
      voiceMuteBtn.classList.remove('muted');

      // Speak greeting FIRST, then start polling to avoid race conditions
      speakText(greeting, function() {
        startPolling();
        if (!voiceView.classList.contains('open') || voiceMuted) return;
        startVoiceRecognition();
      });
    }

    function clearVoiceChips() {
      var vc = d.getElementById('wj-voice-chips');
      if (vc) { vc.innerHTML = ''; vc.classList.remove('visible'); }
    }

    function showVoiceChips(chips) {
      var vc = d.getElementById('wj-voice-chips');
      if (!vc || !chips || chips.length === 0) return;
      clearVoiceProducts();
      var html = '';
      chips.forEach(function(chipText) {
        var pos = 0;
        var cp = chipText.codePointAt(0) || 0;
        var isEmoji = cp > 0x2300;
        if (isEmoji) {
          pos += cp > 0xFFFF ? 2 : 1;
          if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
          while (chipText.charCodeAt(pos) === 0x200D) {
            pos++;
            var nextCp = chipText.codePointAt(pos) || 0;
            if (nextCp) { pos += nextCp > 0xFFFF ? 2 : 1; }
            if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
          }
          if (chipText.charAt(pos) === ' ') pos++;
        }
        var label = isEmoji && pos > 0 ? chipText.slice(pos) : chipText;
        html += '<button class="wj-voice-chip">' + esc(label) + '</button>';
      });
      vc.innerHTML = html;
      requestAnimationFrame(function() { vc.classList.add('visible'); });
      // Bind click handlers
      vc.querySelectorAll('.wj-voice-chip').forEach(function(btn, idx) {
        btn.addEventListener('click', function() {
          var text = chips[idx];
          clearVoiceChips();
          sendMessageText(text);
        });
      });
    }

    function clearVoiceProducts() {
      var vpc = d.getElementById('wj-voice-products');
      if (vpc) { vpc.innerHTML = ''; vpc.classList.remove('visible'); }
      var blobWrap = d.getElementById('wj-voice-blob-wrap');
      if (blobWrap) { blobWrap.classList.remove('has-products'); }
    }

    function showVoiceProducts(prods) {
      clearVoiceChips();
      var vpc = d.getElementById('wj-voice-products');
      var blobWrap = d.getElementById('wj-voice-blob-wrap');
      if (!vpc || !blobWrap || !prods || prods.length === 0) return;
      var html = '';
      prods.forEach(function(prod) {
        var url = prod.productUrl || '#';
        html += '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" class="wj-voice-prod-card" style="text-decoration:none">';
        if (prod.imageUrl) {
          html += '<img src="' + esc(prod.imageUrl) + '" alt="' + esc(prod.title || '') + '"/>';
        }
        html += '<p class="wj-vpc-title">' + esc(prod.title || '') + '</p>';
        if (prod.price) { html += '<p class="wj-vpc-price">' + esc(prod.price) + '</p>'; }
        html += '</a>';
      });
      vpc.innerHTML = html;
      blobWrap.classList.add('has-products');
      requestAnimationFrame(function() { vpc.classList.add('visible'); });
    }

    function closeVoiceView() {
      voiceView.classList.remove('open', 'listening');
      pendingReplyUtterance = null;
      if (voiceRecognition) { try { voiceRecognition.abort(); } catch(e) {} voiceRecognition = null; }
      stopTtsAudio();
      isSpeaking = false;
      voiceMuted = false;
      clearVoiceChips();
      clearVoiceProducts();
      chatView.classList.add('open');
      homeView.classList.add('hidden');
    }

    function startVoiceRecognition() {
      var SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      try {
        var recognition = new SpeechRecognition();
        recognition.lang = getVoiceLang();
        recognition.interimResults = true;
        recognition.continuous = false;
        voiceRecognition = recognition;
        var finalTranscript = '';
        noSpeechRetries = 0;

        recognition.onstart = function() {
          voiceView.classList.add('listening');
          voiceStatus.textContent = 'Listening...';
          setVoiceVideoRate(1.0);
        };

        recognition.onresult = function(ev) {
          var interim = '';
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            if (ev.results[i].isFinal) {
              finalTranscript += ev.results[i][0].transcript;
            } else {
              interim += ev.results[i][0].transcript;
            }
          }
          voiceTranscript.textContent = finalTranscript + interim;
          if (finalTranscript.trim()) {
            noSpeechRetries = 0;
            lastSpokenText = '';
            pendingReplyUtterance = createUtterance('');
            voiceStatus.textContent = 'Processing...';
            voiceView.classList.remove('listening');
            setVoiceVideoRate(2.0);
            sendMessageText(finalTranscript.trim(), true);
            finalTranscript = '';
            voiceTranscript.textContent = '';
          }
        };

        recognition.onend = function() {
          if (voiceView.classList.contains('open') && !voiceMuted && !isSpeaking) {
            if (noSpeechRetries < MAX_NO_SPEECH) {
              noSpeechRetries++;
              setTimeout(function() {
                if (voiceView.classList.contains('open') && !voiceMuted && !isSpeaking && voiceRecognition) {
                  try { recognition.start(); } catch(e) {}
                }
              }, 300);
            }
          } else {
            voiceView.classList.remove('listening');
          }
        };

        recognition.onerror = function(e) {
          if (e.error === 'not-allowed') {
            voiceStatus.textContent = 'Microphone access denied';
            voiceView.classList.remove('listening');
          } else if (e.error === 'no-speech') {
            noSpeechRetries++;
          } else if (e.error !== 'aborted') {
            voiceStatus.textContent = 'Error: ' + e.error;
          }
        };

        recognition.start();
      } catch(err) {
        voiceStatus.textContent = 'Voice not available';
        console.error('[Widjet] Voice error:', err);
      }
    }

    // Voice button in contact card
    var voiceBtn = pop.querySelector('#wj-voice-btn');
    if (voiceBtn) {
      voiceBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        openVoiceView();
      };
    }

    // Voice view close button
    if (voiceCloseBtn) {
      voiceCloseBtn.onclick = function() { closeVoiceView(); };
    }

    // Voice stop button (close)
    if (voiceStopBtn) {
      voiceStopBtn.onclick = function() { closeVoiceView(); };
    }

    // Voice mute button
    if (voiceMuteBtn) {
      voiceMuteBtn.onclick = function() {
        voiceMuted = !voiceMuted;
        voiceMuteBtn.classList.toggle('muted');
        if (voiceMuted) {
          pendingReplyUtterance = null;
          if (voiceRecognition) { try { voiceRecognition.stop(); } catch(e) {} }
          stopTtsAudio();
          isSpeaking = false;
          voiceStatus.textContent = 'Muted';
          voiceView.classList.remove('listening');
        } else {
          nudgeSynth();
          startVoiceRecognition();
        }
      };
    }

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
      // Generate new visitor ID so next message creates a new conversation
      visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('wj_visitor_id', visitorId);
      visitorToken = '';
      localStorage.removeItem('wj_visitor_token');
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

    // Bind quick action chips
    var chatChips = chatView.querySelectorAll('.wj-chat-chip');
    chatChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        var text = this.textContent;
        var chipsContainer = d.getElementById('wj-chat-chips');
        if (chipsContainer) chipsContainer.remove();
        sendMessageText(text);
      });
    });

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

    var feedbackShown = {};
    var aiMessageCount = 0;

    function renderMessage(msg) {
      if (renderedMessageIds[msg.id]) return;
      renderedMessageIds[msg.id] = true;
      var bubble = d.createElement('div');
      bubble.style.cssText = msg.sender_type === 'visitor' 
        ? 'display:flex;justify-content:flex-end;margin-top:12px'
        : 'display:flex;align-items:flex-start;gap:12px;margin-top:12px;flex-wrap:wrap';
      if (msg.sender_type === 'visitor') {
        bubble.innerHTML = '<div style="padding:12px 16px;border-radius:16px;border-top-right-radius:4px;background:#f3f4f6;color:#1e293b;font-size:14px;max-width:80%">' + esc(msg.content) + '</div>';
      } else {
        var msgHtml = (avatar ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>' : '<div style="width:24px;height:24px;border-radius:50%;background:#000;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:10px;font-weight:700">' + esc(avatarInitial) + '</div>');
        msgHtml += '<div style="display:flex;flex-direction:column;align-items:stretch;max-width:70%;width:fit-content;min-width:0"><div style="padding:12px 16px;border-radius:16px;background:' + color.bg + ';color:#fff;font-size:14px">' + esc(msg.content) + '</div>';

        // Render chips from metadata (inside 70% wrapper)
        if (msg.metadata && msg.metadata.chips && msg.metadata.chips.length > 0) {
          var limitedChips = msg.metadata.chips.slice(0, 5);
          msgHtml += '<div class="wj-discovery-chips">';
          limitedChips.forEach(function(chipText) {
            var pos = 0;
            var cp = chipText.codePointAt(0) || 0;
            var isEmoji = cp > 0x2300;
            if (isEmoji) {
              pos += cp > 0xFFFF ? 2 : 1;
              if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
              while (chipText.charCodeAt(pos) === 0x200D) {
                pos++;
                var nextCp = chipText.codePointAt(pos) || 0;
                if (nextCp) { pos += nextCp > 0xFFFF ? 2 : 1; }
                if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
              }
              if (chipText.charAt(pos) === ' ') pos++;
            }
            var emojiMatch = isEmoji && pos > 0 ? [chipText.slice(0, pos), chipText.slice(0, pos).replace(/\\s+$/, '')] : null;
            if (emojiMatch) {
              var emoji = emojiMatch[1];
              var label = chipText.slice(emojiMatch[0].length);
              msgHtml += '<button class="wj-discovery-chip"><span class="wj-chip-emoji">' + esc(emoji) + '</span><span class="wj-chip-label">' + esc(label) + '</span></button>';
            } else {
              msgHtml += '<button class="wj-discovery-chip"><span class="wj-chip-label">' + esc(chipText) + '</span></button>';
            }
          });
          msgHtml += '</div>';
        }
        
        msgHtml += '</div>'; // close 70% wrapper
        
        // Render product cards OUTSIDE the 70% wrapper, full width
        if (msg.metadata && msg.metadata.products && msg.metadata.products.length > 0) {
          var prodId = 'wj-prod-' + msg.id;
          msgHtml += '<div class="wj-prod-wrap" style="width:100%">';
          msgHtml += '<div id="' + prodId + '" style="display:flex;gap:8px;margin-top:8px;overflow-x:auto;scrollbar-width:none;width:100%;padding-left:36px;box-sizing:border-box">';
          msg.metadata.products.forEach(function(prod) {
            var imgSrc = prod.imageUrl || '';
            var url = prod.productUrl || '#';
            var varId = prod.shopifyVariantId || '';
            if (!varId && products.length > 0) {
              var matchedProd = products.find(function(p) { return p.title === prod.title; });
              if (matchedProd && matchedProd.shopify_variant_id) varId = matchedProd.shopify_variant_id;
            }
            var cardBg = dark ? '#374151' : '#f1f5f9';
            var btnBg = dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9';
            var btnColor = dark ? 'rgba(255,255,255,0.7)' : '#475569';
            msgHtml += '<div style="flex-shrink:0;width:45%;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;background:' + cardBg + '">';
            msgHtml += '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;aspect-ratio:1/1;overflow:hidden">';
            if (imgSrc) {
              msgHtml += '<img src="' + esc(imgSrc) + '" alt="' + esc(prod.title || '') + '" style="width:100%;height:100%;object-fit:cover"/>';
            } else {
              msgHtml += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:' + textSub + ';text-align:center;padding:4px">' + esc(prod.title || '') + '</div>';
            }
            msgHtml += '</a>';
            if (prod.price) {
              msgHtml += '<p style="font-size:10px;font-weight:600;padding:4px 6px 0;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + textMain + '">' + esc(prod.price) + '</p>';
            }
            msgHtml += '<p style="font-size:9px;padding:0 6px 4px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + textSub + '">' + esc(prod.title || '') + '</p>';
            msgHtml += '<div style="display:flex;gap:4px;padding:0 6px 6px;align-items:stretch">';
            msgHtml += '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" style="flex:1;display:flex;align-items:center;justify-content:center;border-radius:6px;padding:4px 0;text-decoration:none;background:' + color.bg + ';color:#fff;font-size:9px;font-weight:600;transition:opacity 0.15s">' + esc(tr.show) + '</a>';
            if (shopifyDomain && varId) {
              msgHtml += '<button class="wj-chat-cart-btn" data-variant="' + esc(varId) + '" style="display:flex;align-items:center;justify-content:center;width:28px;border-radius:6px;padding:4px 0;border:none;cursor:pointer;background:' + btnBg + ';color:' + btnColor + ';transition:background 0.15s"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>';
            }
            msgHtml += '</div></div>';
          });
          msgHtml += '</div>';
          // Arrow buttons (event listeners bound after innerHTML)
          var chevronSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
          msgHtml += '<button class="wj-prod-arrow wj-prod-arrow-left" data-scroll-target="' + prodId + '" data-scroll-dir="-1">' + chevronSvg + '<polyline points="15 18 9 12 15 6"/></svg></button>';
          msgHtml += '<button class="wj-prod-arrow wj-prod-arrow-right" data-scroll-target="' + prodId + '" data-scroll-dir="1">' + chevronSvg + '<polyline points="9 18 15 12 9 6"/></svg></button>';
          msgHtml += '</div>';
        }

        bubble.innerHTML = msgHtml;
        aiMessageCount++;
      }
      chatMsgs.appendChild(bubble);
      // Bind dynamic chips
      var dynamicChips = bubble.querySelectorAll('.wj-discovery-chip');
      dynamicChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          var text = this.textContent;
          // Hide the chips container
          var parent = this.parentElement;
          if (parent) parent.remove();
          // Also hide initial chips if still visible
          var initChips = d.getElementById('wj-chat-chips');
          if (initChips) initChips.remove();
          sendMessageText(text);
        });
      });
      // Bind cart buttons in chat product cards
      var chatCartBtns = bubble.querySelectorAll('.wj-chat-cart-btn');
      chatCartBtns.forEach(function(btn) {
        btn.addEventListener('click', function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          addToShopifyCart(this.getAttribute('data-variant'), this);
        });
      });
      // Bind product carousel arrow buttons
      var arrowBtns = bubble.querySelectorAll('.wj-prod-arrow');
      arrowBtns.forEach(function(btn) {
        btn.addEventListener('click', function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          var targetId = this.getAttribute('data-scroll-target');
          var dir = parseInt(this.getAttribute('data-scroll-dir'), 10);
          var container = this.parentElement.querySelector('#' + targetId);
          if (container) container.scrollBy({left: dir * 150, behavior: 'smooth'});
        });
      });
      lastMessageId = msg.id;
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
    function showTypingIndicator() {
      hideTypingIndicator();
      var typing = d.createElement('div');
      typing.id = 'wj-typing';
      var avatarHtml = avatar ? '<img src="' + esc(avatar) + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0"/>' : '<div id="wj-typing-avatar" style="background:#000;color:#fff;font-size:10px;font-weight:700">' + esc(avatarInitial) + '</div>';
      typing.innerHTML = avatarHtml + '<div id="wj-typing-dots" style="background:' + color.bg + ';padding:10px 16px;border-radius:16px;display:flex;gap:4px;align-items:center"><span class="wj-dot" style="animation-delay:0ms;-webkit-animation-delay:0ms"></span><span class="wj-dot" style="animation-delay:150ms;-webkit-animation-delay:150ms"></span><span class="wj-dot" style="animation-delay:300ms;-webkit-animation-delay:300ms"></span></div>';
      chatMsgs.appendChild(typing);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function hideTypingIndicator() {
      var el = d.getElementById('wj-typing');
      if (el) el.remove();
    }

    // TTS helpers — ElevenLabs via edge function, fallback to browser speechSynthesis
    var isSpeaking = false;
    var currentAudio = null;

    function clearKeepAlive() {
      if (keepAliveInterval) { clearInterval(keepAliveInterval); keepAliveInterval = null; }
    }

    function stopTtsAudio() {
      clearPrimeBrowserTtsTimeout();
      clearKeepAlive();
      if (currentTtsXhr) { try { currentTtsXhr.abort(); } catch(e) {} currentTtsXhr = null; }
      if (currentAudio) { try { currentAudio.pause(); currentAudio.src = ''; } catch(e) {} currentAudio = null; }
      if (w.speechSynthesis) { try { w.speechSynthesis.cancel(); } catch(e) {} }
    }

    function resumeListening() {
      if (voiceView && voiceView.classList.contains('open') && !voiceMuted && !isSpeaking) {
        setTimeout(function() {
          if (voiceView && voiceView.classList.contains('open') && !voiceMuted && !isSpeaking) {
            noSpeechRetries = 0;
            startVoiceRecognition();
          }
        }, 300);
      }
    }

    function speakBrowserFallback(clean, finish, attempt) {
      if (!w.speechSynthesis) { finish(); return; }
      if (attempt == null) attempt = 0;
      try { w.speechSynthesis.cancel(); } catch(e) {}
      var utter = attempt === 0 && pendingReplyUtterance ? pendingReplyUtterance : createUtterance('');
      pendingReplyUtterance = null;
      utter.text = clean;
      utter.lang = getVoiceLang();
      utter.rate = 1.0;
      var started = false;

      var settled = false;
      var startTimeout = null;
      function finalize(shouldRetry) {
        if (settled) return;
        settled = true;
        if (startTimeout) clearTimeout(startTimeout);
        clearKeepAlive();

        if (shouldRetry && attempt < 1 && voiceView.classList.contains('open') && !voiceMuted) {
          setTimeout(function() { speakBrowserFallback(clean, finish, attempt + 1); }, 120);
          return;
        }

        finish();
      }

      utter.onstart = function() {
        started = true;
        voiceStatus.textContent = 'Speaking...';
        setVoiceVideoRate(1.35);
        nudgeSynth();
        keepAliveInterval = setInterval(function() {
          if (!isSpeaking) {
            clearKeepAlive();
            return;
          }
          nudgeSynth();
        }, 250);
      };
      utter.onend = function() { finalize(false); };
      utter.onerror = function() { finalize(true); };

      try {
        w.speechSynthesis.speak(utter);
        nudgeSynth();
        startTimeout = setTimeout(function() {
          if (!started && isSpeaking) {
            try { w.speechSynthesis.cancel(); } catch(e) {}
            finalize(true);
          }
        }, 1400);
      } catch(e) { finalize(true); }
    }

    function speakText(text, onDone) {
      if (!text) { pendingReplyUtterance = null; if (onDone) onDone(); return; }
      if (!voiceView || !voiceView.classList.contains('open') || voiceMuted) { pendingReplyUtterance = null; if (onDone) onDone(); return; }
      if (!onDone && text === lastSpokenText) { pendingReplyUtterance = null; return; }
      if (!onDone) lastSpokenText = text;

      isSpeaking = true;
      stopTtsAudio();
      ttsGeneration++;
      var myGen = ttsGeneration;
      if (voiceRecognition) { try { voiceRecognition.stop(); } catch(e) {} voiceRecognition = null; }
      if (voiceView) voiceView.classList.remove('listening');
      if (voiceStatus) voiceStatus.textContent = 'Speaking...';
      pendingReplyUtterance = null;

      var clean = text.replace(/[*_#]/g, '').replace(/\x60/g, '').split('[').join('').split(']').join('').split(String.fromCharCode(10)).join('. ');

      var done = false;
      function finish() {
        if (done) return;
        if (myGen !== ttsGeneration) return;
        done = true;
        clearKeepAlive();
        currentAudio = null;
        currentTtsXhr = null;
        pendingReplyUtterance = null;
        isSpeaking = false;
        if (onDone) onDone();
        else resumeListening();
      }

      function safeBrowserFallback() {
        if (myGen !== ttsGeneration) return;
        speakBrowserFallback(clean, finish);
      }

      if (preferBrowserTts) {
        safeBrowserFallback();
        return;
      }

      // Try ElevenLabs edge function first
      var ttsUrl = u + '/functions/v1/elevenlabs-tts';
      var xhr = new XMLHttpRequest();
      currentTtsXhr = xhr;
      xhr.open('POST', ttsUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'blob';
      xhr.timeout = 10000;
      xhr.onload = function() {
        currentTtsXhr = null;
        if (myGen !== ttsGeneration) return;
        if (xhr.status === 401) { preferBrowserTts = true; safeBrowserFallback(); return; }
        if (xhr.status !== 200) { safeBrowserFallback(); return; }
        var ct = xhr.getResponseHeader('Content-Type') || '';
        if (ct.indexOf('audio') !== -1) {
          try {
            var blobUrl = URL.createObjectURL(xhr.response);
            // Reuse the unlocked Audio element if available (iOS requires same element from gesture)
            var audio = unlockedAudio || new Audio();
            unlockedAudio = null; // consume it — next time a new one will be created
            currentAudio = audio;
            audio.onplay = function() {
              if (myGen !== ttsGeneration) { audio.pause(); URL.revokeObjectURL(blobUrl); return; }
              voiceStatus.textContent = 'Speaking...';
              setVoiceVideoRate(1.35);
            };
            audio.onended = function() { URL.revokeObjectURL(blobUrl); finish(); };
            audio.onerror = function() {
              URL.revokeObjectURL(blobUrl);
              safeBrowserFallback();
            };
            audio.src = blobUrl;
            audio.play()
              .then(function() {
                if (myGen !== ttsGeneration) { audio.pause(); return; }
                voiceStatus.textContent = 'Speaking...';
                setVoiceVideoRate(1.35);
              })
              .catch(function() {
                URL.revokeObjectURL(blobUrl);
                safeBrowserFallback();
              });
          } catch(e) { safeBrowserFallback(); }
        } else {
          try {
            var reader = new FileReader();
            reader.onload = function() {
              try {
                var json = JSON.parse(reader.result);
                preferBrowserTts = !!json.fallback || preferBrowserTts;
                safeBrowserFallback();
              } catch(e) { preferBrowserTts = true; safeBrowserFallback(); }
            };
            reader.readAsText(xhr.response);
          } catch(e) { preferBrowserTts = true; safeBrowserFallback(); }
        }
      };
      xhr.onerror = function() { currentTtsXhr = null; safeBrowserFallback(); };
      xhr.ontimeout = function() { currentTtsXhr = null; safeBrowserFallback(); };
      xhr.send(JSON.stringify({ text: clean, widgetId: id }));
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
            hideTypingIndicator();
            res.messages.forEach(function(msg) {
              var alreadySeen = !!renderedMessageIds[msg.id];
              renderMessage(msg);
              // TTS for bot/owner messages when voice view is open (only for NEW messages)
              if (!alreadySeen && msg.sender_type !== 'visitor' && msg.content) {
                speakText(msg.content);
              }
              // Show product cards in voice view when voice is open
              if (!alreadySeen && msg.sender_type !== 'visitor' && voiceView.classList.contains('open') && msg.metadata && msg.metadata.products && msg.metadata.products.length > 0) {
                showVoiceProducts(msg.metadata.products);
              }
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

    function sendMessageText(text, isVoice) {
      if (!text || !text.trim()) return;
      var msg = text.trim();
      // Remove initial quick-action chips on first message
      var initChips = d.getElementById('wj-chat-chips');
      if (initChips) initChips.remove();
      var tempId = 'temp_' + Date.now();
      var tempMsg = { id: tempId, sender_type: 'visitor', content: msg };
      renderMessage(tempMsg);
      showTypingIndicator();
      startPolling();

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
        visitorName: 'Visitor',
        visitorCountry: visitorCountry,
        visitorRegion: visitorRegion,
        visitorCity: visitorCity,
        visitorBrowser: visitorBrowser,
        visitorSystem: visitorSystem,
        voiceMode: !!isVoice
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
      showTypingIndicator();
      startPolling();

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
        visitorName: 'Visitor',
        visitorCountry: visitorCountry,
        visitorRegion: visitorRegion,
        visitorCity: visitorCity,
        visitorBrowser: visitorBrowser,
        visitorSystem: visitorSystem
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

    // Track events
    trackEvent('impression');
    trackEvent('widget_rendered');

    // Launcher visibility telemetry
    setTimeout(function() {
      try {
        var launcherEl = d.getElementById('wj-btn');
        if (launcherEl) {
          var rect = launcherEl.getBoundingClientRect();
          var style = w.getComputedStyle(launcherEl);
          var isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          trackEvent(isVisible ? 'launcher_visible' : 'launcher_hidden');
        } else {
          trackEvent('launcher_hidden');
        }
      } catch(e) {}
    }, 1000);

    // Inject custom JS if provided
    if (customJs) {
      try { new Function(customJs)(); } catch(e) { console.error('[Widjet] Custom JS error:', e); }
    }
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
