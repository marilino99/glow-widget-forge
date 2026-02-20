import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    options: ["E-commerce", "Servizi", "Ristorante", "Blog", "Altro"],
  },
  {
    key: "mainGoal" as const,
    title: "Obiettivo principale?",
    options: ["Vendite", "Supporto", "Lead", "Feedback"],
  },
  {
    key: "monthlyVisitors" as const,
    title: "Visitatori mensili?",
    options: ["<1K", "1K-10K", "10K-50K", "50K+"],
  },
];

const OnboardingSurveyDialog = ({ open, onComplete }: OnboardingSurveyDialogProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});

  const currentQuestion = questions[step];
  const selectedValue = answers[currentQuestion.key];

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    }
  };

  const handleContinue = () => {
    if (step === questions.length - 1 && Object.keys(answers).length === questions.length) {
      onComplete(answers as SurveyAnswers);
    }
  };

  const isLastStep = step === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md z-[60]"
        overlayClassName="z-[59]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Raccontaci di te</DialogTitle>
          <DialogDescription>
            Aiutaci a personalizzare la tua esperienza
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="space-y-4 py-2">
          <h3 className="text-center text-base font-medium">{currentQuestion.title}</h3>
          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={cn(
                  "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-150",
                  "hover:border-primary/50 hover:bg-primary/5",
                  selectedValue === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {isLastStep && allAnswered && (
          <Button onClick={handleContinue} className="w-full gap-2 mt-2">
            <ArrowRight className="h-4 w-4" />
            Continua
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingSurveyDialog;
