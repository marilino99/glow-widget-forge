import { useState } from "react";
import { ArrowLeft, Bot, Clock, MessageSquare, Sparkles, Info, Check, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatbotPanelProps {
  onBack: () => void;
  chatbotEnabled: boolean;
  onChatbotToggle: (enabled: boolean) => void;
  chatbotInstructions: string;
  aiProvider: string;
  aiApiKey: string;
  onSaveConfig: (config: Record<string, unknown>) => void;
}

const providers = [
  { value: "google", label: "Google Gemini", placeholder: "AIzaSy..." },
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
];

const ChatbotPanel = ({
  onBack,
  chatbotEnabled,
  onChatbotToggle,
  chatbotInstructions,
  aiProvider,
  aiApiKey,
  onSaveConfig,
}: ChatbotPanelProps) => {
  const [instructions, setInstructions] = useState(chatbotInstructions);
  const [provider, setProvider] = useState(aiProvider || "google");
  const [apiKey, setApiKey] = useState(aiApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);

  const currentProvider = providers.find((p) => p.value === provider);
  const isConnected = !!aiApiKey && aiApiKey.length > 5;

  const hasChanges =
    instructions !== chatbotInstructions ||
    provider !== aiProvider ||
    apiKey !== aiApiKey;

  const handleSave = () => {
    onSaveConfig({
      chatbotInstructions: instructions,
      aiProvider: provider,
      aiApiKey: apiKey,
    });
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
        <>
            {/* Feature highlights */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Risposte automatiche AI per i tuoi visitatori
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I clienti possono chattare con un assistente AI
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Disponibile 24/7
                </p>
              </div>
            </div>

            {/* Provider selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Provider AI
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* API Key input */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {currentProvider?.label} API Key
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[240px]">
                      <p className="text-xs">
                        La tua API key è salvata in modo sicuro e viene usata solo per generare le risposte del chatbot.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentProvider?.placeholder || "Inserisci la tua API key"}
                    className="rounded-xl pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {isConnected && (
                <div className="flex items-center gap-1.5 text-green-600">
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Connesso</span>
                </div>
              )}
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
                className="min-h-[140px] resize-none rounded-xl text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Queste istruzioni verranno aggiunte alla knowledge base predefinita di Widjet.
              </p>
            </div>

            {/* Save button */}
            {hasChanges && (
              <Button onClick={handleSave} className="w-full rounded-xl">
                Salva modifiche
              </Button>
            )}
        </>
      </div>
    </div>
  );
};

export default ChatbotPanel;
