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
      enabled: true,
    },
    {
      type: "featured" as const,
      title: "Help page",
      description: "ChatGPT-style help page, deployed standalone or under a path on your site (/help).",
      gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)",
      enabled: true,
    },
  ];

  const integrations = [
    {
      title: "Email",
      description: "Connect your agent to an email address and let it respond to messages from your customers.",
      badge: "Beta",
      icon: "📧",
      iconBg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      action: "upgrade" as const,
    },
    {
      title: "Slack",
      description: "Connect your agent to Slack, mention it, and have it reply to any message.",
      icon: "💬",
      iconBg: "linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)",
      action: "upgrade" as const,
    },
    {
      title: "WordPress",
      description: "Use the official plugin for WordPress to add the chat widget to your website.",
      icon: "🌐",
      iconBg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      action: "setup" as const,
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
          <h1 className="text-3xl font-bold text-[#1a1a2e] ml-24">All widgets</h1>
        </div>
        <div className="px-36">
        {/* Featured channels - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-2xl border border-[#e0e3ef] bg-white overflow-hidden"
            >
              {/* Preview area */}
              <div
                className="h-48 relative flex items-center justify-center"
                style={{ background: channel.gradient }}
              >
                <div className="bg-[#1a1a2e]/80 rounded-xl px-6 py-4 text-white text-sm backdrop-blur-sm">
                  {channel.title === "Chat widget" ? (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Hi! What can I help you with?</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                      </div>
                      <span className="font-semibold text-[#1a1a2e] bg-white rounded-lg px-4 py-2">How can I help you today?</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Info */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-[#1a1a2e]">{channel.title}</h3>
                  {/* Toggle */}
                  <div className="h-6 w-11 rounded-full bg-green-500 relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all" />
                  </div>
                </div>
                <p className="text-sm text-[#8a8fa8] mb-4">{channel.description}</p>
                <div className="flex items-center justify-end gap-3">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0e3ef] bg-white text-[#8a8fa8] transition-colors hover:bg-[#f8f9fc]">
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-[#e0e3ef] bg-white px-6 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f8f9fc]">
                    Manage
                  </button>
                </div>
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
