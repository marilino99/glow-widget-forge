import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Aurora: seamless dark→purple nebula→white like Hostinger reference */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            linear-gradient(180deg, #110c29 0%, #110c29 10%, rgba(17,12,41,0.9) 20%, rgba(17,12,41,0) 50%),
            radial-gradient(ellipse 200% 100% at 30% 25%, rgba(124,58,237,0.8) 0%, rgba(109,40,217,0.4) 35%, transparent 65%),
            radial-gradient(ellipse 160% 80% at 75% 30%, rgba(139,92,246,0.5) 0%, rgba(109,40,217,0.2) 40%, transparent 65%),
            radial-gradient(ellipse 100% 60% at 50% 20%, rgba(167,139,250,0.6) 0%, rgba(124,58,237,0.3) 30%, transparent 60%),
            linear-gradient(180deg, transparent 45%, rgba(245,243,255,0.7) 60%, #ffffff 75%)
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
