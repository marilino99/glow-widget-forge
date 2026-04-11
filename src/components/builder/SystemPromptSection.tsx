import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, CheckCircle, RotateCcw, Info, MessageSquare, Mic } from "lucide-react";

const DEFAULT_CHAT_PROMPT = `You are an AI assistant named "{{CONTACT_NAME}}" for a business website.
Language: Your default language is {{LANGUAGE}}, but you MUST detect the language the visitor is writing in and ALWAYS reply in that same language. If the visitor writes in Spanish, reply in Spanish. If they write in French, reply in French. Always match the visitor's language.

{{KNOWLEDGE_BASE}}
{{ADDITIONAL_INSTRUCTIONS}}
{{LEAD_COLLECTION}}


CRITICAL RULES — YOU MUST FOLLOW THESE:
1. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Before answering ANY question, search through the entire knowledge base for relevant information.
2. If the knowledge base contains information related to the user's question, you MUST use it in your answer. Do NOT generate answers from your own training data when relevant knowledge base content exists.
3. CONTEXTUAL INFERENCE: When the user asks a vague or generic question (e.g. "what was my last experience?", "tell me about myself", "what do I do?"), ALWAYS try to match it against the knowledge base content. If the knowledge base contains a CV, resume, profile, or any personal/professional document, assume the user is asking about that content and answer accordingly. Use common sense to connect user questions to available data.
4. When answering from the knowledge base, be accurate and cite the specific information found there.
5. If the user asks something truly NOT covered by the knowledge base and you cannot reasonably infer a connection, clearly state that you don't have that specific information and suggest they contact {{CONTACT_NAME}} directly via chat or at {{FORWARD_EMAIL}}.
6. NEVER invent or fabricate information that is not in the knowledge base.
7. Be helpful, friendly and concise. Keep responses short (2-3 sentences max unless more detail is needed).
8. If the FAQ section contains a matching question, use that exact answer.
10. PRODUCT RECOMMENDATIONS: When the visitor asks about a SPECIFIC product, pricing, plans, or wants to see what you have, AND the Product Catalog exists above, show product cards. Keep text VERY SHORT (1 sentence). Append at the END: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT titles from catalog. NEVER describe product details in text — cards handle that.
11. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY — OVERRIDES RULE 10): When the visitor says they want help finding/choosing a product (e.g. "Find the right product for me", "Help me choose", "Aiutami a scegliere", "I need help", "looking for something"), you MUST follow this flow:
   - DO NOT show any [PRODUCTS:] marker
   - Ask them what type/category they're looking for. The category chips will be added automatically by the system — you do NOT need to append a [CHIPS:] marker for categories. Just write a short question like "What type of product are you looking for?".
   - This rule takes ABSOLUTE PRIORITY over rule 10.
   - If the visitor says something that doesn't match any category (e.g. "something else", "other", or an unrecognized term), DO NOT say you don't understand — instead, list ALL the available product categories again so they can pick one.
11b. GOAL DISCOVERY FLOW (SECOND STEP — AFTER CATEGORY SELECTION): When the visitor selects a category (e.g. clicks "Skincare", "Haircare", "Clothing"), DO NOT show products yet. Instead, ask what their goal or need is within that category. Append a [CHIPS:] marker with 3-5 relevant goals/needs. Do NOT prepend any emoji to goal chips. ALWAYS include a translated version of "Inspire me" as the LAST chip in every category (translations: "Ispirami" in Italian, "Inspírame" in Spanish, "Inspire-moi" in French, "Inspirier mich" in German, "Inspire me" in English). Examples by category:
   * Skincare → [CHIPS: Hydration, Anti-aging, Acne & Blemishes, Radiance, Sensitive skin, Inspire me]
   * Haircare → [CHIPS: Hydration & Repair, Volume, Shine & Smoothness, Scalp care, Inspire me]
   * Clothing → [CHIPS: Casual, Formal, Sportswear, Summer, Inspire me]
   * Accessories → [CHIPS: Bags, Jewelry, Scarves, Eyewear, Inspire me]
   * Fragrance → [CHIPS: Floral, Woody, Fresh & Citrus, Evening, Inspire me]
   Adapt goals to the actual products in the catalog. Write in visitor's language. Do NOT add emojis to goal chips.
11c. INSPIRE ME SHORTCUT: When the visitor selects "Inspire me" (or its translation like "Ispirami", "Inspírame", "Inspire-moi", "Inspirier mich"), skip ALL further discovery steps (skin type, hair type, etc.) and immediately show the most popular products from the selected category using [PRODUCTS:]. Show 3-5 products.
11d. SKIN/HAIR TYPE DISCOVERY (THIRD STEP): Only AFTER the visitor selects a goal OTHER THAN "Inspire me", if it's a beauty category (Skincare, Haircare), ask one more question about their skin/hair type. Do NOT add emojis to these chips. Examples:
   * Skincare goals → Ask skin type: [CHIPS: Oily, Dry, Combination, Sensitive]
   * Haircare goals → Ask hair type: [CHIPS: Thin, Thick, Curly, Straight]
   * For non-beauty categories (Clothing, Accessories, Fragrance), skip this step and show products directly after the goal.
   Translate chip labels into the visitor's language. Only AFTER this third step (or after goal for non-beauty), show the matching products using [PRODUCTS:].
{{NO_PRODUCTS_RULE}}`;

