import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Paintbrush, Bot, Zap } from "lucide-react";
import dashboardImg from "@/assets/dashboard-preview.png";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const tabs = [
  { id: "conversations", icon: MessageSquare },
  { id: "contacts", icon: Users },
  { id: "appearance", icon: Paintbrush },
  { id: "chatbot", icon: Bot },
  { id: "actions", icon: Zap },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabLabels: Record<string, Record<TabId, string>> = {
  en: { conversations: "Conversations", contacts: "Contacts", appearance: "Appearance", chatbot: "AI Chatbot", actions: "Actions" },
  it: { conversations: "Conversazioni", contacts: "Contatti", appearance: "Aspetto", chatbot: "AI Chatbot", actions: "Azioni" },
  de: { conversations: "Gespräche", contacts: "Kontakte", appearance: "Aussehen", chatbot: "AI Chatbot", actions: "Aktionen" },
  fr: { conversations: "Conversations", contacts: "Contacts", appearance: "Apparence", chatbot: "AI Chatbot", actions: "Actions" },
};

const DashboardPreview = () => {
  const { t, lang } = useLandingLang();
  const [activeTab, setActiveTab] = useState<TabId>("conversations");
  const labels = tabLabels[lang] || tabLabels.en;

  return (
    <section id="dashboard" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl bg-[#110c29] text-white overflow-hidden px-6 pt-16 pb-24">
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] -translate-y-1/2" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
              <span className="relative inline-flex items-center justify-center rounded-full px-8 py-2.5 bg-transparent">
                <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,66,0.35), rgba(224,90,138,0.3), rgba(162,89,230,0.35), rgba(106,140,239,0.3))', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1.5px' }} />
                <span className="text-sm font-medium uppercase tracking-widest" style={{ backgroundImage: 'linear-gradient(90deg, #f59e42 0%, #e05a8a 35%, #a259e6 65%, #6a8cef 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t("dashboard.label")}</span>
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] md:text-5xl">{t("dashboard.title")}</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">{t("dashboard.desc")}</p>
            </motion.div>

            {/* Tabs - glassmorphic bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }} className="mt-10 flex justify-center">
              <div className="flex w-full justify-between border-b border-white/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "text-white border-b-2 border-white"
                          : "text-white/50 hover:text-white/70"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {labels[tab.id]}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Dashboard image */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mt-10">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(250,85%,65%)] opacity-40 blur-[100px]" />
              </div>
              <div className="relative hero-image-border rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeTab}
                    src={dashboardImg}
                    alt={`Widjet dashboard - ${labels[activeTab]}`}
                    className="w-full rounded-2xl"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
