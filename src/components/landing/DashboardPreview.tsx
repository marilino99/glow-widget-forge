import { useState } from "react";
import { motion } from "framer-motion";
import { Home, MessageSquare, Users, Paintbrush, Bot, Database } from "lucide-react";
import dashboardImg from "@/assets/dashboard-preview.png";
import conversationsImg from "@/assets/dashboard-conversations.png";
import appearanceImg from "@/assets/dashboard-appearance.png";
import contactsImg from "@/assets/dashboard-contacts.png";
import chatbotImg from "@/assets/dashboard-chatbot.png";
import datasourcesImg from "@/assets/dashboard-datasources.png";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const tabs = [
  { id: "home", icon: Home },
  { id: "conversations", icon: MessageSquare },
  { id: "contacts", icon: Users },
  { id: "appearance", icon: Paintbrush },
  { id: "chatbot", icon: Bot },
  { id: "datasources", icon: Database },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabLabels: Record<string, Record<TabId, string>> = {
  en: { home: "Home", conversations: "Conversations", contacts: "Contacts", appearance: "Appearance", chatbot: "AI Chatbot", datasources: "Data Sources" },
  it: { home: "Home", conversations: "Conversazioni", contacts: "Contatti", appearance: "Aspetto", chatbot: "AI Chatbot", datasources: "Data Sources" },
  de: { home: "Home", conversations: "Gespräche", contacts: "Kontakte", appearance: "Aussehen", chatbot: "AI Chatbot", datasources: "Data Sources" },
  fr: { home: "Home", conversations: "Conversations", contacts: "Contacts", appearance: "Apparence", chatbot: "AI Chatbot", datasources: "Data Sources" },
};

const allImages: { id: TabId; src: string }[] = [
  { id: "home", src: dashboardImg },
  { id: "conversations", src: conversationsImg },
  { id: "contacts", src: contactsImg },
  { id: "appearance", src: appearanceImg },
  { id: "chatbot", src: chatbotImg },
  { id: "datasources", src: datasourcesImg },
];

const DashboardPreview = () => {
  const { t, lang } = useLandingLang();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const labels = tabLabels[lang] || tabLabels.en;

  return (
    <section id="dashboard" className="px-6 py-16 md:py-24" style={{ backgroundColor: '#f6f5f4' }}>
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl bg-[#110c29] text-white overflow-hidden px-6 pt-16 pb-24">
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] -translate-y-1/2" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
              <span className="relative inline-flex items-center justify-center rounded-full px-5 py-1.5 bg-transparent">
                <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,66,0.35), rgba(224,90,138,0.3), rgba(162,89,230,0.35), rgba(106,140,239,0.3))', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1.5px' }} />
                <span className="text-xs font-medium uppercase tracking-widest" style={{ backgroundImage: 'linear-gradient(90deg, #f59e42 0%, #e05a8a 35%, #a259e6 65%, #6a8cef 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t("dashboard.label")}</span>
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] md:text-5xl">{t("dashboard.title")}</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">{t("dashboard.desc")}</p>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }} className="mt-10 flex justify-center">
              <div className="flex w-full justify-between border-b border-white/10 px-8 md:px-16">
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

            {/* Dashboard image – crossfade via stacked images */}
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mt-0">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(250,85%,65%)] opacity-40 blur-[100px]" />
              </div>
              <div className="relative hero-image-border rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative">
                  {allImages.map(({ id, src }, i) => (
                    <img
                      key={id}
                      src={src}
                      alt={`Widjet dashboard - ${labels[id]}`}
                      className={`w-full rounded-2xl transition-opacity duration-300 ease-in-out ${
                        i === 0 ? "relative" : "absolute inset-0"
                      }`}
                      style={{ opacity: activeTab === id ? 1 : 0 }}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
