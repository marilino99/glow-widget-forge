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
        className="sm:max-w-[720px] border-0 p-0 overflow-hidden [&>button]:hidden z-[60] rounded-2xl shadow-2xl"
        overlayClassName="z-[59]"
        style={{ backgroundColor: "#eef0f4" }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Rainbow glow band at top */}
        <div
          className="absolute top-0 left-0 right-0 h-28 pointer-events-none"
          style={{
            background: "linear-gradient(100deg, #f9e4b7 0%, #fce4ec 20%, #e8d0f0 40%, #d0d4f7 60%, #d0eef7 80%, #e8f5e1 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            opacity: 0.85,
          }}
        />

        <div className="relative px-10 pt-10 pb-8">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-5 right-8 text-[15px] font-semibold transition-colors"
            style={{ color: "#1a1a1a" }}
          >
            Skip
          </button>

          {/* Title area */}
          <div className="text-center mt-2 mb-5">
            <h2
              className="text-[28px] font-extrabold leading-tight mb-2"
              style={{ color: "#111" }}
            >
              {currentQuestion.title}
            </h2>
            <p className="text-[15px]" style={{ color: "#999" }}>
              {currentQuestion.subtitle}
            </p>
            <p className="text-[13px] mt-2" style={{ color: "#bbb" }}>
              {currentQuestion.selectLabel}
            </p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            {currentQuestion.options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedValue === option.label;
              return (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option.label)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-5 py-5 text-left transition-all duration-150",
                    "border-2",
                    isSelected
                      ? "border-[#333] shadow-md"
                      : "border-transparent hover:border-[#ddd]"
                  )}
                  style={{ backgroundColor: "#fff" }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: isSelected ? "#e0f2f7" : "#f0f4f8" }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: "#3fb5c5" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <span
                    className="text-[15px] font-semibold"
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

          <div className="flex items-center justify-between mt-10">
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
              {isLastStep ? "Continue" : "Next  >"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSurveyDialog;
