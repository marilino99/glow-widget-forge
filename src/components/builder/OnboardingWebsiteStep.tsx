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
      <div className="flex items-center justify-center pt-8 pb-4 sm:pt-12 sm:pb-8 px-6">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isPast = stepNum < currentStep;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="h-[2px] w-12 sm:w-24"
                  style={{ backgroundColor: isPast ? "#7c3aed" : "#e5e7eb" }}
                />
              )}
              <div
                className="flex items-center justify-center rounded-full font-bold transition-all"
                style={{
                  width: isActive ? "36px" : "12px",
                  height: isActive ? "36px" : "12px",
                  backgroundColor: isActive ? "#7c3aed" : isPast ? "#7c3aed" : "#e5e7eb",
                  color: isActive ? "#fff" : "transparent",
                  fontSize: isActive ? "14px" : "0",
                }}
              >
                {isActive ? stepNum : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-4 sm:px-6 pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-3 sm:mb-4 text-center">
          What's your website address?
        </h1>
        <p className="max-w-lg text-center text-[#8a8fa8] text-sm sm:text-base leading-relaxed mb-8 sm:mb-10">
          Provide your website URL to help train your AI agent. We'll start by pulling in key data to get your chatbot ready in minutes.
        </p>
        <input
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="Enter your website address"
          className="w-full max-w-lg rounded-xl border border-[#e0e3ef] bg-white px-4 sm:px-5 py-3.5 sm:py-4 text-base text-[#1a1a2e] placeholder-[#b0b4c8] outline-none transition-all focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 px-4 sm:px-10 py-4 sm:py-8 shrink-0">
        <button
          onClick={onSkip}
          className="order-2 sm:order-1 text-[14px] sm:text-[15px] text-[#8a8fa8] hover:text-[#6a6f88] transition-colors"
        >
          You can complete this step later
        </button>
        <button
          onClick={handleNext}
          className="order-1 sm:order-2 w-full sm:w-auto rounded-xl bg-[#7c3aed] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#6d28d9]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingWebsiteStep;
