import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShoppingBag, HelpCircle, BarChart3, Check, ArrowRight, Bot, Zap, Users, Headphones, Target } from "lucide-react";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const tabs = [
  { id: "support", icon: Headphones },
  { id: "sales", icon: ShoppingBag },
  { id: "leadgen", icon: Target },
  { id: "selfservice", icon: HelpCircle },
  { id: "engagement", icon: Users },
] as const;

type TabId = typeof tabs[number]["id"];

interface TabContent {
  title1: string;
  title2: string;
  description: string;
  bullets: string[];
  features: { icon: React.ElementType; text: string }[];
}

const tabContents: Record<string, Record<TabId, TabContent>> = {
  en: {
    support: {
      title1: "Answer questions instantly,",
      title2: "every time",
      description: "Give your visitors 24/7 support with AI-powered chat, smart FAQ, and seamless escalation to your team.",
      bullets: ["Reduce support tickets by 40%", "Instant AI-powered replies", "Seamless human handoff"],
      features: [
        { icon: Bot, text: "AI Agent answers common questions automatically" },
        { icon: MessageSquare, text: "Live Chat connects visitors to your team" },
        { icon: HelpCircle, text: "FAQ Widget provides instant self-service" },
        { icon: Zap, text: "Smart Routing escalates complex issues" },
      ],
    },
    sales: {
      title1: "Convert visitors",
      title2: "into buyers",
      description: "Showcase products, capture leads, and guide visitors through your sales funnel — all from a single widget.",
      bullets: ["Boost conversions by up to 30%", "Showcase products beautifully", "Capture leads on autopilot"],
      features: [
        { icon: ShoppingBag, text: "Product Carousel highlights best sellers" },
        { icon: MessageSquare, text: "Chat Widget captures purchase intent" },
        { icon: BarChart3, text: "Analytics tracks conversion events" },
        { icon: Zap, text: "Smart CTA drives action at the right moment" },
      ],
    },
    selfservice: {
      title1: "Empower visitors to",
      title2: "help themselves",
      description: "Let customers find answers without waiting. A well-organized FAQ and knowledge base reduces friction and builds trust.",
      bullets: ["Available 24/7 on every page", "Reduce repetitive questions", "Improve customer satisfaction"],
      features: [
        { icon: HelpCircle, text: "FAQ Section organizes common questions" },
        { icon: Bot, text: "AI Search finds answers instantly" },
        { icon: MessageSquare, text: "Fallback to Chat when AI can't answer" },
        { icon: Users, text: "Contact Card provides direct access" },
      ],
    },
    leadgen: {
      title1: "Capture leads",
      title2: "on autopilot",
      description: "Turn every visit into a potential customer. Collect emails, qualify prospects, and grow your pipeline — without lifting a finger.",
      bullets: ["Grow your email list effortlessly", "Qualify leads with AI", "Never miss a prospect"],
      features: [
        { icon: MessageSquare, text: "Chat Widget captures visitor info naturally" },
        { icon: Bot, text: "AI Agent qualifies leads automatically" },
        { icon: Target, text: "Smart CTAs trigger at the right moment" },
        { icon: BarChart3, text: "Analytics tracks every conversion" },
      ],
    },
    engagement: {
      title1: "Keep visitors engaged,",
      title2: "longer",
      description: "Use proactive messages, social proof, and interactive content to turn passive visitors into active participants.",
      bullets: ["Increase time on site", "Build social proof", "Drive repeat visits"],
      features: [
        { icon: MessageSquare, text: "Welcome Messages greet every visitor" },
        { icon: Users, text: "Google Reviews build instant trust" },
        { icon: ShoppingBag, text: "Instagram Feed showcases your brand" },
        { icon: Zap, text: "WhatsApp Link keeps conversations going" },
      ],
    },
  },
  it: {
    support: {
      title1: "Rispondi alle domande",
      title2: "all'istante",
      description: "Offri ai tuoi visitatori supporto 24/7 con chat AI, FAQ intelligenti e escalation automatica al tuo team.",
      bullets: ["Riduci i ticket del 40%", "Risposte AI istantanee", "Passaggio umano senza frizioni"],
      features: [
        { icon: Bot, text: "L'agente AI risponde alle domande comuni" },
        { icon: MessageSquare, text: "La chat live connette i visitatori al team" },
        { icon: HelpCircle, text: "Il widget FAQ offre self-service istantaneo" },
        { icon: Zap, text: "Lo smart routing gestisce i casi complessi" },
      ],
    },
    sales: {
      title1: "Converti i visitatori",
      title2: "in acquirenti",
      description: "Mostra prodotti, cattura lead e guida i visitatori nel tuo funnel — tutto da un singolo widget.",
      bullets: ["Aumenta le conversioni del 30%", "Mostra i prodotti in modo spettacolare", "Cattura lead in automatico"],
      features: [
        { icon: ShoppingBag, text: "Il carosello prodotti evidenzia i bestseller" },
        { icon: MessageSquare, text: "La chat cattura l'intento d'acquisto" },
        { icon: BarChart3, text: "Le analytics tracciano le conversioni" },
        { icon: Zap, text: "Le CTA intelligenti guidano all'azione" },
      ],
    },
    selfservice: {
      title1: "Permetti ai visitatori di",
      title2: "trovare le risposte da soli",
      description: "Lascia che i clienti trovino risposte senza aspettare. FAQ organizzate riducono le frizioni e costruiscono fiducia.",
      bullets: ["Disponibile 24/7 su ogni pagina", "Riduci le domande ripetitive", "Migliora la soddisfazione cliente"],
      features: [
        { icon: HelpCircle, text: "La sezione FAQ organizza le domande comuni" },
        { icon: Bot, text: "La ricerca AI trova risposte all'istante" },
        { icon: MessageSquare, text: "Fallback alla chat quando l'AI non può rispondere" },
        { icon: Users, text: "La scheda contatto offre accesso diretto" },
      ],
    },
    leadgen: {
      title1: "Cattura lead",
      title2: "in automatico",
      description: "Trasforma ogni visita in un potenziale cliente. Raccogli email, qualifica i prospect e fai crescere la tua pipeline — senza muovere un dito.",
      bullets: ["Fai crescere la tua mailing list", "Qualifica i lead con l'AI", "Non perdere mai un prospect"],
      features: [
        { icon: MessageSquare, text: "La chat raccoglie le info dei visitatori" },
        { icon: Bot, text: "L'agente AI qualifica i lead automaticamente" },
        { icon: Target, text: "Le CTA intelligenti si attivano al momento giusto" },
        { icon: BarChart3, text: "Le analytics tracciano ogni conversione" },
      ],
    },
    engagement: {
      title1: "Tieni i visitatori coinvolti,",
      title2: "più a lungo",
      description: "Usa messaggi proattivi, social proof e contenuti interattivi per trasformare visitatori passivi in partecipanti attivi.",
      bullets: ["Aumenta il tempo sul sito", "Costruisci social proof", "Genera visite ricorrenti"],
      features: [
        { icon: MessageSquare, text: "I messaggi di benvenuto accolgono ogni visitatore" },
        { icon: Users, text: "Le recensioni Google costruiscono fiducia" },
        { icon: ShoppingBag, text: "Il feed Instagram mostra il tuo brand" },
        { icon: Zap, text: "Il link WhatsApp mantiene vive le conversazioni" },
      ],
    },
  },
};

