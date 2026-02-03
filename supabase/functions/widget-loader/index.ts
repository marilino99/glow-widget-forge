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

    // Complete widget loader with all builder elements
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
    var color = colors[cfg.widget_color] || colors.blue;
    var dark = cfg.widget_theme === 'dark';
    var solid = cfg.background_type === 'solid';
    var name = cfg.contact_name || 'Support';
    var help = cfg.offer_help || 'Write to us';
    var hello = cfg.say_hello || 'Hello! 👋';
    var avatar = cfg.selected_avatar;
    var buttonLogo = cfg.button_logo;
    var products = cfg.product_cards || [];
    var faqs = cfg.faq_items || [];
    var igPosts = cfg.instagram_posts || [];
    var faqEnabled = cfg.faq_enabled;
    var igEnabled = cfg.instagram_enabled;
    var lang = cfg.language || 'en';

    var t = {
      en: { contactUs: 'Contact us', show: 'Show', quickAnswers: 'Quick answers', home: 'Home', contact: 'Contact', followIg: 'Follow us on Instagram' },
      es: { contactUs: 'Contáctanos', show: 'Ver', quickAnswers: 'Respuestas rápidas', home: 'Inicio', contact: 'Contacto', followIg: 'Síguenos en Instagram' },
      de: { contactUs: 'Kontakt', show: 'Zeigen', quickAnswers: 'Schnelle Antworten', home: 'Home', contact: 'Kontakt', followIg: 'Folge uns auf Instagram' },
      fr: { contactUs: 'Contactez-nous', show: 'Voir', quickAnswers: 'Réponses rapides', home: 'Accueil', contact: 'Contact', followIg: 'Suivez-nous sur Instagram' },
      it: { contactUs: 'Contattaci', show: 'Mostra', quickAnswers: 'Risposte rapide', home: 'Home', contact: 'Contatto', followIg: 'Seguici su Instagram' },
      pt: { contactUs: 'Contacte-nos', show: 'Ver', quickAnswers: 'Respostas rápidas', home: 'Início', contact: 'Contacto', followIg: 'Siga-nos no Instagram' },
      pl: { contactUs: 'Kontakt', show: 'Pokaż', quickAnswers: 'Szybkie odpowiedzi', home: 'Strona główna', contact: 'Kontakt', followIg: 'Obserwuj nas na Instagramie' }
    };
    var tr = t[lang] || t.en;

    var bgMain = dark ? '#000' : '#f8f8f8';
    var bgCard = dark ? '#1e293b' : '#fff';
    var bgFaq = dark ? '#252525' : '#fff';
    var textMain = dark ? '#fff' : '#0f172a';
    var textSub = dark ? 'rgba(255,255,255,0.6)' : '#64748b';
    var borderCol = dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    var style = d.createElement('style');
    style.textContent = \`
      #wj-root{position:fixed;bottom:20px;right:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
      #wj-btn{width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s,box-shadow .2s;background:\${color.bg};overflow:hidden}
      #wj-btn:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}
      #wj-btn svg{width:24px;height:24px}
      #wj-btn img{width:100%;height:100%;object-fit:cover}
      #wj-pop{display:none;position:fixed;bottom:90px;right:20px;width:320px;max-height:500px;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.2);overflow:hidden;animation:wj-in .2s ease;background:\${bgMain};z-index:2147483647}
      #wj-pop.open{display:flex;flex-direction:column}
      @keyframes wj-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      #wj-scroll{flex:1;overflow-y:auto}
      #wj-head{padding:20px 24px;position:relative;\${solid ? 'background:'+color.bg+';color:#fff' : ''}}
      #wj-hello{font-size:24px;font-weight:700;max-width:70%;word-break:break-word;white-space:pre-line;color:\${solid ? '#fff' : textMain}}
      #wj-close{position:absolute;right:16px;top:16px;background:none;border:none;cursor:pointer;opacity:0.7;padding:4px}
      #wj-close:hover{opacity:1}
      #wj-close svg{width:16px;height:16px;stroke:\${solid ? '#fff' : textSub}}
      #wj-contact{margin:0 16px;padding:16px;border-radius:12px;background:\${solid ? 'rgba(30,41,59,0.9)' : bgCard}}
      #wj-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#22d3ee,#34d399);display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:700;font-size:14px;flex-shrink:0}
      #wj-cname{font-size:12px;color:\${solid ? 'rgba(255,255,255,0.6)' : textSub}}
      #wj-chelp{font-size:14px;color:\${solid ? '#fff' : textMain}}
      #wj-cbtn{width:100%;margin-top:12px;padding:10px;border:none;border-radius:8px;background:\${color.bg};color:#fff;font-size:14px;font-weight:500;cursor:pointer}
      #wj-cbtn:hover{background:\${color.hover}}
      #wj-products{padding:16px;display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
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
      #wj-ig{padding:0 16px 16px}
      #wj-ig-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
      #wj-ig-head svg{width:16px;height:16px;color:#ec4899}
      #wj-ig-head span{font-size:14px;font-weight:500;color:\${textMain}}
      #wj-ig-list{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
      #wj-ig-list::-webkit-scrollbar{display:none}
      .wj-ig-item{width:100px;height:100px;flex-shrink:0;border-radius:8px;overflow:hidden;background:\${dark ? '#374151' : '#e2e8f0'}}
      .wj-ig-item img{width:100%;height:100%;object-fit:cover}
      #wj-faq{padding:0 16px 16px}
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
      #wj-footer{padding:12px 16px 4px;background:\${bgMain}}
      #wj-nav{display:flex;border-radius:16px;background:\${dark ? 'rgba(51,65,85,0.7)' : 'rgba(255,255,255,0.7)'};backdrop-filter:blur(8px)}
      .wj-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border:none;background:transparent;cursor:pointer;color:\${textMain};font-size:12px}
      .wj-nav-item.inactive{color:\${textSub}}
      .wj-nav-item svg{width:20px;height:20px}
      #wj-powered{padding:8px;text-align:center;font-size:12px;color:\${textSub};background:\${bgMain}}
    \`;
    d.head.appendChild(style);

    var root = d.createElement('div');
    root.id = 'wj-root';

    var pop = d.createElement('div');
    pop.id = 'wj-pop';

    var scroll = d.createElement('div');
    scroll.id = 'wj-scroll';

    // Header
    var header = d.createElement('div');
    header.id = 'wj-head';
    header.innerHTML = '<div id="wj-hello">' + esc(hello) + '</div><button id="wj-close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg></button>';
    scroll.appendChild(header);

    // Contact card
    var contact = d.createElement('div');
    contact.id = 'wj-contact';
    var avatarHtml = avatar 
      ? '<img src="' + esc(avatar) + '" id="wj-avatar" alt=""/>' 
      : '<div id="wj-avatar">C</div>';
    contact.innerHTML = '<div style="display:flex;align-items:center;gap:12px">' + avatarHtml + '<div style="flex:1"><div id="wj-cname">' + esc(name) + '</div><div id="wj-chelp">' + esc(help) + '</div></div></div><button id="wj-cbtn">' + esc(tr.contactUs) + '</button>';
    scroll.appendChild(contact);

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

    pop.appendChild(scroll);

    // Footer nav
    var footer = d.createElement('div');
    footer.id = 'wj-footer';
    footer.innerHTML = '<div id="wj-nav"><button class="wj-nav-item"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>' + esc(tr.home) + '</span></button><button class="wj-nav-item inactive"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>' + esc(tr.contact) + '</span></button></div>';
    pop.appendChild(footer);

    // Powered by
    var powered = d.createElement('div');
    powered.id = 'wj-powered';
    powered.innerHTML = 'Powered by <span style="font-weight:500">Widjet</span>';
    pop.appendChild(powered);

    // Button
    var btn = d.createElement('button');
    btn.id = 'wj-btn';
    btn.innerHTML = buttonLogo 
      ? '<img src="' + esc(buttonLogo) + '" alt=""/>' 
      : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>';
    btn.onclick = function() {
      pop.classList.toggle('open');
    };

    // Close button handler
    pop.querySelector('#wj-close').onclick = function() {
      pop.classList.remove('open');
    };

    root.appendChild(pop);
    root.appendChild(btn);
    d.body.appendChild(root);
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
