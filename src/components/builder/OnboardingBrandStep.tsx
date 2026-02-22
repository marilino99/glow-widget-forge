import { useState, useEffect, useRef } from "react";
import { Upload, X, Minus, Home, MessageCircle, HelpCircle, ArrowRight, Sparkles, ArrowLeft, ArrowUp, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import widjetLogoNavbar from "@/assets/widjet-logo-navbar.png";

interface OnboardingBrandStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
  extractedLogo?: string | null;
  extractedColor?: string | null;
}

// Color helpers (matching WidgetPreviewPanel)
const isLightColor = (hex: string): boolean => {
  const num = parseInt(hex.slice(1), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
};

const darkenHex = (hex: string, percent: number = 10): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const OnboardingBrandStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 3,
  extractedLogo = null,
  extractedColor = null,
}: OnboardingBrandStepProps) => {
  const [brandName, setBrandName] = useState("AI Agent");
  const [brandColor, setBrandColor] = useState(extractedColor || "#2970fe");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome! 👋\nI'm AI Agent's AI Agent, here to assist with any questions you have. How can I help you today?"
  );
  const [suggestedEnabled, setSuggestedEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "What are your payment methods?",
    "How do I request a return?",
    "I have another question",
  ]);
  const [logoPreview, setLogoPreview] = useState<string | null>(extractedLogo);

  // Widget interactivity states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAnimatingCollapse, setIsAnimatingCollapse] = useState(false);
  const [isAnimatingExpand, setIsAnimatingExpand] = useState(false);
  const [showButtonPop, setShowButtonPop] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string; sender: "user" | "bot"}[]>([]);
  const [chatInputValue, setChatInputValue] = useState("");
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extractedLogo && !logoPreview) setLogoPreview(extractedLogo);
  }, [extractedLogo]);

  useEffect(() => {
    if (extractedColor && brandColor === "#2970fe") setBrandColor(extractedColor);
  }, [extractedColor]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const handleCollapse = () => {
    if (isAnimatingCollapse) return;
    setIsAnimatingCollapse(true);
    setTimeout(() => {
      setIsCollapsed(true);
      setIsAnimatingCollapse(false);
      setShowChat(false);
      setShowButtonPop(true);
      setTimeout(() => setShowButtonPop(false), 400);
    }, 250);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    setIsAnimatingExpand(true);
    setTimeout(() => setIsAnimatingExpand(false), 600);
  };

  const handleSendMessage = (text: string) => {
    setChatMessages(prev => [...prev, { text, sender: "user" }]);
    setChatInputValue("");
    // Simulate bot reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: "Thanks for your message! Our team will get back to you soon.", sender: "bot" }]);
    }, 1000);
  };

  // Widget preview derived values
  const buttonTextColor = isLightColor(brandColor) ? "text-slate-900" : "text-white";
  const darkerColor = darkenHex(brandColor, 15);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)",
      }}
    >
      {/* Stepper */}
      <div className="flex items-center justify-center pt-10 pb-6 shrink-0">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isPast = stepNum < currentStep;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="h-[2px] w-24"
                  style={{ backgroundColor: isPast ? "#7c3aed" : "#e5e7eb" }}
                />
              )}
              <div
                className="flex items-center justify-center rounded-full font-bold transition-all"
                style={{
                  width: isActive ? "40px" : "14px",
                  height: isActive ? "40px" : "14px",
                  backgroundColor: isActive ? "#7c3aed" : isPast ? "#7c3aed" : "#e5e7eb",
                  color: isActive ? "#fff" : "transparent",
                  fontSize: isActive ? "16px" : "0",
                }}
              >
                {isActive ? stepNum : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content: two columns */}
      <div className="flex flex-1 overflow-hidden px-10 gap-10">
        {/* Left: Form */}
        <div className="flex-1 overflow-y-auto pr-4 pb-4">
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Brand Your Agent.</h1>
          <p className="text-[#8a8fa8] text-base leading-relaxed mb-8 max-w-lg">
            Give it a name, color, and message — your AI assistant's first impression starts now.
          </p>

          {/* Logo + Brand name row */}
          <div className="flex gap-8 mb-6">
            <div>
              <p className="text-sm font-medium text-[#1a1a2e] mb-2">Logo</p>
              <label className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#d4d8e8] bg-[#f8f9fc] overflow-hidden hover:border-[#7c3aed] transition-colors">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-[#b0b4c8]" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] mb-2">Brand name</p>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-[#e0e3ef] bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] mb-2">Brand color</p>
                <div className="flex items-center gap-2 rounded-xl border border-[#e0e3ef] bg-white px-4 py-3">
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 text-sm text-[#1a1a2e] outline-none bg-transparent"
                  />
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded-full border-0 p-0"
                    style={{ WebkitAppearance: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#1a1a2e] mb-2">Welcome message</p>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#e0e3ef] bg-[#f8f9fc] px-4 py-3 text-sm text-[#1a1a2e] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 resize-none"
            />
          </div>

          {/* Suggested questions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[#1a1a2e]">Suggested questions</p>
              <button
                onClick={() => setSuggestedEnabled(!suggestedEnabled)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ backgroundColor: suggestedEnabled ? "#7c3aed" : "#d4d8e8" }}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ left: suggestedEnabled ? "22px" : "2px" }}
                />
              </button>
            </div>
            <p className="text-xs text-[#8a8fa8] mb-3">
              Help visitors start a conversation by providing quick, one-click questions.
            </p>

            {suggestedEnabled && (
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#b0b4c8] cursor-grab">⠿</span>
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => {
                        const updated = [...suggestions];
                        updated[i] = e.target.value;
                        setSuggestions(updated);
                      }}
                      className="flex-1 rounded-lg border border-[#e0e3ef] bg-white px-3 py-2 text-sm text-[#1a1a2e] outline-none"
                    />
                    <button onClick={() => removeSuggestion(i)} className="text-[#b0b4c8] hover:text-[#6a6f88]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Widget Preview */}
        <div className="w-[380px] shrink-0 flex flex-col items-center justify-center">
          <div className="w-[350px]">
            {isCollapsed && !isAnimatingCollapse ? (
              /* Collapsed: show only launcher button */
              <div className="flex flex-col items-end">
                <button
                  onClick={handleExpand}
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors overflow-hidden ${showButtonPop ? 'animate-button-pop' : ''}`}
                  style={{ backgroundColor: brandColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkerColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandColor)}
                >
                  <HelpCircle className={`h-7 w-7 ${buttonTextColor}`} />
                </button>
              </div>
            ) : showChat ? (
              /* Chat View */
              <div
                className={`flex flex-col h-[540px] overflow-hidden rounded-2xl shadow-2xl ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`}
                style={{ backgroundColor: "#ffffff" }}
              >
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <button
                    onClick={() => setShowChat(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-700" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                      {brandName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-tight text-slate-900">{brandName || "AI Agent"}</span>
                      <span className="text-xs leading-tight text-slate-500">The team can also help</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCollapse}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300"
                  >
                    <X className="h-4 w-4 text-slate-700" />
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
                  {/* Welcome message */}
                  <div className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                      {brandName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="rounded-2xl px-4 py-3 text-white text-sm" style={{ backgroundColor: brandColor }}>
                      How can I help you today?
                    </div>
                  </div>

                  {chatMessages.map((msg, index) =>
                    msg.sender === "user" ? (
                      <div key={index} className="flex justify-end mt-3">
                        <div className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-white text-sm" style={{ backgroundColor: brandColor }}>
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="flex items-start gap-2 mt-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                          {brandName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="rounded-2xl px-4 py-3 text-white text-sm max-w-[80%]" style={{ backgroundColor: brandColor }}>
                          {msg.text}
                        </div>
                      </div>
                    )
                  )}
                  <div ref={chatEndRef} />
                  <div className="flex-1" />
                </div>

                {/* Chat input */}
                <div className="px-4 py-3">
                  <div
                    className="flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-200 border-slate-200 bg-slate-50"
                    style={chatInputFocused ? { borderColor: brandColor, boxShadow: `0 0 0 2px ${brandColor}25` } : {}}
                  >
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onFocus={() => setChatInputFocused(true)}
                      onBlur={() => setChatInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatInputValue.trim()) {
                          handleSendMessage(chatInputValue.trim());
                        }
                      }}
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 text-slate-900"
                    />
                    <button
                      onClick={() => {
                        if (chatInputValue.trim()) handleSendMessage(chatInputValue.trim());
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                        chatInputValue.trim() ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                      style={chatInputValue.trim() ? { backgroundColor: brandColor } : {}}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Powered by */}
                <div className="flex items-center justify-center gap-1 py-2 shrink-0">
                  <span className="text-[10px] text-slate-400">Powered by</span>
                  <img src={widjetLogoNavbar} alt="Widjet" className="h-4 w-auto -ml-1.5 opacity-40" />
                </div>
              </div>
            ) : (
              /* Home View (expanded popup) */
              <div
                className={`flex flex-col h-[540px] overflow-hidden rounded-2xl shadow-2xl ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`}
                style={{ backgroundColor: "#f8f8f8" }}
              >
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto relative" style={{ backgroundColor: "#f8f8f8" }}>
                  {/* Gradient overlay */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-64 z-0"
                    style={{
                      background: `linear-gradient(180deg, ${brandColor}70 0%, ${brandColor}38 45%, transparent 100%)`,
                    }}
                  />

                  {/* Header */}
                  <div className="relative overflow-hidden px-6 py-5 z-[1]">
                    <div
                      className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
                      style={{
                        background: `radial-gradient(circle, ${brandColor}45, ${brandColor}18)`,
                      }}
                    />
                    <button
                      onClick={handleCollapse}
                      className="absolute right-4 top-4 text-slate-400 hover:opacity-80"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo" className="relative h-8 w-auto object-contain mb-3" />
                    )}
                    <h3 className="relative text-2xl font-bold text-slate-900 whitespace-pre-line max-w-[70%] break-words">
                      {welcomeMessage.split("\n")[0] || "Hello! 👋"}
                    </h3>
                  </div>

                  {/* Contact section */}
                  <div className="mx-4 rounded-xl p-4 bg-white z-[1] relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                        {brandName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">{brandName || "AI Agent"}</p>
                        <p className="text-sm text-slate-900">Write to us</p>
                      </div>
                    </div>
                    <Button
                      className={`mt-3 w-full ${buttonTextColor}`}
                      style={{ backgroundColor: brandColor }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkerColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brandColor)}
                      onClick={() => setShowChat(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Contact us
                    </Button>
                  </div>

                  {/* FAQ Section */}
                  {suggestedEnabled && suggestions.filter((s) => s.trim()).length > 0 && (
                    <div className="px-4 pb-4 mt-4" style={{ backgroundColor: "#f8f8f8" }}>
                      <div className="rounded-2xl p-4 bg-white">
                        <div className="mb-3 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-900">Quick answers</span>
                        </div>
                        <div className="space-y-1">
                          {suggestions
                            .filter((s) => s.trim())
                            .map((s, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setShowChat(true);
                                  setTimeout(() => handleSendMessage(s), 100);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100"
                              >
                                <span className="font-medium">{s}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom nav */}
                <div className="px-4 pb-1 pt-3 shrink-0" style={{ backgroundColor: "#f8f8f8" }}>
                  <div className="flex rounded-2xl backdrop-blur-md bg-white/70 shadow-sm">
                    <button className="flex flex-1 flex-col items-center gap-1 py-3 text-slate-900">
                      <Home className="h-5 w-5" />
                      <span className="text-xs">Home</span>
                    </button>
                    <button
                      onClick={() => setShowChat(true)}
                      className="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-xs">Contact</span>
                    </button>
                  </div>
                </div>

                {/* Powered by */}
                <div className="flex items-center justify-center gap-1 py-2 shrink-0" style={{ backgroundColor: "#f8f8f8" }}>
                  <span className="text-[10px] text-slate-400">Powered by</span>
                  <img src={widjetLogoNavbar} alt="Widjet" className="h-4 w-auto -ml-1.5 opacity-40" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-6 shrink-0">
        <button
          onClick={onBack}
          className="rounded-xl border border-[#e0e3ef] bg-white px-8 py-3 text-[15px] font-semibold text-[#1a1a2e] transition-all hover:bg-[#f8f9fc]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-[#7c3aed] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#6d28d9]"
        >
          Skip Customization
        </button>
      </div>
    </div>
  );
};

export default OnboardingBrandStep;
