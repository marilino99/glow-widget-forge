import { useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ChatbotPanelProps {
  onBack: () => void;
  chatbotEnabled: boolean;
  onChatbotToggle: (enabled: boolean) => void;
  chatbotInstructions: string;
  onSaveConfig: (config: Record<string, unknown>) => void;
}

const ChatbotPanel = ({
  onBack,
  chatbotEnabled,
  onChatbotToggle,
  chatbotInstructions,
  onSaveConfig,
}: ChatbotPanelProps) => {
  const [instructions, setInstructions] = useState(chatbotInstructions);
  const hasChanges = instructions !== chatbotInstructions;

  const handleSave = () => {
    onSaveConfig({ chatbotInstructions: instructions });
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-[hsl(260,30%,97%)] to-[hsl(270,40%,94%)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)]"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">AI Chatbot</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Enable AI Chatbot</Label>
          <Switch checked={chatbotEnabled} onCheckedChange={onChatbotToggle} />
        </div>

        {chatbotEnabled && (
          <>
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed font-medium">
                ✅ Il chatbot è già attivo e sa rispondere a domande su Widjet (funzionalità, installazione, prezzi, ecc.) senza bisogno di configurazione.
              </p>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Istruzioni aggiuntive (opzionale)
              </Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={`Aggiungi informazioni specifiche sulla tua attività, es:\n- Siamo un negozio di scarpe online\n- Orari: lun-ven 9-18\n- Spediamo in tutta Italia in 2-3 giorni`}
                className="min-h-[200px] resize-none rounded-xl text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Queste istruzioni verranno aggiunte alla knowledge base predefinita di Widjet.
              </p>
            </div>

            {/* Save button */}
            {hasChanges && (
              <Button
                onClick={handleSave}
                className="w-full rounded-xl"
              >
                Salva istruzioni
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotPanel;
