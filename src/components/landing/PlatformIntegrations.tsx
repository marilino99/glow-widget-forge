import { motion } from "framer-motion";
import { AvatarGroup } from "@/components/ui/avatar-group";

const platformAvatars = [
  {
    src: "https://cdn.worldvectorlogo.com/logos/active-campaign.svg",
    label: "ActiveCampaign",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/zapier-2.svg",
    label: "Zapier",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    label: "Shopify",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/hubspot-1.svg",
    label: "HubSpot",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/wordpress-icon-1.svg",
    label: "WordPress",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/wix-2.svg",
    label: "Wix",
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
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground whitespace-nowrap">
              Make Jetwidget even more powerful by using these tools
            </h2>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <AvatarGroup
              avatars={platformAvatars}
              maxVisible={4}
              size={52}
              overlap={16}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformIntegrations;
