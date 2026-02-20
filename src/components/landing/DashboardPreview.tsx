import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const DashboardPreview = () => {
  const { t } = useLandingLang();

  return (
    <section id="dashboard" className="relative px-6 pt-0 pb-24 bg-[#110c29] text-white overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] -translate-y-1/2" />
      </div>
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
          <span className="relative inline-flex items-center justify-center rounded-full px-8 py-2.5 bg-transparent">
            <span className="absolute inset-0 rounded-full p-[1.5px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,66,0.35), rgba(224,90,138,0.3), rgba(162,89,230,0.35), rgba(106,140,239,0.3))', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1.5px' }} />
            <span className="text-sm font-bold uppercase tracking-widest" style={{ backgroundImage: 'linear-gradient(90deg, #f59e42 0%, #e05a8a 35%, #a259e6 65%, #6a8cef 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t("dashboard.label")}</span>
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] md:text-5xl">{t("dashboard.title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">{t("dashboard.desc")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mt-16">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(250,85%,65%)] opacity-40 blur-[100px]" />
          </div>
          <div className="relative hero-image-border rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02]">
            <img src={dashboardImg} alt="Widjet dashboard" className="w-full rounded-2xl" loading="lazy" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
