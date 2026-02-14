import { motion } from "framer-motion";

const platforms = [
  {
    name: "Klaviyo",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
        <path d="M2 4l10 8 10-8v16H2V4z" fill="#24B47E" stroke="#24B47E" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    name: "Zapier",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <path d="M12 2l2.5 5.5H20l-4.5 3.5 1.5 5.5L12 13l-5 3.5 1.5-5.5L4 7.5h5.5z" fill="#FF4A00"/>
      </svg>
    ),
  },
  {
    name: "Shopify",
    icon: (
      <svg viewBox="0 0 109 124" className="h-9 w-9">
        <path fill="#95BF47" d="M74.7 14.8c-.1-.4-.4-.6-.7-.6-.3 0-6.2-.1-6.2-.1s-4.9-4.9-5.4-5.4c-.5-.5-1.5-.3-1.9-.2-.1 0-1 .3-2.7.8C55.6 3.7 52 0 47.3 0c-.4 0-.7 0-1.1.1C44.8-1.4 43-1 41.6 2.4c-3.8 9.6-5.3 17.3-5.9 20.7-6.2 1.9-10.5 3.3-11 3.4-3.4 1.1-3.5 1.2-4 4.4-.3 2.4-9.3 71.7-9.3 71.7l74.2 12.9 32-8c0-.1-42.7-91.7-42.9-92.7z"/>
        <path fill="#5E8E3E" d="M74 14.2c-.3 0-6.2-.1-6.2-.1s-4.9-4.9-5.4-5.4c-.2-.2-.4-.3-.7-.3v96.2l32-8S74.2 14.6 74 14.2z"/>
        <path fill="#FFF" d="M47.3 41.3l-2.9 10.9s-3.2-1.7-7.1-1.4c-5.6.4-5.7 3.9-5.6 4.8.3 5 13.1 6.1 13.8 17.8.5 9.2-4.9 15.5-12.8 16-9.5.6-14.7-5-14.7-5l2-8.5s5.2 3.9 9.4 3.7c2.8-.2 3.8-2.4 3.7-4-.4-6.5-10.8-6.1-11.5-16.9-.5-9.1 5.4-18.3 18.6-19.1 5.1-.3 7.1.7 7.1.7z"/>
      </svg>
    ),
  },
  {
    name: "HubSpot",
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8">
        <path fill="#FF7A59" d="M17.5 8.2V5.7a1.5 1.5 0 0 0 .9-1.4 1.5 1.5 0 1 0-3 0c0 .6.4 1.1.9 1.4v2.5a5.3 5.3 0 0 0-2.5 1.3L6.2 4.1a2 2 0 0 0 .1-.6 1.9 1.9 0 1 0-1.9 1.9c.4 0 .8-.1 1.1-.4l7.5 5.3a5.3 5.3 0 0 0 0 5.4l-2.3 2.3a2.1 2.1 0 0 0-.7-.1 2.2 2.2 0 1 0 2.2 2.2c0-.5-.2-1-.4-1.3l2.1-2.1a5.3 5.3 0 1 0 3.6-8.5z"/>
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const PlatformIntegrations = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="shrink-0"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1">Discover integrations</p>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground max-w-xs">
              Make Jetwidget even more powerful by using these tools
            </h2>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex items-center -space-x-3"
          >
            {platforms.map((platform, i) => (
              <div
                key={platform.name}
                className="flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-card border border-border shadow-sm"
                style={{ zIndex: platforms.length - i }}
              >
                {platform.icon}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformIntegrations;
