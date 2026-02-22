import { useState } from "react";
import { Upload, X } from "lucide-react";

interface OnboardingBrandStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
}

const OnboardingBrandStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 3,
}: OnboardingBrandStepProps) => {
  const [brandName, setBrandName] = useState("AI Agent");
  const [brandColor, setBrandColor] = useState("#2970fe");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome! 👋\nI'm AI Agent's AI Agent, here to assist with any questions you have. How can I help you today?"
  );
  const [suggestedEnabled, setSuggestedEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState([
    "What are your payment methods?",
    "How do I request a return?",
    "I have another question",
  ]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
                  className="h-[2px] w-16"
                  style={{ backgroundColor: isPast || isActive ? "#4361ee" : "#d4d8e8" }}
                />
              )}
              <div
                className="flex items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: isActive || isPast ? "#4361ee" : "transparent",
                  color: isActive || isPast ? "#fff" : "#c0c4d8",
                  border: isActive || isPast ? "none" : "2px solid #d4d8e8",
                  width: isPast && !isActive ? "12px" : "32px",
                  height: isPast && !isActive ? "12px" : "32px",
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
            {/* Logo upload */}
            <div>
              <p className="text-sm font-medium text-[#1a1a2e] mb-2">Logo</p>
              <label className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#d4d8e8] bg-[#f8f9fc] overflow-hidden hover:border-[#4361ee] transition-colors">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-[#b0b4c8]" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            {/* Brand name + color */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-[#1a1a2e] mb-2">Brand name</p>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-[#e0e3ef] bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
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
              className="w-full rounded-xl border border-[#e0e3ef] bg-[#f8f9fc] px-4 py-3 text-sm text-[#1a1a2e] outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20 resize-none"
            />
          </div>

          {/* Suggested questions */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-[#1a1a2e]">Suggested questions</p>
              <button
                onClick={() => setSuggestedEnabled(!suggestedEnabled)}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ backgroundColor: suggestedEnabled ? "#4361ee" : "#d4d8e8" }}
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

        {/* Right: Chat preview */}
        <div className="w-[380px] shrink-0 flex flex-col">
          <div className="rounded-2xl bg-white border border-[#eaedf5] shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#eaedf5]">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold overflow-hidden"
                style={{ backgroundColor: brandColor }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  brandName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a1a2e]">{brandName || "AI Agent"}</p>
                <p className="text-xs text-[#8a8fa8]">Active now</p>
              </div>
            </div>

            {/* Chat body */}
            <div className="flex-1 flex flex-col justify-between p-5">
              <div>
                {/* Bot message */}
                <div className="flex items-end gap-2 mb-2">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold overflow-hidden"
                    style={{ backgroundColor: brandColor }}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      brandName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-[#f0f2f5] px-4 py-3 max-w-[240px]">
                    <p className="text-sm text-[#1a1a2e] whitespace-pre-line leading-relaxed">
                      {welcomeMessage}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-[#b0b4c8] ml-9">1 min ago</p>
              </div>

              {/* Suggested questions */}
              {suggestedEnabled && suggestions.length > 0 && (
                <div className="flex flex-col items-end gap-2 mt-4">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="rounded-full border px-4 py-2 text-xs font-medium transition-colors"
                      style={{
                        borderColor: brandColor,
                        color: brandColor,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          className="rounded-xl bg-[#4361ee] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#3a56d4]"
        >
          Skip Customization
        </button>
      </div>
    </div>
  );
};

export default OnboardingBrandStep;
