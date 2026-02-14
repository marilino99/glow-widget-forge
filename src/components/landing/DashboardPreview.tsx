import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Strato 1: Base scura solida */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #110c29 0%, #110c29 40%, transparent 100%)",
        }}
      />
      {/* Strato 2: Alone viola centrato */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[80px] h-[600px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, #5b21b6 0%, #3b1d8e 40%, transparent 70%)",
          filter: "blur(20px)",
          opacity: 0.9,
        }}
      />
      {/* Strato 3: Centro bianco puro */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[80px] h-[600px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 45% 40% at 50% 40%, #ffffff 0%, #ffffff 30%, rgba(255,255,255,0.6) 55%, transparent 75%)",
          filter: "blur(8px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-white/70">Dashboard</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            One place for everything
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Manage all your widgets, conversations, and analytics from a single intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <img
            src={dashboardImg}
            alt="Jetwidget dashboard showing widget builder with live preview and chat widget"
            className="w-full rounded-2xl border border-border/60 shadow-2xl shadow-primary/5"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
