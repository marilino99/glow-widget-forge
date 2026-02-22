import { useState } from "react";

interface OnboardingWebsiteStepProps {
  onNext: (websiteUrl: string) => void;
  onSkip: () => void;
  totalSteps?: number;
  currentStep?: number;
}

const OnboardingWebsiteStep = ({
  onNext,
  onSkip,
  totalSteps = 4,
  currentStep = 1,
}: OnboardingWebsiteStepProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");

  const handleNext = () => {
    onNext(websiteUrl.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)" }}>
      {/* Stepper */}
      <div className="flex items-center justify-center pt-12 pb-8">
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

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-8">
        <h1 className="text-3xl font-bold text-[#1a1a2e] mb-4 text-center">
          What's your website address?
        </h1>
        <p className="max-w-lg text-center text-[#8a8fa8] text-base leading-relaxed mb-10">
          Provide your website URL to help train your AI agent. We'll start by pulling in key data to get your chatbot ready in minutes.
        </p>
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="Enter your website address"
          className="w-full max-w-lg rounded-xl border border-[#e0e3ef] bg-white px-5 py-4 text-base text-[#1a1a2e] placeholder-[#b0b4c8] outline-none transition-all focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-4 px-10 py-8">
        <button
          onClick={onSkip}
          className="text-[15px] text-[#8a8fa8] hover:text-[#6a6f88] transition-colors"
        >
          You can complete this step later
        </button>
        <button
          onClick={handleNext}
          className="rounded-xl bg-[#7c3aed] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#6d28d9]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingWebsiteStep;
