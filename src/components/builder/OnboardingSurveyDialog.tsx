import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
    title: "Che tipo di attività hai?",
    subtitle: "Aiutaci a personalizzare la tua esperienza",
    selectLabel: "Seleziona 1",
    options: [
      { label: "E-commerce", icon: ShoppingBag },
      { label: "Servizi", icon: Briefcase },
      { label: "Ristorante", icon: UtensilsCrossed },
      { label: "Blog", icon: PenLine },
      { label: "Altro", icon: MoreHorizontal },
    ],
  },
  {
    key: "mainGoal" as const,
    title: "Obiettivo principale?",
    subtitle: "Cosa vorresti ottenere con il tuo widget?",
    selectLabel: "Seleziona 1",
    options: [
      { label: "Vendite", icon: TrendingUp },
      { label: "Supporto", icon: Headset },
      { label: "Lead", icon: Users },
      { label: "Feedback", icon: MessageSquare },
    ],
  },
  {
    key: "monthlyVisitors" as const,
    title: "Visitatori mensili?",
    subtitle: "Quante persone visitano il tuo sito ogni mese?",
    selectLabel: "Seleziona 1",
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

  const currentQuestion = questions[step];
  const selectedValue = answers[currentQuestion.key];
  const isLastStep = step === questions.length - 1;

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.key]: value });
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
        className="sm:max-w-2xl border-0 bg-[#f5f5f7] p-0 overflow-hidden [&>button]:hidden z-[60]"
        overlayClassName="z-[59]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Rainbow glow */}
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #fce4ec, #e8eaf6, #e0f7fa, #fff9c4)",
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
            opacity: 0.7,
          }}
        />

        <div className="relative px-8 pt-8 pb-6">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-6 text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Skip
          </button>

          {/* Title area */}
          <div className="text-center mt-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentQuestion.title}</h2>
            <p className="text-sm text-gray-500">{currentQuestion.subtitle}</p>
            <p className="text-xs text-gray-400 mt-1">{currentQuestion.selectLabel}</p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedValue === option.label;
              return (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option.label)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-left transition-all duration-150",
                    "border-2 hover:shadow-sm",
                    isSelected
                      ? "border-gray-900 shadow-sm"
                      : "border-transparent hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8">
            <span className="text-sm text-gray-400 font-medium">
              {step + 1} / {questions.length}
            </span>
            <Button
              onClick={handleNext}
              disabled={!selectedValue}
              className={cn(
                "px-6 rounded-lg font-medium",
                selectedValue
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isLastStep ? "Continua" : "Next →"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSurveyDialog;
