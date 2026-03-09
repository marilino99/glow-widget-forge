import { motion } from "framer-motion";
import greenBlob from "@/assets/green-blob.png";
import yellowBlob from "@/assets/yellow-blob.png";
import { ArrowRight, Bot, FileText, Globe, BarChart3, MessageSquare, Lock, ShieldCheck, Database, CloudOff } from "lucide-react";
import { useLandingLang } from "@/contexts/LandingLanguageContext";
import shopifyLogo from "@/assets/logo-shopify.png";
import wordpressLogo from "@/assets/logo-wordpress.png";
import wixLogo from "@/assets/logo-wix-icon.png";
import lovableLogo from "@/assets/logo-lovable.png";
import onepageLogo from "@/assets/logo-onepage.png";
import whatsappLogo from "@/assets/logo-whatsapp.png";
import messengerLogo from "@/assets/logo-messenger.png";
import woocommerceLogo from "@/assets/logo-woocommerce.png";
import telegramLogo from "@/assets/logo-telegram.png";
import calendlyLogo from "@/assets/logo-calendly.png";
import elevenlabsLogo from "@/assets/logo-elevenlabs.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const i18n: Record<string, {
  headline1: string; headlineAccent: string; headline2: string;
  secTitle: string; secSubtitle: string;
  badge1: string; badge1Desc: string;
  badge2: string; badge2Desc: string;
  badge3: string; badge3Desc: string;
  badge4: string; badge4Desc: string;
  card2Title: string; card2Desc: string;
  card3Title: string; card3Desc: string;
  card4Title: string; card4Desc: string;
}> = {
  en: {
    headline1: "AI you ", headlineAccent: "control", headline2: ". Completely.",
    secTitle: "Your data, protected", secSubtitle: "Built on Google Cloud infrastructure with industry-standard protections",
    badge1: "Encrypted Connections", badge1Desc: "All data transmitted over HTTPS/TLS encrypted channels.",
    badge2: "Per-Account Isolation", badge2Desc: "Row-level security policies keep each account's data fully separated.",
    badge3: "EU-Hosted Infrastructure", badge3Desc: "Data stored on European cloud infrastructure for low latency and compliance.",
    badge4: "Zero-Training Guarantee", badge4Desc: "Your data is never used to train AI models. Inference-only.",
    card2Title: "You set the rules. AI plays by them.", card2Desc: "Upload your knowledge base, define boundaries, and let AI handle the rest — exactly how you want.",
    card3Title: "Live insights into your team and AI.", card3Desc: "Track performance, response times, and conversions in one dashboard.",
    card4Title: "Instant integration", card4Desc: "Integrate diverse data sources to enrich your agent's knowledge and capabilities.",
  },
  it: {
    headline1: "AI che ", headlineAccent: "controlli", headline2: ". Completamente.",
    secTitle: "I tuoi dati, protetti", secSubtitle: "Costruito su infrastruttura Google Cloud con protezioni standard di settore",
    badge1: "Connessioni crittografate", badge1Desc: "Tutti i dati trasmessi su canali crittografati HTTPS/TLS.",
    badge2: "Isolamento per account", badge2Desc: "Policy di sicurezza a livello di riga mantengono i dati di ogni account completamente separati.",
    badge3: "Infrastruttura in UE", badge3Desc: "Dati archiviati su infrastruttura cloud europea per bassa latenza e conformità.",
    badge4: "Zero-Training Guarantee", badge4Desc: "I tuoi dati non vengono mai usati per addestrare modelli AI. Solo inferenza.",
    card2Title: "Tu stabilisci le regole. L'AI le rispetta.", card2Desc: "Carica la tua knowledge base, definisci i limiti e lascia che l'AI gestisca il resto — esattamente come vuoi.",
    card3Title: "Insights in tempo reale sul team e l'AI.", card3Desc: "Monitora performance, tempi di risposta e conversioni in un'unica dashboard.",
    card4Title: "Integrazione istantanea", card4Desc: "Integra diverse fonti di dati per arricchire le conoscenze e le capacità del tuo agente.",
  },
};

/* ── Security badges data ── */
const securityBadges = (t: typeof i18n.en) => [
  { icon: Lock, name: t.badge1, desc: t.badge1Desc },
  { icon: Database, name: t.badge2, desc: t.badge2Desc },
  { icon: ShieldCheck, name: t.badge3, desc: t.badge3Desc },
  { icon: CloudOff, name: t.badge4, desc: t.badge4Desc },
];

