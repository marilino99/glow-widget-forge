import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Home, MessageCircle, HelpCircle, ChevronDown, ArrowLeft, MoreHorizontal, Smile, ArrowUp, Sparkles, Loader2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardData } from "@/types/productCard";

interface WidgetPreviewPanelProps {
  selectedAvatar?: string | null;
  faqEnabled?: boolean;
  contactName?: string;
  offerHelp?: string;
  widgetTheme?: "light" | "dark";
  widgetColor?: string;
  buttonLogo?: string | null;
  productCards?: ProductCardData[];
}

const WidgetPreviewPanel = ({ 
  selectedAvatar, 
  faqEnabled = true,
  contactName = "ciao",
  offerHelp = "Write to us",
  widgetTheme = "dark",
  widgetColor = "blue",
  buttonLogo = null,
  productCards = []
}: WidgetPreviewPanelProps) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [proxyHtml, setProxyHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLoadUrl = async () => {
    if (!previewUrl.trim()) return;
    
    setIsLoading(true);
    setLoadError(null);
    setProxyHtml(null);

    try {
      const { data, error } = await supabase.functions.invoke('proxy-website', {
        body: { url: previewUrl.trim() },
      });

      if (error) {
        console.error('Proxy error:', error);
        setLoadError('Failed to load website');
        return;
      }

      // If it's an error response from the function
      if (typeof data === 'object' && data.error) {
        setLoadError(data.error);
        return;
      }

      setProxyHtml(data);
    } catch (err) {
      console.error('Error loading website:', err);
      setLoadError('Failed to load website');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadUrl();
    }
  };
  // Theme-based styles
  const isLight = widgetTheme === "light";
  const widgetBg = isLight 
    ? "bg-gradient-to-b from-violet-100 via-white to-cyan-50" 
    : "bg-gradient-to-br from-slate-800 to-slate-900";
  const widgetText = isLight ? "text-slate-900" : "text-white";
  const widgetSubtext = isLight ? "text-slate-500" : "text-white/60";
  const widgetBorder = isLight ? "border-slate-200" : "border-white/10";
  const widgetCardBg = isLight ? "bg-white" : "bg-slate-700/50";
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
              onKeyDown={handleKeyDown}
              className="h-8 w-64 bg-background text-sm"
            />
            <Button size="icon" className="h-8 w-8" onClick={handleLoadUrl}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-20" />
        </div>

        {/* Preview content area */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          {isLoading ? (
            /* Loading state */
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading website...</span>
              </div>
            </div>
          ) : loadError ? (
            /* Error state */
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-destructive">{loadError}</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different URL</p>
              </div>
            </div>
          ) : proxyHtml ? (
            /* Iframe with proxied website content - navigation disabled */
            <div className="relative h-full w-full overflow-hidden">
              {/* Overlay to block clicks but allow visual scrolling */}
              <div 
                className="absolute inset-0 z-10 cursor-default" 
                style={{ pointerEvents: 'auto' }}
                onWheel={(e) => {
                  // Forward scroll events to the iframe container
                  const iframeContainer = e.currentTarget.nextElementSibling as HTMLElement;
                  if (iframeContainer) {
                    iframeContainer.scrollTop += e.deltaY;
                    iframeContainer.scrollLeft += e.deltaX;
                  }
                }}
              />
              <div 
                className="h-full w-full overflow-auto"
                style={{ pointerEvents: 'none' }}
              >
                <div 
                  className="origin-top-left"
                  style={{ 
                    width: '177.78%', 
                    height: '177.78%', 
                    transform: 'scale(0.5625)',
                  }}
                >
                  <iframe
                    srcDoc={proxyHtml}
                    className="h-full w-full border-0"
                    title="Website preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Skeleton placeholder for website */
            <div className="space-y-4 p-8">
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
          )}

          {/* Widget preview in bottom-right */}
          <div className="absolute bottom-6 right-6 w-80">
            {isCollapsed ? (
              /* Collapsed Icon */
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg hover:bg-blue-600 transition-colors overflow-hidden"
                >
                  {buttonLogo ? (
                    <img src={buttonLogo} alt="Widget logo" className="h-full w-full object-cover" />
                  ) : (
                    <HelpCircle className="h-7 w-7 text-white" />
                  )}
                </button>
              </div>
            ) : showChat ? (
              /* Chat View */
              <div className={`flex h-[500px] flex-col overflow-hidden rounded-2xl shadow-2xl ${widgetBg} ${widgetText}`}>
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowChat(false)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${widgetCardBg}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">{contactName}</span>
                  </div>
                  <button 
                    onClick={() => setIsCollapsed(true)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 text-white">
                      <p className="text-sm">Benvenuto/a! In che modo posso esserti utile?</p>
                    </div>
                  </div>
                </div>

                {/* Chat input */}
                <div className={`border-t p-4 ${widgetBorder}`}>
                  <div className={`flex items-center gap-2 rounded-full border border-violet-500/50 px-4 py-2 ${isLight ? "bg-white" : "bg-slate-800/50"}`}>
                    <input
                      type="text"
                      placeholder="Scrivi un messaggio..."
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "placeholder:text-slate-400" : "placeholder:text-white/40"}`}
                    />
                    <button className={widgetSubtext}>
                      <Smile className="h-5 w-5" />
                    </button>
                    <button className={`flex h-8 w-8 items-center justify-center rounded-full ${isLight ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Powered by */}
                <div className={`border-t py-2 text-center ${widgetBorder}`}>
                  <span className={`text-xs ${widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Home View */
              <div className={`flex flex-col max-h-[500px] overflow-hidden rounded-2xl shadow-2xl ${widgetBg} ${widgetText}`}>
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                {/* Widget header with gradient */}
                <div className="relative overflow-hidden px-6 py-5">
                  {!isLight && (
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 blur-2xl" />
                  )}
                  <button 
                    onClick={() => setIsCollapsed(true)}
                    className={`absolute right-4 top-4 ${widgetSubtext} hover:opacity-80`}
                  >
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

                {/* Product Cards Section */}
                {productCards.filter(c => !c.isLoading).length > 0 && (
                  <div className="px-4 py-4 space-y-4">
                    {productCards.filter(c => !c.isLoading).map((card) => (
                      <div key={card.id}>
                        {/* Product Image Placeholder - large rounded area */}
                        <div className={`aspect-[4/3] flex items-center justify-center rounded-2xl mb-4 ${isLight ? "bg-slate-200" : "bg-slate-300"}`}>
                          {card.imageUrl ? (
                            <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <Image className="h-12 w-12 text-slate-400" />
                          )}
                        </div>
                        {/* Product Info */}
                        <h4 className="font-bold text-lg mb-3">{card.title}</h4>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-3 text-base font-medium">
                          Show
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

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
                </div>

                {/* Footer nav - rounded dark container */}
                <div className="px-4 pb-3 shrink-0">
                  <div className={`flex rounded-2xl ${isLight ? "bg-slate-100" : "bg-slate-700/80"}`}>
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
                </div>

                {/* Powered by */}
                <div className="py-2 text-center shrink-0">
                  <span className={`text-xs ${widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
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