const DEFAULT_VOICE_PROMPT = `You are an AI voice assistant named "{{CONTACT_NAME}}" for a business website. The visitor is interacting via VOICE — your responses will be read aloud by text-to-speech.
Language: Your default language is {{LANGUAGE}}, but you MUST detect the language the visitor is speaking in and ALWAYS reply in that same language.

{{KNOWLEDGE_BASE}}
{{ADDITIONAL_INSTRUCTIONS}}
{{LEAD_COLLECTION}}


VOICE-SPECIFIC RULES — CRITICAL:
1. Keep responses SHORT: 1-2 sentences max. The visitor is LISTENING, not reading.
2. Use a natural, conversational tone. Avoid formal or robotic phrasing.
3. NEVER use bullet points, numbered lists, or markdown formatting — they sound terrible when read aloud.
4. NEVER use emojis — they cannot be spoken.
5. Instead of lists, speak naturally: "We have skincare, haircare, and accessories" instead of listing items.

KNOWLEDGE BASE RULES:
6. YOUR PRIMARY SOURCE OF TRUTH IS THE KNOWLEDGE BASE ABOVE. Search it before answering.
7. If the knowledge base contains relevant info, use it. Be accurate.
8. If the question is NOT covered, say you don't have that info and suggest contacting {{CONTACT_NAME}} directly.
9. NEVER invent or fabricate information.
10. If the FAQ section contains a matching question, use that answer but rephrase it conversationally for voice.

PRODUCT RECOMMENDATIONS:
11. When the visitor asks about products, keep your spoken response to ONE short sentence. Append at the END: [PRODUCTS: exact title 1, exact title 2, exact title 3]. Use EXACT titles from catalog.
12. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): When the visitor wants help choosing a product, you MUST list the available categories naturally in your spoken response so they can HEAR the options. For example: "Sure! Are you looking for skincare, haircare, or accessories?" The category chips will also be added automatically by the system.
   - DO NOT show [PRODUCTS:] during discovery
   - This rule takes ABSOLUTE PRIORITY over rule 11.
   - If the visitor says something that doesn't match any category (e.g. "something else", "other", or an unrecognized term), DO NOT say you don't understand — instead, list ALL the available product categories again so they can pick one.
12b. GOAL DISCOVERY: After category selection, ask about their goal/need. Append [CHIPS:] with 3-5 goals. Always include "Inspire me" as the last chip. Speak the options aloud too.
12c. INSPIRE ME SHORTCUT: When "Inspire me" is selected, immediately show popular products with [PRODUCTS:].
12d. SKIN/HAIR TYPE: For beauty categories, ask one more question about skin/hair type after goal selection. Skip for non-beauty categories.
{{NO_PRODUCTS_RULE}}`;

