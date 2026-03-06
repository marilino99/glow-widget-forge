import { ArrowLeft, Monitor, MessageSquare } from "lucide-react";

interface AllChannelsOverlayProps {
  onClose: () => void;
}

const AllChannelsOverlay = ({ onClose }: AllChannelsOverlayProps) => {
  const channels = [
    {
      type: "featured" as const,
      title: "Chat widget",
      description: "Add a floating chat window to your site.",
      gradient: "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
      icon: "💬",
      enabled: true,
      comingSoon: false,
    },
    {
      type: "featured" as const,
      title: "Help page",
      description: "ChatGPT-style help page, deployed standalone or under a path on your site (/help).",
      gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)",
      icon: "📖",
      enabled: false,
      comingSoon: true,
    },
  ];

  const integrations = [
    {
      title: "Email",
      description: "Connect your agent to an email address and let it respond to messages from your customers.",
      icon: "📧",
      iconBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      comingSoon: true,
    },
    {
      title: "Slack",
      description: "Connect your agent to Slack, mention it, and have it reply to any message.",
      icon: "💬",
      iconBg: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
      comingSoon: true,
    },
    {
      title: "WordPress",
      description: "Use the official plugin for WordPress to add the chat widget to your website.",
      icon: "🌐",
      iconBg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      comingSoon: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)",
      }}
    >
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-12 pb-10 pt-3">
        <div className="flex items-center mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-[#e0e3ef] bg-white px-5 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f8f9fc]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[#1a1a2e] ml-16">All widgets</h1>
        </div>
        <div className="px-16 max-w-5xl mx-auto">
        {/* Featured channels - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-2xl border border-[#e0e3ef] bg-white overflow-hidden flex flex-col"
            >
              {/* Icon area */}
              <div
                className="relative flex items-center justify-center py-10"
                style={{ background: channel.gradient }}
              >
                <span className="text-5xl drop-shadow-md">{channel.icon}</span>
                {channel.enabled && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="px-5 py-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-1.5">{channel.title}</h3>
                <p className="text-sm text-[#8a8fa8] leading-relaxed">{channel.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Integration channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.title}
              className="rounded-2xl border border-[#e0e3ef] bg-white overflow-hidden flex flex-col"
            >
              {/* Icon area */}
              <div
                className="relative flex items-center justify-center py-10"
                style={{ background: integration.iconBg }}
              >
                <span className="text-5xl drop-shadow-md">{integration.icon}</span>
                {integration.badge && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-[#3b82f6] shadow-sm">
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2l1.5 3.5L13 7l-3.5 1.5L8 12l-1.5-3.5L3 7l3.5-1.5z"/></svg>
                    {integration.badge}
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="px-5 py-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-1.5">{integration.title}</h3>
                <p className="text-sm text-[#8a8fa8] leading-relaxed">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AllChannelsOverlay;
