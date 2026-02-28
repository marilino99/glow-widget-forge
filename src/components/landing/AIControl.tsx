import { motion } from "framer-motion";
import greenBlob from "@/assets/green-blob.png";
import yellowBlob from "@/assets/yellow-blob.png";
import { ArrowRight, Bot, FileText, Globe, BarChart3, MessageSquare } from "lucide-react";
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
  card1Title: string; card1Desc: string; card1Cta: string;
  card2Title: string; card2Desc: string;
  card3Title: string; card3Desc: string;
  card4Title: string; card4Desc: string;
}> = {
  en: {
    headline1: "AI you ", headlineAccent: "control", headline2: ". Completely.",
    card1Title: "Supervise your AI agent in real time", card1Desc: "Monitor every conversation between your AI and visitors. Jump in anytime.", card1Cta: "Build your first AI agent",
    card2Title: "You set the rules. AI plays by them.", card2Desc: "Upload your knowledge base, define boundaries, and let AI handle the rest — exactly how you want.",
    card3Title: "Live insights into your team and AI.", card3Desc: "Track performance, response times, and conversions in one dashboard.",
    card4Title: "Instant integration", card4Desc: "Integrate diverse data sources to enrich your agent's knowledge and capabilities.",
  },
  it: {
    headline1: "AI che ", headlineAccent: "controlli", headline2: ". Completamente.",
    card1Title: "Supervisiona il tuo agente AI in tempo reale", card1Desc: "Monitora ogni conversazione tra la tua AI e i visitatori. Intervieni in qualsiasi momento.", card1Cta: "Crea il tuo primo agente AI",
    card2Title: "Tu stabilisci le regole. L'AI le rispetta.", card2Desc: "Carica la tua knowledge base, definisci i limiti e lascia che l'AI gestisca il resto — esattamente come vuoi.",
    card3Title: "Insights in tempo reale sul team e l'AI.", card3Desc: "Monitora performance, tempi di risposta e conversioni in un'unica dashboard.",
    card4Title: "Integrazione istantanea", card4Desc: "Integra diverse fonti di dati per arricchire le conoscenze e le capacità del tuo agente.",
  },
};

/* ── Mockup: Chat list rows ── */
const chatRows = [
  { name: "Emma Wilson", status: "Chatting now", statusColor: "#22c55e", time: "2m ago" },
  { name: "Marco Rossi", status: "Chatting now", statusColor: "#22c55e", time: "5m ago" },
  { name: "Sarah Chen", status: "Closed deal", statusColor: "#c75a2a", time: "12m ago" },
  { name: "James Taylor", status: "Closed deal", statusColor: "#c75a2a", time: "1h ago" },
];

const ChatListMockup = () => (
  <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm overflow-hidden border border-black/5">
    {chatRows.map((row, i) => (
      <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i !== chatRows.length - 1 ? "border-b border-black/5" : ""}`}>
        {/* Avatars */}
        <div className="flex -space-x-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-[#d4d0c8] flex items-center justify-center border-2 border-white">
            <Bot className="h-4 w-4 text-[#6b6760]" />
          </div>
          <div className="h-8 w-8 rounded-full bg-[#c4b5a0] flex items-center justify-center border-2 border-white text-[10px] font-bold text-white">
            {row.name.split(" ").map(n => n[0]).join("")}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2a2a2a] truncate">AI agent and {row.name}</p>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${row.statusColor}18`, color: row.statusColor }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: row.statusColor }} />
          {row.status}
        </span>
        <span className="text-[11px] text-[#999] flex-shrink-0 hidden sm:block">{row.time}</span>
        <button className="flex-shrink-0 text-[11px] font-semibold text-[#2a2a2a] bg-[#f0ede8] rounded-lg px-3 py-1.5 hover:bg-[#e4e0da] transition-colors hidden md:block">Supervise</button>
      </div>
    ))}
  </div>
);

/* ── Mockup: Knowledge sources ── */
const KnowledgeMockup = () => (
  <div className="mt-6 md:mt-0 rounded-2xl bg-white/80 backdrop-blur-sm border border-black/5 overflow-hidden">
    {/* Browser bar */}
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f3ef] border-b border-black/5">
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ccc]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#ccc]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#ccc]" />
      </div>
      <div className="flex-1 h-5 rounded-md bg-white/60 mx-4" />
    </div>
    <div className="p-5 space-y-3">
      {[
        { icon: Globe, label: "Website pages", count: "24 pages" },
        { icon: FileText, label: "Product catalog", count: "156 items" },
        { icon: FileText, label: "Help articles", count: "42 docs" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f3ef]">
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center">
            <item.icon className="h-4 w-4 text-[#8a8580]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#2a2a2a]">{item.label}</p>
            <p className="text-[11px] text-[#999]">{item.count}</p>
          </div>
        </div>
      ))}
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
      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/15 backdrop-blur-sm">
        <div>
          <p className="text-xs text-white/60">{item.label}</p>
          <p className="text-lg font-bold text-white">{item.value}</p>
        </div>
        <span className="text-xs font-semibold text-white/80 bg-white/10 rounded-full px-2 py-0.5">{item.change}</span>
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
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Headline */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {t.headline1}<em className="italic" style={{ color: "#c75a2a" }}>{t.headlineAccent}</em>{t.headline2}
          </h2>
        </motion.div>

        {/* Card 1 — Supervise */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "#e8e5df" }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#2a2a2a]">{t.card1Title}</h3>
              <p className="mt-1.5 text-sm text-[#6b6760] max-w-md">{t.card1Desc}</p>
            </div>
            <a href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-colors self-start flex-shrink-0">
              {t.card1Cta} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <ChatListMockup />
        </motion.div>

        {/* Cards 2 & 3 — Rules + Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "#e8e5df" }}>
            <h3 className="text-xl md:text-2xl font-bold text-[#2a2a2a]">{t.card2Title}</h3>
            <p className="mt-1.5 text-sm text-[#6b6760] max-w-sm">{t.card2Desc}</p>
            <KnowledgeMockup />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: "#9a9a8a" }}>
            <h3 className="text-xl md:text-2xl font-bold text-white">{t.card3Title}</h3>
            <p className="mt-1.5 text-sm text-white/70 max-w-sm">{t.card3Desc}</p>
            <AnalyticsMockup />
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