const tabLabels: Record<string, Record<TabId, string>> = {
  en: { support: "Support", sales: "Sales", leadgen: "Lead Generation", selfservice: "Self-Service", engagement: "Engagement" },
  it: { support: "Supporto", sales: "Vendite", leadgen: "Lead Generation", selfservice: "Self-Service", engagement: "Coinvolgimento" },
  de: { support: "Support", sales: "Vertrieb", leadgen: "Lead-Generierung", selfservice: "Self-Service", engagement: "Engagement" },
  fr: { support: "Support", sales: "Ventes", leadgen: "Génération de leads", selfservice: "Libre-service", engagement: "Engagement" },
};

const sectionTitle: Record<string, { before: string; accent: string; after: string; sub: string }> = {
  en: { before: "Website widgets that ", accent: "convert", after: ", not just replies.", sub: "One platform, endless use cases. Powered by Widjet." },
  it: { before: "Widget che ", accent: "convertono", after: ", non solo rispondono.", sub: "Una piattaforma, infiniti casi d'uso. Powered by Widjet." },
  de: { before: "Website-Widgets, die ", accent: "konvertieren", after: ", nicht nur antworten.", sub: "Eine Plattform, unendlich viele Anwendungsfälle." },
  fr: { before: "Des widgets qui ", accent: "convertissent", after: ", pas seulement répondent.", sub: "Une plateforme, des cas d'utilisation infinis." },
};

const Solutions = () => {
  const { lang } = useLandingLang();
  const [activeTab, setActiveTab] = useState<TabId>("support");

  const contents = tabContents[lang] || tabContents.en;
  const labels = tabLabels[lang] || tabLabels.en;
  const title = sectionTitle[lang] || sectionTitle.en;
  const active = contents[activeTab];

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {title.before}<em className="italic" style={{ color: 'hsl(270, 80%, 50%)' }}>{title.accent}</em>{title.after}
          </h2>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">{title.sub}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center rounded-full border-2 px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-[hsl(270,80%,70%)] hover:text-foreground"
              }`}
              style={activeTab === tab.id ? { borderColor: 'hsl(270, 80%, 50%)', backgroundColor: 'hsl(270, 80%, 96%)', color: 'hsl(270, 80%, 50%)' } : {}}
            >
              {labels[tab.id]}
            </button>
          ))}
        </div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              {/* Left - headline + description */}
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {active.title1}
                  <br />
                  <span className="text-muted-foreground">{active.title2}</span>
                </h3>
                <p className="mt-4 text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
                  {active.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {active.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg"
                  >
                    {lang === "it" ? "Inizia Gratis" : "Get Started"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right - feature cards */}
              <div className="flex-1 flex flex-col gap-3">
                {active.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 md:p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm md:text-base font-medium text-foreground">{f.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Solutions;
