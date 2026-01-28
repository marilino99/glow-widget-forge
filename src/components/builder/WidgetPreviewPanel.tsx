import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Home, MessageCircle, HelpCircle, ChevronDown, ArrowLeft, MoreHorizontal, Smile, ArrowUp, Sparkles } from "lucide-react";

interface WidgetPreviewPanelProps {
  selectedAvatar?: string | null;
  faqEnabled?: boolean;
  contactName?: string;
  offerHelp?: string;
  widgetTheme?: "light" | "dark";
  widgetColor?: string;
}

const WidgetPreviewPanel = ({ 
  selectedAvatar, 
  faqEnabled = true,
  contactName = "ciao",
  offerHelp = "Write to us",
  widgetTheme = "dark",
  widgetColor = "blue"
}: WidgetPreviewPanelProps) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Theme-based styles
  const isLight = widgetTheme === "light";
  const widgetBg = isLight 
    ? "bg-white" 
    : "bg-gradient-to-br from-slate-800 to-slate-900";
  const widgetText = isLight ? "text-slate-900" : "text-white";
  const widgetSubtext = isLight ? "text-slate-500" : "text-white/60";
  const widgetBorder = isLight ? "border-slate-200" : "border-white/10";
  const widgetCardBg = isLight ? "bg-slate-100" : "bg-slate-700/50";
  const widgetButtonBg = isLight ? "bg-slate-200 hover:bg-slate-300" : "bg-slate-800 hover:bg-slate-700";

  return (
    <div className="flex h-full flex-col bg-muted/50 p-6">
      {/* Browser mockup */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Browser header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
            <div className="h-3 w-3 rounded-full bg-green-400/60" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Previewing</span>
            <Input
              placeholder="Your website URL"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="h-8 w-64 bg-background text-sm"
            />
            <Button size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-20" />
        </div>

        {/* Preview content area */}
        <div className="relative flex-1 bg-muted/30 p-8">
          {/* Skeleton placeholder for website */}
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-full max-w-md rounded bg-muted" />
            <div className="h-4 w-3/4 max-w-sm rounded bg-muted" />
            <div className="mt-8 h-32 w-full max-w-lg rounded bg-muted" />
            <div className="h-4 w-full max-w-md rounded bg-muted" />
            <div className="h-4 w-2/3 max-w-sm rounded bg-muted" />
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
              <div className="h-24 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>

          {/* Widget preview in bottom-right */}
          <div className="absolute bottom-6 right-6 w-80">
            {showChat ? (
              /* Chat View */
              <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl">
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowChat(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">Assistenza 24/7</span>
                  </div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700">
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3">
                      <p className="text-sm">Benvenuto/a! In che modo posso esserti utile?</p>
                    </div>
                  </div>
                </div>

                {/* Chat input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex items-center gap-2 rounded-full border border-violet-500/50 bg-slate-800/50 px-4 py-2">
                    <input
                      type="text"
                      placeholder="Scrivi un messaggio..."
                      className="flex-1 bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
                    />
                    <button className="text-white/60 hover:text-white">
                      <Smile className="h-5 w-5" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Powered by */}
                <div className="border-t border-white/10 py-2 text-center">
                  <span className="text-xs text-white/40">
                    Powered by <span className="font-medium">WidgetPop</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Home View */
              <div className={`overflow-hidden rounded-2xl shadow-2xl ${widgetBg} ${widgetText}`}>
                {/* Widget header with gradient */}
                <div className="relative overflow-hidden px-6 py-5">
                  {!isLight && (
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 blur-2xl" />
                  )}
                  <button className={`absolute right-4 top-4 ${widgetSubtext} hover:opacity-80`}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <h3 className="relative text-2xl font-bold">
                    Hello, nice to
                    <br />
                    see you here 👋
                  </h3>
                </div>

                {/* Contact section */}
                <div className={`mx-4 mb-4 rounded-xl p-4 ${widgetCardBg}`}>
                  <div className="flex items-center gap-3">
                    {selectedAvatar ? (
                      <img
                        src={selectedAvatar}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-900">
                        C
                      </div>
                    )}
                  <div className="flex-1">
                    <p className={`text-xs ${widgetSubtext}`}>{contactName}</p>
                    <p className="text-sm">{offerHelp}</p>
                  </div>
                  </div>
                  <Button 
                    className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                    onClick={() => setShowChat(true)}
                  >
                    Contact us
                  </Button>
                </div>

                {/* Quick answers section */}
                {faqEnabled && (
                  <div className={`border-t px-4 py-4 ${widgetBorder}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <HelpCircle className={`h-4 w-4 ${widgetSubtext}`} />
                      <span className="text-sm font-medium">Quick answers</span>
                    </div>
                    <div className="space-y-1">
                      <button className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${isLight ? "hover:bg-slate-100" : "hover:bg-white/5"}`}>
                        <span>What is the delivery time?</span>
                        <ChevronDown className={`h-4 w-4 ${widgetSubtext}`} />
                      </button>
                      <button className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${isLight ? "hover:bg-slate-100" : "hover:bg-white/5"}`}>
                        <span>Do you ship internationally?</span>
                        <ChevronDown className={`h-4 w-4 ${widgetSubtext}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer nav */}
                <div className={`flex border-t ${widgetBorder}`}>
                  <button className={`flex flex-1 flex-col items-center gap-1 py-3 ${widgetText}`}>
                    <Home className="h-5 w-5" />
                    <span className="text-xs">Home</span>
                  </button>
                  <button 
                    className={`flex flex-1 flex-col items-center gap-1 py-3 ${widgetSubtext} hover:opacity-80`}
                    onClick={() => setShowChat(true)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">Contact</span>
                  </button>
                </div>

                {/* Powered by */}
                <div className={`border-t py-2 text-center ${widgetBorder}`}>
                  <span className={`text-xs ${widgetSubtext}`}>
                    Powered by <span className="font-medium">WidgetPop</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreviewPanel;
