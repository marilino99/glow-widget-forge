import { motion } from "framer-motion";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const tools = [
  { name: "Make", color: "#6d4aff", icon: "𝗠" },
  { name: "Zendesk", color: "#03363d", icon: "⌘" },
  { name: "Notion", color: "#000", icon: "𝗡" },
  { name: "Slack", color: "#4A154B", icon: "⌗" },
  { name: "Stripe", color: "#635BFF", icon: "S" },
  { name: "Salesforce", color: "#00A1E0", icon: "☁" },
  { name: "Cal.com", color: "#292929", icon: "Cal" },
  { name: "Calendly", color: "#006BFF", icon: "◉" },
  { name: "WhatsApp", color: "#25D366", icon: "✆" },
  { name: "Zapier", color: "#FF4A00", icon: "⚡" },
  { name: "Messenger", color: "#0084FF", icon: "✉" },
  { name: "HubSpot", color: "#FF7A59", icon: "⬡" },
];

const i18n: Record<string, { title: string; desc: string }> = {
  en: { title: "Works with your tools", desc: "Integrate diverse data sources to enrich your agent's knowledge and capabilities." },
  it: { title: "Funziona con i tuoi strumenti", desc: "Integra diverse fonti di dati per arricchire le conoscenze e le capacità del tuo agente." },
  de: { title: "Funktioniert mit deinen Tools", desc: "Integriere verschiedene Datenquellen, um das Wissen deines Agenten zu erweitern." },
  fr: { title: "Fonctionne avec vos outils", desc: "Intégrez diverses sources de données pour enrichir les connaissances de votre agent." },
};

const PlatformIntegrations = () => {
  const { lang } = useLandingLang();
  const t = i18n[lang] || i18n.en;

  // Split tools into two rows
  const row1 = tools.slice(0, 6);
  const row2 = tools.slice(6);

  return (
    <section className="py-12 md:py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="rounded-3xl border border-border bg-background p-6 md:p-10"
        >
          {/* Mobile: pills on top, text below */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Desktop: text left */}
            <div className="hidden md:block md:w-[38%] flex-shrink-0">
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t.desc}</p>
            </div>

            {/* Pills — shown first on mobile, right on desktop */}
            <div className="flex-1 space-y-2.5 overflow-hidden order-first md:order-last">
              {[row1, row2].map((row, ri) => (
                <div key={ri} className="flex flex-wrap md:flex-nowrap gap-2.5 md:overflow-x-auto no-scrollbar">
                  {row.map((tool) => (
                    <span
                      key={tool.name}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground whitespace-nowrap flex-shrink-0"
                    >
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.icon}
                      </span>
                      {tool.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile: text below pills */}
            <div className="md:hidden">
              <h3 className="text-xl font-bold text-foreground tracking-tight">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformIntegrations;
