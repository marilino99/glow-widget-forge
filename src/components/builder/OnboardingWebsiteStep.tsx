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
                  className="h-[2px] w-16"
                  style={{ backgroundColor: isPast ? "#4361ee" : "#d4d8e8" }}
                />
              )}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: isActive || isPast ? "#4361ee" : "transparent",
                  color: isActive || isPast ? "#fff" : "#c0c4d8",
                  border: isActive || isPast ? "none" : "2px solid #d4d8e8",
                }}
              >
                {isActive || isPast ? stepNum : ""}
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
          className="w-full max-w-lg rounded-xl border border-[#e0e3ef] bg-white px-5 py-4 text-base text-[#1a1a2e] placeholder-[#b0b4c8] outline-none transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
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
          className="rounded-xl bg-[#4361ee] px-8 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#3a56d4]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingWebsiteStep;
