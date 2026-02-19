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
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Il chatbot risponderà automaticamente ai visitatori basandosi sulle istruzioni che scrivi qui sotto.
                Inserisci informazioni sulla tua attività, orari, servizi, FAQ, ecc.
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Knowledge base / Istruzioni
              </Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={`Es:\n- Siamo un negozio di scarpe online\n- Orari: lun-ven 9-18\n- Spediamo in tutta Italia in 2-3 giorni\n- Reso gratuito entro 30 giorni\n- Per ordini sopra 50€ la spedizione è gratuita`}
                className="min-h-[250px] resize-none rounded-xl text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Più dettagli inserisci, migliori saranno le risposte del bot.
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