/* ── Mockup: Chat conversation ── */
const ChatConversationMockup = () => (
  <div className="mt-10 md:mt-6 max-w-md mx-auto space-y-6">
    {/* User message */}
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-tr-sm bg-[#4a6cf7] px-4 py-3 max-w-[85%]">
        <p className="text-sm text-white">I'm refreshing my wardrobe. Can you recommend some cosy, comfortable basics in size M?</p>
      </div>
    </div>
    {/* Bot message */}
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm bg-[#f0f0f3] px-4 py-3 max-w-[85%]">
        <p className="text-sm text-[#2a2a2a]">Absolutely. Here are a few comfy essentials that pair well and could be a good starting point:</p>
      </div>
    </div>
    {/* Product cards + Buy now in white box */}
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Deluxe Shirt", variant: "Blue - Medium", price: "€23.00", brand: "Cartsy", svg: (
            <svg viewBox="0 0 80 80" className="h-14 w-14">
              <rect x="15" y="22" width="50" height="40" rx="4" fill="#3b5eda" />
              <path d="M15 26 C15 22, 25 18, 40 18 C55 18, 65 22, 65 26" fill="#2d4ec7" />
              <rect x="30" y="18" width="20" height="8" rx="4" fill="none" stroke="#2d4ec7" strokeWidth="3" />
            </svg>
          )},
          { name: "Essential Hoodie", variant: "Black - Medium", price: "€43.00", brand: "Cartsy", svg: (
            <svg viewBox="0 0 80 80" className="h-14 w-14">
              <rect x="15" y="25" width="50" height="38" rx="4" fill="#1a1a1a" />
              <path d="M15 29 C15 25, 25 20, 40 20 C55 20, 65 25, 65 29" fill="#111" />
              <rect x="30" y="20" width="20" height="8" rx="4" fill="none" stroke="#111" strokeWidth="3" />
              <path d="M33 30 Q40 38 47 30" fill="none" stroke="#333" strokeWidth="1.5" />
            </svg>
          )},
        ].map((p, i) => (
          <div key={i} className="rounded-xl border border-black/5 bg-[#f5f5f8] overflow-hidden">
            <div className="h-24 flex items-center justify-center bg-[#ecedf2]">
              {p.svg}
            </div>
            <div className="p-3 space-y-0.5">
              <p className="text-xs font-semibold text-[#2a2a2a]">{p.name}</p>
              <p className="text-[10px] text-[#888]">{p.variant}</p>
              <p className="text-xs font-bold text-[#2a2a2a] mt-1">{p.price}</p>
              <p className="text-[9px] text-[#aaa]">{p.brand}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-[#f0f0f3] py-2.5 text-center">
        <span className="text-sm font-semibold text-[#4a6cf7]">Buy now</span>
      </div>
    </div>
  </div>
);

/* ── Mockup: Analytics ── */
const AnalyticsMockup = () => (
  <div className="mt-6 md:mt-0 space-y-3">
    {[
      { label: "Total value", value: "$12,480", change: "+24%" },
      { label: "Total orders", value: "342", change: "+18%" },
      { label: "Avg response", value: "1.2s", change: "-40%" },
    ].map((item, i) => (
      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/80 backdrop-blur-sm">
        <div>
          <p className="text-xs text-[#999]">{item.label}</p>
          <p className="text-lg font-bold text-[#2a2a2a]">{item.value}</p>
        </div>
        <span className="text-xs font-semibold text-[#2a2a2a] bg-[#e8e5df] rounded-full px-2 py-0.5">{item.change}</span>
      </div>
    ))}
  </div>
);

/* ── Tools data ── */
const tools = [
  { name: "WooCommerce", color: "#96588A", icon: "", image: woocommerceLogo },
  { name: "Shopify", color: "#96BF48", icon: "", image: shopifyLogo },
  { name: "WordPress", color: "#21759B", icon: "", image: wordpressLogo },
  { name: "Wix", color: "#0C6EFC", icon: "", image: wixLogo },
  { name: "Lovable", color: "#FF6B6B", icon: "", image: lovableLogo },
  { name: "OnePage", color: "#2979FF", icon: "", image: onepageLogo },
  
  { name: "WhatsApp", color: "#25D366", icon: "", image: whatsappLogo },
  { name: "ElevenLabs", color: "#000000", icon: "", image: elevenlabsLogo },
  { name: "Calendly", color: "#006BFF", icon: "", image: calendlyLogo },
  { name: "Telegram", color: "#26A5E4", icon: "", image: telegramLogo },
  { name: "Messenger", color: "#0084FF", icon: "", image: messengerLogo },
  
];
const toolRow1 = tools.slice(0, 6);
const toolRow2 = tools.slice(6);

/* ── Main component ── */
const AIControl = () => {
  const { lang } = useLandingLang();
  const t = i18n[lang] || i18n.en;

  return (
    <section className="px-6 py-16 md:py-24" style={{ backgroundColor: '#f6f5f4' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Headline */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {t.headline1}<em className="italic" style={{ color: "#7c3aed" }}>{t.headlineAccent}</em>{t.headline2}
          </h2>
        </motion.div>

        {/* Card 1 — Security & Compliance */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "#ffffff" }}>
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-[#2a2a2a]">{t.secTitle}</h3>
            <p className="mt-1.5 text-sm text-[#6b6760]">{t.secSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {securityBadges(t).map((badge, i) => (
              <div key={i} className="rounded-2xl border border-black/5 bg-[#f8f8f7] p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <badge.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-[#2a2a2a]">{badge.name}</p>
                <p className="text-xs text-[#6b6760] leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cards 2 & 3 — Rules + Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#6b6760] mb-2">{t.card2Desc}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-[#2a2a2a] tracking-tight">{t.card2Title}</h3>
              </div>
              <a href="/signup" className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                <ArrowRight className="h-4 w-4 text-white" />
              </a>
            </div>
            <ChatConversationMockup />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10 pb-40 md:pb-48 relative overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
            <h3 className="text-xl md:text-2xl font-bold text-[#2a2a2a]">{t.card3Title}</h3>
            <p className="mt-1.5 text-sm text-[#6b6760] max-w-sm">{t.card3Desc}</p>
            {/* Gradient chart line */}
            <div className="absolute bottom-0 left-0 right-0 h-36 md:h-44">
              <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="chartLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="50%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="chartFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d="M0,120 C18,120 22,117 40,115 C58,113 62,118 80,116 C95,114 99,110 114,107 C129,104 133,109 148,105 C161,102 165,96 180,91 C193,87 197,93 212,87 C225,82 229,74 246,67 C259,62 263,70 280,63 C293,58 297,48 316,40 C329,35 333,43 352,34 C365,28 370,18 390,10 C398,6 400,4 400,2 L400,150 L0,150 Z"
                  fill="url(#chartFillGradient)"
                />
                {/* Line stroke */}
                <path
                  d="M0,120 C18,120 22,117 40,115 C58,113 62,118 80,116 C95,114 99,110 114,107 C129,104 133,109 148,105 C161,102 165,96 180,91 C193,87 197,93 212,87 C225,82 229,74 246,67 C259,62 263,70 280,63 C293,58 297,48 316,40 C329,35 333,43 352,34 C365,28 370,18 390,10 C398,6 400,4 400,2"
                  fill="none"
                  stroke="url(#chartLineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Card 4 — Works with your tools */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl border border-border bg-background p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="md:w-[38%] flex-shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t.card4Title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t.card4Desc}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-hidden -mr-8 md:-mr-10">
              {/* Row 1 */}
              <div className="flex gap-2.5">
                {toolRow1.map((tool) => (
                  <span key={tool.name} className="inline-flex items-center gap-2 rounded-full bg-[#f4f4f5] px-2.5 py-1.5 text-xs font-semibold text-foreground whitespace-nowrap flex-shrink-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-bold flex-shrink-0 overflow-hidden" style={{ color: tool.color }}>
                      {(tool as any).image ? <img src={(tool as any).image} alt={tool.name} className="h-5 w-5 object-contain" /> : tool.icon}
                    </span>
                    {tool.name}
                  </span>
                ))}
                {/* Yellow blob */}
                <span className="inline-flex h-9 w-28 rounded-full flex-shrink-0 overflow-hidden">
                  <img src={yellowBlob} alt="" className="h-full w-full object-cover" />
                </span>
              </div>
              {/* Row 2 */}
              <div className="flex gap-2.5 ml-12">
                {/* Green blob */}
                <span className="inline-flex h-9 w-32 rounded-full flex-shrink-0 overflow-hidden">
                  <img src={greenBlob} alt="" className="h-full w-full object-cover" />
                </span>
                {toolRow2.map((tool) => (
                  <span key={tool.name} className="inline-flex items-center gap-2 rounded-full bg-[#f4f4f5] px-2.5 py-1.5 text-xs font-semibold text-foreground whitespace-nowrap flex-shrink-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[9px] font-bold flex-shrink-0 overflow-hidden" style={{ color: tool.color }}>
                      {(tool as any).image ? <img src={(tool as any).image} alt={tool.name} className="h-5 w-5 object-contain" /> : tool.icon}
                    </span>
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIControl;
