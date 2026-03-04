import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatbotPanelProps {
  chatbotInstructions: string;
  aiProvider: string;
  aiTemperature: number;
  aiTone: string;
  onSaveConfig: (config: Record<string, unknown>) => void;
}

const models = [
  { value: "google", label: "Gemini 2.5 Flash" },
  { value: "openai", label: "GPT-4o mini" },
];

const tones = [
  { value: "professional", emoji: "💼", label: "Professional", description: "Clear and knowledgeable" },
  { value: "friendly", emoji: "🤝", label: "Friendly", description: "Helpful and conversational" },
  { value: "casual", emoji: "☕", label: "Casual", description: "Relaxed and informal" },
  { value: "enthusiastic", emoji: "🎉", label: "Enthusiastic", description: "Energetic and encouraging" },
];

const ChatbotPanel = ({
  chatbotInstructions,
  aiProvider,
  aiTemperature,
  aiTone,
  onSaveConfig,
}: ChatbotPanelProps) => {
  const [instructions, setInstructions] = useState(chatbotInstructions);
  const [provider, setProvider] = useState(aiProvider || "google");
  const [temperature, setTemperature] = useState(aiTemperature ?? 0.5);
  const [tone, setTone] = useState(aiTone || "friendly");

  const hasChanges =
    instructions !== chatbotInstructions ||
    provider !== aiProvider ||
    temperature !== aiTemperature ||
    tone !== aiTone;

  const handleSave = () => {
    onSaveConfig({
      chatbotInstructions: instructions,
      aiProvider: provider,
      aiTemperature: temperature,
      aiTone: tone,
    });
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Model selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Model</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  {m.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border/40" />

      {/* Temperature */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Temperature</Label>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Temperature decides how your AI responds—lower means straightforward and reliable, while higher introduces more variety, playfulness and creativity.
        </p>
        <Slider
          value={[temperature]}
          onValueChange={([v]) => setTemperature(v)}
          min={0}
          max={1}
          step={0.1}
          className="mt-2"
        />
        <p className="text-center text-sm font-medium text-foreground">{temperature.toFixed(1)}</p>
      </div>

      <div className="border-t border-border/40" />

      {/* Tone of voice */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          🗣️ Tone of voice
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all duration-200 ${
                tone === t.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-background hover:border-border"
              }`}
            >
              <span className="text-sm font-medium">
                {t.emoji} {t.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{t.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Additional Instructions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Additional instructions (optional)
        </Label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={`Add specific information about your business, e.g:\n- We are an online shoe store\n- Hours: Mon-Fri 9-18\n- We ship across Italy in 2-3 days`}
          className="min-h-[120px] resize-none rounded-xl text-sm"
        />
        <p className="text-xs text-muted-foreground">
          These instructions will be added to Widjet's default knowledge base.
        </p>
      </div>

      {/* Save button */}
      {hasChanges && (
        <Button onClick={handleSave} className="rounded-xl">
          Save
        </Button>
      )}
    </div>
  );
};

export default ChatbotPanel;
