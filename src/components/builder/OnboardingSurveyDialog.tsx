import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Briefcase,
  UtensilsCrossed,
  PenLine,
  MoreHorizontal,
  TrendingUp,
  Headset,
  Users,
  MessageSquare,
  User,
  UsersRound,
  Building2,
  Globe,
  GraduationCap,
  Monitor,
} from "lucide-react";

interface OnboardingSurveyDialogProps {
  open: boolean;
  onComplete: (answers: SurveyAnswers) => void;
}

export interface SurveyAnswers {
  businessType: string;
  mainGoal: string;
  monthlyVisitors: string;
}

const questions = [
  {
    key: "businessType" as const,
    title: "What type of business do you have?",
    subtitle: "Your feedback will help us personalize your experience.",
    selectLabel: "Select only 1",
    options: [
      { label: "E-commerce", icon: ShoppingBag },
      { label: "Services", icon: Briefcase },
      { label: "Software", icon: Monitor },
      { label: "Restaurant", icon: UtensilsCrossed },
      { label: "Small business owner", icon: UsersRound },
      { label: "Student", icon: GraduationCap },
      { label: "Blog", icon: PenLine },
      { label: "Other", icon: MoreHorizontal },
    ],
  },
  {
    key: "mainGoal" as const,
    title: "What is your main goal?",
    subtitle: "Your feedback will help us personalize your experience.",
    selectLabel: "Select only 1",
    options: [
      { label: "Sales", icon: TrendingUp },
      { label: "Support", icon: Headset },
      { label: "Leads", icon: Users },
      { label: "Feedback", icon: MessageSquare },
      { label: "Product promotions", icon: ShoppingBag },
      { label: "Other", icon: MoreHorizontal },
    ],
  },
  {
    key: "monthlyVisitors" as const,
    title: "How many monthly visitors?",
    subtitle: "Your feedback will help us personalize your experience.",
    selectLabel: "Select only 1",
    options: [
      { label: "<1K", icon: User },
      { label: "1K-10K", icon: UsersRound },
      { label: "10K-50K", icon: Building2 },
      { label: "50K+", icon: Globe },
    ],
  },
];

const OnboardingSurveyDialog = ({ open, onComplete }: OnboardingSurveyDialogProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [otherText, setOtherText] = useState("");

  const currentQuestion = questions[step];
  const selectedValue = answers[currentQuestion.key];
  const isLastStep = step === questions.length - 1;
  const showOtherInput = currentQuestion.key === "mainGoal" && selectedValue === "Other";

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.key]: value });
    if (value !== "Other") setOtherText("");
  };

  const handleNext = () => {
    if (!selectedValue) return;
    if (isLastStep) {
      onComplete(answers as SurveyAnswers);
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    onComplete({ businessType: "", mainGoal: "", monthlyVisitors: "" });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-[720px] max-h-[100dvh] sm:max-h-[90vh] border-0 p-0 overflow-hidden [&>button]:hidden z-[60] rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:w-auto"
        overlayClassName="z-[59]"
        style={{ backgroundColor: "#eef0f4" }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Rainbow glow band at top */}
        <div
          className="absolute top-0 left-0 right-0 h-36 pointer-events-none blur-md"
          style={{
            background: "linear-gradient(100deg, #f5d080 0%, #f8b4c8 20%, #d8a0f0 40%, #a0b0f8 60%, #80d8f0 80%, #b0f0c0 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            opacity: 1,
          }}
        />

        <div className="relative flex flex-col h-full sm:h-auto px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8">
          {/* Rainbow glow band at top */}
          <div
            className="absolute top-0 left-0 right-0 h-36 pointer-events-none blur-md"
            style={{
              background: "linear-gradient(100deg, #f5d080 0%, #f8b4c8 20%, #d8a0f0 40%, #a0b0f8 60%, #80d8f0 80%, #b0f0c0 100%)",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              opacity: 1,
            }}
          />

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-6 sm:top-5 sm:right-8 text-[15px] font-semibold transition-colors z-10"
            style={{ color: "#1a1a1a" }}
          >
            Skip
          </button>

          {/* Title area - shrink-0 */}
          <div className="text-center mt-2 mb-4 sm:mb-5 shrink-0 relative z-[1]">
            <h2
              className="text-[22px] sm:text-[28px] font-extrabold leading-tight mb-2"
              style={{ color: "#111" }}
            >
              {currentQuestion.title}
            </h2>
            <p className="text-[14px] sm:text-[15px]" style={{ color: "#999" }}>
              {currentQuestion.subtitle}
            </p>
            <p className="text-[13px] mt-1.5" style={{ color: "#bbb" }}>
              {currentQuestion.selectLabel}
            </p>
          </div>

          {/* Options grid - scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 relative z-[1]">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {currentQuestion.options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedValue === option.label;
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(option.label)}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 rounded-xl px-3 sm:px-5 py-4 sm:py-5 text-left transition-all duration-150",
                      "border-2",
                      isSelected
                        ? "border-[#333] shadow-md"
                        : "border-transparent hover:border-[#ddd]"
                    )}
                    style={{ backgroundColor: "#fff" }}
                  >
                    <div
                      className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: isSelected ? "#e0f2f7" : "#f0f4f8" }}
                    >
                      <Icon
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        style={{ color: "#3fb5c5" }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span
                      className="text-[13px] sm:text-[15px] font-semibold leading-tight"
                      style={{ color: "#222" }}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Other input box */}
            {showOtherInput && (
              <div className="mt-4">
                <p className="text-[15px] mb-2" style={{ color: "#333" }}>
                  Describe what you would like to use Widjet for
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value.slice(0, 50))}
                    maxLength={50}
                    className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
                    style={{ backgroundColor: "#e4e8ee", color: "#333" }}
                    placeholder=""
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: "#999" }}>
                    {otherText.length}/50
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer - fixed at bottom */}
          <div className="flex items-center justify-between mt-6 sm:mt-10 shrink-0 relative z-[1]">
            <span className="text-[15px] font-medium" style={{ color: "#bbb" }}>
              <span style={{ color: "#333", fontWeight: 700 }}>{step + 1}</span>{" "}
              / {questions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!selectedValue}
              className={cn(
                "px-7 py-3 rounded-xl text-[15px] font-semibold transition-all",
                selectedValue
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              )}
              style={{
                backgroundColor: selectedValue ? "#333" : "#d4d4d4",
                color: selectedValue ? "#fff" : "#999",
              }}
            >
              {isLastStep ? "Submit" : "Next  >"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSurveyDialog;