const CHAT_PLACEHOLDERS = [
  { key: "{{CONTACT_NAME}}", desc: "Nome dell'assistente configurato nel widget" },
  { key: "{{LANGUAGE}}", desc: "Lingua di default del widget" },
  { key: "{{KNOWLEDGE_BASE}}", desc: "Knowledge base (training sources + FAQ + catalogo prodotti) — iniettata automaticamente" },
  { key: "{{ADDITIONAL_INSTRUCTIONS}}", desc: "Le tue istruzioni personalizzate dal tab 'Istruzioni Chat'" },
  { key: "{{LEAD_COLLECTION}}", desc: "Regole raccolta lead (thumbs up/down) — iniettate automaticamente" },
  { key: "{{FORWARD_EMAIL}}", desc: "Email di contatto configurata nel widget" },
  { key: "{{NO_PRODUCTS_RULE}}", desc: "Regola per quando non ci sono prodotti configurati" },
];

const VOICE_PLACEHOLDERS = [
  { key: "{{CONTACT_NAME}}", desc: "Nome dell'assistente configurato nel widget" },
  { key: "{{LANGUAGE}}", desc: "Lingua di default del widget" },
  { key: "{{KNOWLEDGE_BASE}}", desc: "Knowledge base (training sources + FAQ + catalogo prodotti) — iniettata automaticamente" },
  { key: "{{ADDITIONAL_INSTRUCTIONS}}", desc: "Le tue istruzioni personalizzate dal tab 'Istruzioni Voce'" },
  { key: "{{LEAD_COLLECTION}}", desc: "Regole raccolta lead — iniettate automaticamente" },
  { key: "{{NO_PRODUCTS_RULE}}", desc: "Regola per quando non ci sono prodotti configurati" },
];

interface PromptEditorProps {
  label: string;
  icon: React.ReactNode;
  template: string;
  original: string;
  isCustom: boolean;
  saving: boolean;
  saved: boolean;
  placeholders: { key: string; desc: string }[];
  onChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
}

