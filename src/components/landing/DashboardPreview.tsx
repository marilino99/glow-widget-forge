import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Aurora: dark #110c29 top → soft purple nebula → clean white bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            linear-gradient(to bottom, #110c29 0%, #1e1145 12%, transparent 50%),
            radial-gradient(ellipse 100% 50% at 50% 20%, #4c1d95 0%, rgba(109,40,217,0.5) 40%, transparent 80%),
            radial-gradient(ellipse 80% 35% at 25% 18%, rgba(139,92,246,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 80% 35% at 75% 18%, rgba(139,92,246,0.25) 0%, transparent 70%),
            linear-gradient(to bottom, transparent 35%, rgba(245,243,255,0.6) 55%, #ffffff 68%)
          `,
          backgroundColor: '#ffffff',
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
          <span className="text-sm font-medium uppercase tracking-widest text-foreground/50">Dashboard</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            One place for everything
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
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
