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
