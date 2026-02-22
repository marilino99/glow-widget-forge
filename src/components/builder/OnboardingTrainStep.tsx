import { useState } from "react";
import { Link2, FileText, MessageCircleQuestion, FilePlus2 } from "lucide-react";

interface OnboardingTrainStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
}

type Tab = "url" | "document" | "faq";

const OnboardingTrainStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 2,
}: OnboardingTrainStepProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("url");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "url", label: "Add website URL", icon: <Link2 className="h-4 w-4" /> },
    { key: "document", label: "Upload document", icon: <FileText className="h-4 w-4" /> },
    { key: "faq", label: "Add FAQs", icon: <MessageCircleQuestion className="h-4 w-4" /> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)",
      }}
    >
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
      <div className="flex flex-1 flex-col items-center px-6 pt-4">
        <h1 className="text-3xl font-bold text-[#1a1a2e] mb-4 text-center">
          Train your AI agent
        </h1>
        <p className="max-w-2xl text-center text-[#8a8fa8] text-base leading-relaxed mb-8">
          Upload your website, docs, PDFs, and knowledge base to train your AI
          agent. The more data sources, the smarter your chatbot. You can add or
          remove sources later.
        </p>

        {/* Tabs */}
        <div className="flex w-full max-w-3xl gap-3 mb-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3.5 text-[14px] font-medium transition-all"
                style={{
                  backgroundColor: isActive ? "#f3f0ff" : "#fff",
                  borderColor: isActive ? "#7c3aed" : "#e0e3ef",
                  color: isActive ? "#7c3aed" : "#6a6f88",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Empty state card */}
        <div className="flex w-full max-w-3xl flex-1 items-center justify-center rounded-2xl bg-[#f8f9fc] border border-[#eaedf5] min-h-[280px]">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-[#eaedf5]">
              <FilePlus2 className="h-6 w-6 text-[#c0c4d8]" />
            </div>
            <p className="text-lg font-semibold text-[#1a1a2e]">
              Add your first training source
            </p>
            <p className="max-w-xs text-sm text-[#8a8fa8] leading-relaxed">
              Start by adding URLs, documents, and frequently asked questions.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-8">
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
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingTrainStep;
