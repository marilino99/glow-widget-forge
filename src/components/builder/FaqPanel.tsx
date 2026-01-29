import { ChevronLeft, Trash2, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FaqItemData } from "@/types/faqItem";

interface FaqPanelProps {
  onBack: () => void;
  faqEnabled: boolean;
  onFaqToggle: (enabled: boolean) => void;
  faqItems: FaqItemData[];
  onAddFaqItem: () => void;
  onUpdateFaqItem: (itemId: string, updates: Partial<FaqItemData>) => void;
  onDeleteFaqItem: (itemId: string) => void;
}

const getOrdinal = (n: number): string => {
  const ordinals = ["1st", "2nd", "3rd"];
  if (n < 3) return ordinals[n];
  return `${n + 1}th`;
};

const FaqPanel = ({
  onBack,
  faqEnabled,
  onFaqToggle,
  faqItems,
  onAddFaqItem,
  onUpdateFaqItem,
  onDeleteFaqItem,
}: FaqPanelProps) => {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
        </div>
        <Switch checked={faqEnabled} onCheckedChange={onFaqToggle} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              {/* Question header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {getOrdinal(index)}
                  </span>
                  <span className="text-sm font-medium text-foreground">Question</span>
                </div>
                <button
                  onClick={() => onDeleteFaqItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Question input */}
              <Input
                value={item.question}
                onChange={(e) => onUpdateFaqItem(item.id, { question: e.target.value })}
                placeholder="Enter your question..."
                className="mb-4 bg-muted/50"
              />

              {/* Answer header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Answer</span>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Answer textarea */}
              <Textarea
                value={item.answer}
                onChange={(e) => onUpdateFaqItem(item.id, { answer: e.target.value })}
                placeholder="Enter the answer..."
                className="min-h-[100px] resize-none bg-muted/50"
              />
            </div>
          ))}
        </div>

        {/* Add question button */}
        <Button
          variant="outline"
          onClick={onAddFaqItem}
          className="mt-4 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>
    </div>
  );
};

export default FaqPanel;
