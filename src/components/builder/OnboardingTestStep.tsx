import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingTestStepProps {
  onNext: () => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
  widgetId?: string;
}

const OnboardingTestStep = ({
  onNext,
  onBack,
  totalSteps = 4,
  currentStep = 4,
  widgetId,
}: OnboardingTestStepProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const widgetLoaderUrl = `${supabaseUrl}/functions/v1/widget-loader`;

  const embedCode = widgetId
    ? `<script async src="${widgetLoaderUrl}" data-id="${widgetId}"></script>`
    : `<!-- Widget ID not yet available -->`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-6">
        <div className="max-w-xl w-full space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e] mb-3">
              🎉 Your AI Agent is ready!
            </h1>
            <p className="text-[#8a8fa8] text-base leading-relaxed">
              Test your AI Agent to make sure it works perfectly. When you're satisfied, copy the code below and paste it before the closing{" "}
              <code className="text-[#7c3aed] font-mono">&lt;/body&gt;</code> tag on your website to activate it.
            </p>
          </div>

          {/* Code snippet */}
          <div className="rounded-2xl border border-[#e0e3ef] bg-[#fafbff] px-6 py-5 flex items-start justify-between gap-4">
            <pre className="text-sm text-[#1a1a2e] font-mono whitespace-pre-wrap break-all leading-relaxed flex-1">
              {embedCode}
            </pre>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-[#e0e3ef] bg-white px-4 py-2 text-sm font-medium text-[#1a1a2e] hover:bg-[#f8f9fc] transition-colors shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Example questions */}
          <div className="space-y-4">
            <p className="text-[#8a8fa8] text-base">
              Go ahead, test your AI agent now. Try the examples below:
            </p>

            <div className="flex flex-col items-center gap-3">
              {exampleQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-full border border-[#e0e3ef] bg-[#fafbff] px-6 py-3"
                  style={{ marginLeft: `${i * 40}px` }}
                >
                  <span className="text-sm text-[#1a1a2e]">{q}</span>
                  <button className="text-[#b0b4c8] hover:text-[#6a6f88] shrink-0">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-3 px-10 py-6 shrink-0">
        <button
          onClick={onBack}
          className="rounded-xl border border-[#e0e3ef] bg-white px-8 py-3 text-[15px] font-semibold text-[#1a1a2e] transition-all hover:bg-[#f8f9fc]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-[#7c3aed] px-10 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#6d28d9]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingTestStep;
