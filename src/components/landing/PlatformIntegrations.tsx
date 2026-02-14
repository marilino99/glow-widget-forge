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
      <div className="mx-auto max-w-4xl px-6 flex justify-center">
        <motion.div
          custom={0}
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
    </section>
  );
};

export default PlatformIntegrations;
