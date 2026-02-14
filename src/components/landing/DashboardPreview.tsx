import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Full atmosphere canvas — stacked radial glows */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 45% 60% at 50% 35%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.3) 50%, transparent 80%),
            radial-gradient(ellipse 70% 55% at 15% 20%, rgba(123,92,255,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 55% at 85% 20%, rgba(123,92,255,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 90% 70% at 50% 10%, rgba(90,50,200,0.4) 0%, transparent 65%),
            radial-gradient(ellipse 120% 80% at 50% 0%, #1a0f3c 0%, #110c29 30%, transparent 70%)
          `,
        }}
      />
      {/* Extra soft blur glow orb — center light bloom */}
      <div
        className="pointer-events-none absolute left-1/2 top-[15%] -translate-x-1/2 h-[500px] w-[600px]"
        aria-hidden
        style={{
          background: "radial-gradient(circle, rgba(200,180,255,0.35) 0%, transparent 70%)",
          filter: "blur(80px)",
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
