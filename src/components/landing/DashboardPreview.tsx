import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Layer 1: Full dark base from Features */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #110c29 0%, #110c29 10%, transparent 100%)",
        }}
      />
      {/* Layer 2: Left purple glow — wide, diffused */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-[700px] w-[55%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 100% 100% at 0% 0%, #3b1f8e 0%, #2a1570 20%, transparent 65%)",
          filter: "blur(60px)",
          opacity: 0.7,
        }}
      />
      {/* Layer 3: Right purple glow — wide, diffused */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-[700px] w-[55%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 100% 100% at 100% 0%, #3b1f8e 0%, #2a1570 20%, transparent 65%)",
          filter: "blur(60px)",
          opacity: 0.7,
        }}
      />
      {/* Layer 4: Center white wash — large, bright, low */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[120px] h-[800px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 80% 65% at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 20%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.3) 60%, transparent 80%)",
          filter: "blur(25px)",
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
