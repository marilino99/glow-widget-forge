import { ExternalLink, BookOpen } from "lucide-react";

interface Integration {
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  available: boolean;
}

const integrations: Integration[] = [
  {
    name: "Shopify",
    description: "Sync your Shopify catalog and let the AI chatbot recommend products.",
    icon: "🛍️",
    iconBg: "bg-[#96bf48]/10",
    available: false,
  },
  {
    name: "WooCommerce",
    description: "Connect your WooCommerce store to auto-import products.",
    icon: "🛒",
    iconBg: "bg-[#7f54b3]/10",
    available: false,
  },
  {
    name: "WhatsApp",
    description: "Chat with customers on WhatsApp — Widjet handles the replies.",
    icon: "💬",
    iconBg: "bg-[#25d366]/10",
    available: true,
  },
  {
    name: "Telegram",
    description: "Let Widjet talk to your customers on Telegram 24/7.",
    icon: "✈️",
    iconBg: "bg-[#0088cc]/10",
    available: false,
  },
  {
    name: "Slack",
    description: "Let your team step in when AI gets stuck — alerts go straight to Slack.",
    icon: "🔔",
    iconBg: "bg-[#4a154b]/10",
    available: false,
  },
  {
    name: "Instagram",
    description: "Use Widjet to answer DMs on Instagram — always-on support.",
    icon: "📸",
    iconBg: "bg-[#e1306c]/10",
    available: true,
  },
  {
    name: "Messenger",
    description: "Your bot answers questions on Messenger — and sends follow-ups.",
    icon: "💭",
    iconBg: "bg-[#0084ff]/10",
    available: false,
  },
  {
    name: "Calendly",
    description: "Let visitors book meetings directly from the chat widget.",
    icon: "📅",
    iconBg: "bg-[#006bff]/10",
    available: false,
  },
  {
    name: "Zapier",
    description: "Connect Widjet to 5,000+ apps with Zapier automations.",
    icon: "⚡",
    iconBg: "bg-[#ff4a00]/10",
    available: false,
  },
];

const IntegrationsPanel = () => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 pt-5 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Empower your bot with AI and other automation capabilities
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm"
            >
              {/* Icon */}
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${integration.iconBg}`}>
                  {integration.icon}
                </div>

                {/* Name */}
                <h3 className="mt-3.5 text-sm font-semibold text-foreground">{integration.name}</h3>

                {/* Description */}
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {integration.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {integration.available ? (
                  <button className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    Connect
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60"
                  >
                    Coming soon
                  </button>
                )}
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <BookOpen className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
