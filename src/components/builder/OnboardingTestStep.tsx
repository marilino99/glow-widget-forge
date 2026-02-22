import { Copy, MoreVertical } from "lucide-react";

interface OnboardingTestStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
}

const OnboardingTestStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 4,
}: OnboardingTestStepProps) => {
  const exampleQuestions = [
    "What sizes are available for rings?",
    "How can I track my order?",
    "What is your return policy?",
  ];

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
      <div className="flex flex-1 overflow-hidden px-10 gap-6">
        {/* Left: Chat preview */}
        <div className="flex-1 flex flex-col max-w-[580px]">
          <div className="rounded-2xl bg-white border border-[#eaedf5] shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#eaedf5]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4361ee] text-white text-sm font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">AI Agent</p>
                  <p className="text-xs text-[#8a8fa8]">Active now</p>
                </div>
              </div>
              <button className="text-[#b0b4c8]">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Chat body */}
            <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto">
              <div>
                {/* Today label */}
                <div className="flex justify-center mb-4">
                  <span className="rounded-full border border-[#e0e3ef] px-4 py-1 text-xs text-[#8a8fa8]">
                    Today
                  </span>
                </div>

                {/* Bot message */}
                <div className="flex items-end gap-2 mb-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4361ee] text-white text-[10px] font-bold">
                    A
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-[#f0f2f5] px-4 py-3 max-w-[320px]">
                    <p className="text-sm text-[#1a1a2e] leading-relaxed">
                      Welcome! 👋{"\n"}I'm AI Agent's AI Agent, here to assist with any questions you have. How can I help you today?
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-[#b0b4c8] ml-9 mb-6">Just now</p>
              </div>

              {/* Suggested questions */}
              <div className="flex flex-col items-end gap-2 mt-auto">
                <button
                  className="rounded-full border px-4 py-2 text-xs font-medium"
                  style={{ borderColor: "#4361ee", color: "#4361ee" }}
                >
                  What are your payment methods?
                </button>
                <button
                  className="rounded-full border px-4 py-2 text-xs font-medium"
                  style={{ borderColor: "#4361ee", color: "#4361ee" }}
                >
                  How do I request a return?
                </button>
                <button
                  className="rounded-full border px-4 py-2 text-xs font-medium"
                  style={{ borderColor: "#4361ee", color: "#4361ee" }}
                >
                  I have another question
                </button>
              </div>
            </div>

            {/* Powered by */}
            <div className="flex items-center justify-center gap-1 py-2 text-[10px] text-[#b0b4c8]">
              Powered by Widjet
            </div>
          </div>
        </div>

        {/* Right: Instructions + examples */}
        <div className="flex-1 flex flex-col justify-center pl-6">
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-4">
            Test Before Going Live
          </h1>
          <p className="text-[#8a8fa8] text-base leading-relaxed mb-10 max-w-md">
            Test your AI agent to make sure it works perfectly. Once ready press the next button to finalize the launch and go live.
          </p>

          <p className="text-sm font-medium text-[#1a1a2e] mb-4">
            Try the examples below:
          </p>

          <div className="space-y-3 max-w-md">
            {exampleQuestions.map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-[#e0e3ef] bg-white px-5 py-3.5"
              >
                <span className="text-sm text-[#1a1a2e]">{q}</span>
                <button className="text-[#b0b4c8] hover:text-[#6a6f88] ml-3 shrink-0">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Decorative arrow */}
          <div className="mt-6 flex items-center gap-1 text-[#4361ee] opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            <span className="text-2xl tracking-widest">••••</span>
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
          className="rounded-xl bg-[#4361ee] px-10 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#3a56d4]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingTestStep;
