import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, BarChart3, Settings, Sparkles } from "lucide-react";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const i18n: Record<string, {
  headline: string;
  badgeLabel: string;
  badgeTag: string;
  subtitle: string;
  item1: string;
  item2: string;
  item2Desc: string;
  item3: string;
  item4: string;
  mockTitle: string;
  mockMeta1Label: string;
  mockMeta1Value: string;
  mockMeta2Label: string;
  mockMeta2Value: string;
  mockSection1: string;
  mockBullet1: string;
  mockBullet2: string;
  mockSection2: string;
  mockTag1: string;
  mockTag1Count: string;
  mockTag2: string;
  mockTag2Count: string;
  mockTag3: string;
  mockTag3Count: string;
}> = {
  en: {
    headline: "Meet your new 24/7 AI teammates.",
    badgeLabel: "AI Agents",
    badgeTag: "New",
    subtitle: "Automate conversations for your business.",
    item1: "Sales agents",
    item2: "Support agents",
    item2Desc: "Answers questions, resolves issues, and escalates when needed.",
    item3: "Lead generation agents",
    item4: "Create your own",
    mockTitle: "Weekly performance",
    mockMeta1Label: "Handled by",
    mockMeta1Value: "AI Agent",
    mockMeta2Label: "Period",
    mockMeta2Value: "This week",
    mockSection1: "Conversations handled:",
    mockBullet1: "142 visitor questions answered automatically",
    mockBullet2: "23 leads qualified and forwarded to sales",
    mockSection2: "Current status",
    mockTag1: "Queue",
    mockTag1Count: "3",
    mockTag2: "Active",
    mockTag2Count: "8",
    mockTag3: "Resolved",
    mockTag3Count: "131",
  },
  it: {
    headline: "Incontra i tuoi nuovi colleghi AI, attivi 24/7.",
    badgeLabel: "Agenti AI",
    badgeTag: "Nuovo",
    subtitle: "Automatizza le conversazioni per il tuo business.",
    item1: "Agenti di vendita",
    item2: "Agenti di supporto",
    item2Desc: "Risponde alle domande, risolve problemi e scala quando necessario.",
    item3: "Agenti di lead generation",
    item4: "Crea il tuo",
    mockTitle: "Performance settimanale",
    mockMeta1Label: "Gestito da",
    mockMeta1Value: "Agente AI",
    mockMeta2Label: "Periodo",
    mockMeta2Value: "Questa settimana",
    mockSection1: "Conversazioni gestite:",
    mockBullet1: "142 domande dei visitatori risposte automaticamente",
    mockBullet2: "23 lead qualificati e inoltrati alle vendite",
    mockSection2: "Stato attuale",
    mockTag1: "In coda",
    mockTag1Count: "3",
    mockTag2: "Attivi",
    mockTag2Count: "8",
    mockTag3: "Risolti",
    mockTag3Count: "131",
  },
};

const menuItems = (t: typeof i18n.en) => [
  { icon: MessageSquare, label: t.item1, color: "#f59e0b", bg: "#fef3c7" },
  { icon: Settings, label: t.item2, color: "#7c3aed", bg: "#ede9fe", desc: t.item2Desc },
  { icon: BarChart3, label: t.item3, color: "#0d9488", bg: "#ccfbf1" },
  { icon: Sparkles, label: t.item4, color: "#ec4899", bg: "#fce7f3" },
];

const AITeammates = () => {
  const { lang } = useLandingLang();
  const t = i18n[lang] || i18n.en;
  const items = menuItems(t);

  return (
    <section className="px-6 py-16 md:py-24" style={{ backgroundColor: "#f6f5f4" }}>
      <div className="mx-auto max-w-7xl">
        {/* Headline */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-[#1a1a1a] mb-10 md:mb-14"
        >
          {t.headline}
        </motion.h2>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-3xl bg-white overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Left column */}
            <div className="p-8 md:p-10 flex flex-col">
              <div className="mb-1">
                <span className="text-sm font-medium text-[#2a2a2a]">{t.badgeLabel}</span>
                <span className="ml-2 text-xs font-semibold text-[#22c55e]">{t.badgeTag}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-4">{t.subtitle}</h3>
              <a
                href="/signup"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#333] transition-colors mb-8"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </a>

              <div className="mt-auto space-y-0 divide-y divide-[#f0ede8]">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.bg }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{item.label}</p>
                      {item.desc && (
                        <p className="text-xs text-[#888] mt-0.5">{item.desc}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — mockup */}
            <div className="relative bg-[#d4f5ec] p-6 md:p-8 flex items-start justify-center overflow-hidden">
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 space-y-5 mt-4">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccfbf1]">
                  <BarChart3 className="h-6 w-6 text-[#0d9488]" />
                </div>

                {/* Title */}
                <div>
                  <h4 className="text-xl font-bold text-[#1a1a1a]">
                    {t.mockTitle} <span className="text-[#ccc] font-normal">@Today</span>
                  </h4>
                  <div className="flex gap-6 mt-2 text-xs text-[#888]">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide text-[#aaa]">{t.mockMeta1Label}</span>
                      <span className="font-medium text-[#555]">{t.mockMeta1Value}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wide text-[#aaa]">{t.mockMeta2Label}</span>
                      <span className="font-medium text-[#555]">{t.mockMeta2Value}</span>
                    </div>
                  </div>
                </div>

                {/* Section 1 */}
                <div>
                  <h5 className="text-sm font-bold text-[#1a1a1a] mb-2">{t.mockSection1}</h5>
                  <ul className="space-y-1.5">
                    <li className="text-xs text-[#555] flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0" />
                      {t.mockBullet1}
                    </li>
                    <li className="text-xs text-[#555] flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1a1a1a] flex-shrink-0" />
                      {t.mockBullet2}
                    </li>
                  </ul>
                </div>

                <hr className="border-[#f0ede8]" />

                {/* Section 2 — Tags */}
                <div>
                  <h5 className="text-sm font-bold text-[#1a1a1a] mb-3">{t.mockSection2}</h5>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: t.mockTag1, count: t.mockTag1Count, dot: "#a78bfa" },
                      { label: t.mockTag2, count: t.mockTag2Count, dot: "#38bdf8" },
                      { label: t.mockTag3, count: t.mockTag3Count, dot: "#fbbf24" },
                    ].map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-[#555]"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.dot }} />
                        {tag.label}
                        <span className="text-[#aaa] ml-0.5">{tag.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AITeammates;
