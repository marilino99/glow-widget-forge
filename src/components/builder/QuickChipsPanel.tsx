import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface QuickChipsPanelProps {
  onBack: () => void;
  customChips: string[];
  onCustomChipsChange: (chips: string[]) => void;
  onSave: (config: Record<string, unknown>) => void;
  chatbotInstructions: string;
  faqSummary: string;
  productSummary: string;
  language: string;
}

const PLACEHOLDERS: Record<string, string[]> = {
  en: ["Find the right product for me", "Track my order", "I need more information"],
  it: ["Cercare il prodotto adatto a me", "Tracciare il mio ordine", "Ho bisogno di più informazioni"],
  es: ["Encontrar el producto adecuado", "Rastrear mi pedido", "Necesito más información"],
  de: ["Das richtige Produkt finden", "Meine Bestellung verfolgen", "Ich brauche mehr Informationen"],
  fr: ["Trouver le bon produit", "Suivre ma commande", "J'ai besoin de plus d'informations"],
  pt: ["Encontrar o produto certo", "Rastrear meu pedido", "Preciso de mais informações"],
  pl: ["Znajdź odpowiedni produkt", "Śledzić moje zamówienie", "Potrzebuję więcej informacji"],
};

const QuickChipsPanel = ({
  onBack,
  customChips,
  onCustomChipsChange,
  onSave,
  chatbotInstructions,
  faqSummary,
  productSummary,
  language,
}: QuickChipsPanelProps) => {
  const placeholders = PLACEHOLDERS[language] || PLACEHOLDERS.en;
  const [chip1, setChip1] = useState(customChips[0] || "");
  const [chip2, setChip2] = useState(customChips[1] || "");
  const [chip3, setChip3] = useState(customChips[2] || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    const chips = [chip1.trim(), chip2.trim(), chip3.trim()];
    const hasCustom = chips.some((c) => c.length > 0);
    const finalChips = hasCustom ? chips : [];
    onCustomChipsChange(finalChips);
    onSave({ customChips: finalChips });
  };

  const hasChanges =
    (chip1.trim() || "") !== (customChips[0] || "") ||
    (chip2.trim() || "") !== (customChips[1] || "") ||
    (chip3.trim() || "") !== (customChips[2] || "");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const context = [
        chatbotInstructions ? `Business description: ${chatbotInstructions}` : "",
        faqSummary ? `FAQ topics: ${faqSummary}` : "",
        productSummary ? `Products: ${productSummary}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const prompt = `Based on this business context, generate exactly 3 short quick-action button labels (max 6 words each) that a website visitor would want to click. They should be relevant to THIS specific business, not generic e-commerce chips. Output ONLY a JSON array of 3 strings in ${language === "it" ? "Italian" : language === "es" ? "Spanish" : language === "de" ? "German" : language === "fr" ? "French" : language === "pt" ? "Portuguese" : language === "pl" ? "Polish" : "English"}.\n\nContext:\n${context || "General business website"}`;

      const { data, error } = await supabase.functions.invoke("chatbot-preview", {
        body: { message: prompt, widgetId: null, systemPrompt: "You are a helpful assistant. Respond ONLY with a valid JSON array of 3 strings. No markdown, no explanation." },
      });

      if (!error && data?.reply) {
        try {
          const match = data.reply.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed) && parsed.length >= 3) {
              setChip1(String(parsed[0]));
              setChip2(String(parsed[1]));
              setChip3(String(parsed[2]));
            }
          }
        } catch {
          console.error("Failed to parse AI chips response");
        }
      }
    } catch (e) {
      console.error("AI generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#fafafa]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">Quick Action Chips</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Customize the 3 quick action buttons shown when visitors open the chat. Leave empty to use defaults.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Chip 1</label>
            <Input
              value={chip1}
              onChange={(e) => setChip1(e.target.value)}
              placeholder={placeholders[0]}
              maxLength={60}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Chip 2</label>
            <Input
              value={chip2}
              onChange={(e) => setChip2(e.target.value)}
              placeholder={placeholders[1]}
              maxLength={60}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Chip 3</label>
            <Input
              value={chip3}
              onChange={(e) => setChip3(e.target.value)}
              placeholder={placeholders[2]}
              maxLength={60}
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate with AI"}
        </Button>
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <Button className="w-full" size="sm" disabled={!hasChanges} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default QuickChipsPanel;