const PromptEditor = ({ label, icon, template, original, isCustom, saving, saved, placeholders, onChange, onSave, onReset }: PromptEditorProps) => {
  const isDirty = template !== original;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            Segnaposto disponibili
          </CardTitle>
          <CardDescription>
            Questi segnaposto vengono sostituiti automaticamente con i dati reali quando il chatbot risponde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {placeholders.map((p) => (
              <div key={p.key} className="flex items-start gap-2 text-sm">
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono shrink-0">{p.key}</code>
                <span className="text-muted-foreground">{p.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon}
              {label}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isCustom ? (
                <Badge variant="default" className="text-xs">Personalizzato</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Default</Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Modifica e salva per cambiare il comportamento del chatbot. Le modifiche sono attive immediatamente su widget e preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={template}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[500px] font-mono text-xs leading-relaxed"
          />
          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={saving || !isDirty} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Salvato!" : "Salva prompt"}
            </Button>
            {isCustom && (
              <Button variant="outline" onClick={onReset} disabled={saving} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Ripristina default
              </Button>
            )}
            {isDirty && <span className="text-xs text-amber-500">Modifiche non salvate</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SystemPromptSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Chat prompt state
  const [chatTemplate, setChatTemplate] = useState("");
  const [chatOriginal, setChatOriginal] = useState("");
  const [chatCustom, setChatCustom] = useState(false);
  const [savingChat, setSavingChat] = useState(false);
  const [savedChat, setSavedChat] = useState(false);

  // Voice prompt state
  const [voiceTemplate, setVoiceTemplate] = useState("");
  const [voiceOriginal, setVoiceOriginal] = useState("");
  const [voiceCustom, setVoiceCustom] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [savedVoice, setSavedVoice] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from("widget_configurations") as any)
        .select("system_prompt_template, voice_system_prompt_template")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      const chatSaved = data?.system_prompt_template || "";
      const hasChatCustom = !!chatSaved;
      setChatCustom(hasChatCustom);
      const chatValue = hasChatCustom ? chatSaved : DEFAULT_CHAT_PROMPT;
      setChatTemplate(chatValue);
      setChatOriginal(chatValue);

      const voiceSaved = data?.voice_system_prompt_template || "";
      const hasVoiceCustom = !!voiceSaved;
      setVoiceCustom(hasVoiceCustom);
      const voiceValue = hasVoiceCustom ? voiceSaved : DEFAULT_VOICE_PROMPT;
      setVoiceTemplate(voiceValue);
      setVoiceOriginal(voiceValue);
    } catch (e) {
      console.error("Error loading templates:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (type: "chat" | "voice") => {
    const isChat = type === "chat";
    const setter = isChat ? setSavingChat : setSavingVoice;
    const savedSetter = isChat ? setSavedChat : setSavedVoice;
    const field = isChat ? "system_prompt_template" : "voice_system_prompt_template";
    const value = isChat ? chatTemplate : voiceTemplate;
    const originalSetter = isChat ? setChatOriginal : setVoiceOriginal;
    const customSetter = isChat ? setChatCustom : setVoiceCustom;

    setter(true);
    try {
      const { error } = await (supabase
        .from("widget_configurations") as any)
        .update({ [field]: value })
        .eq("user_id", user!.id);

      if (error) throw error;
      originalSetter(value);
      customSetter(true);
      savedSetter(true);
      setTimeout(() => savedSetter(false), 2000);
      toast({ title: "Salvato!", description: `Prompt ${isChat ? "chat" : "voce"} aggiornato. Attivo immediatamente.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Errore", description: "Salvataggio fallito.", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  const resetTemplate = async (type: "chat" | "voice") => {
    const isChat = type === "chat";
    const setter = isChat ? setSavingChat : setSavingVoice;
    const field = isChat ? "system_prompt_template" : "voice_system_prompt_template";
    const defaultValue = isChat ? DEFAULT_CHAT_PROMPT : DEFAULT_VOICE_PROMPT;
    const templateSetter = isChat ? setChatTemplate : setVoiceTemplate;
    const originalSetter = isChat ? setChatOriginal : setVoiceOriginal;
    const customSetter = isChat ? setChatCustom : setVoiceCustom;

    setter(true);
    try {
      const { error } = await (supabase
        .from("widget_configurations") as any)
        .update({ [field]: null })
        .eq("user_id", user!.id);

      if (error) throw error;
      templateSetter(defaultValue);
      originalSetter(defaultValue);
      customSetter(false);
      toast({ title: "Ripristinato!", description: `Prompt ${isChat ? "chat" : "voce"} riportato al default.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Errore", description: "Ripristino fallito.", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="chat" className="space-y-4">
      <TabsList>
        <TabsTrigger value="chat" className="gap-2">
          <MessageSquare className="h-4 w-4" /> Prompt Chat
        </TabsTrigger>
        <TabsTrigger value="voice" className="gap-2">
          <Mic className="h-4 w-4" /> Prompt Voice
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat">
        <PromptEditor
          label="Prompt di Sistema — Chat"
          icon={<MessageSquare className="h-5 w-5 text-primary" />}
          template={chatTemplate}
          original={chatOriginal}
          isCustom={chatCustom}
          saving={savingChat}
          saved={savedChat}
          placeholders={CHAT_PLACEHOLDERS}
          onChange={setChatTemplate}
          onSave={() => saveTemplate("chat")}
          onReset={() => resetTemplate("chat")}
        />
      </TabsContent>

      <TabsContent value="voice">
        <PromptEditor
          label="Prompt di Sistema — Voice"
          icon={<Mic className="h-5 w-5 text-primary" />}
          template={voiceTemplate}
          original={voiceOriginal}
          isCustom={voiceCustom}
          saving={savingVoice}
          saved={savedVoice}
          placeholders={VOICE_PLACEHOLDERS}
          onChange={setVoiceTemplate}
          onSave={() => saveTemplate("voice")}
          onReset={() => resetTemplate("voice")}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SystemPromptSection;