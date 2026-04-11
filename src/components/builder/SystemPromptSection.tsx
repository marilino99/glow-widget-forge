import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MessageSquare, Mic, Zap, ShoppingBag, Users, Brain } from "lucide-react";

interface PromptBlock {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  content: string;
}

const CHAT_PROMPT_BLOCKS: PromptBlock[] = [
  {
    title: "Identità e Lingua",
    icon: <MessageSquare className="h-4 w-4" />,
    content: `L'AI si presenta con il nome configurato nel campo "Contact Name" (default: "Support").
Lingua di default: quella configurata nel widget.
REGOLA: L'AI DEVE rilevare la lingua del visitatore e rispondere SEMPRE nella stessa lingua.`,
  },
  {
    title: "Knowledge Base e RAG",
    icon: <Brain className="h-4 w-4" />,
    badge: "Priorità Alta",
    content: `1. La FONTE PRIMARIA è la Knowledge Base (training sources + FAQ + catalogo prodotti).
2. Prima di rispondere, l'AI cerca nella knowledge base tramite ricerca semantica (RAG con embedding).
3. Se il RAG non trova risultati, usa il fallback "context stuffing" con tutte le training sources.
4. Se la FAQ contiene una domanda corrispondente, usa quella risposta esatta.
5. Se l'informazione NON è nella knowledge base, l'AI dice che non ha quell'informazione e suggerisce di contattare il business.
6. MAI inventare informazioni non presenti nella knowledge base.
7. Risposte brevi: 2-3 frasi massimo.`,
  },
  {
    title: "Flusso Scoperta Prodotti",
    icon: <ShoppingBag className="h-4 w-4" />,
    badge: "Priorità Massima",
    content: `STEP 1 — CATEGORIA (priorità assoluta):
Quando il visitatore chiede aiuto per scegliere un prodotto, NON mostrare prodotti.
Chiedere che tipo/categoria cerca. I chip categoria vengono aggiunti automaticamente dal sistema basandosi sul catalogo reale.
Categorie supportate: Skincare, Haircare, Abbigliamento, Scarpe, Accessori, Profumi, Cibo e Bevande, Casa, Tecnologia, Sport e Fitness.

STEP 2 — OBIETTIVO:
Dopo la selezione categoria, chiedere l'obiettivo/esigenza. Aggiungere chip con 3-5 obiettivi + "Ispirami" come ultimo chip.
Es. Skincare → [CHIPS: Idratazione, Anti-aging, Acne, Luminosità, Pelle sensibile, Ispirami]

SHORTCUT "ISPIRAMI":
Se il visitatore seleziona "Ispirami", saltare tutti gli step successivi e mostrare subito i prodotti più popolari della categoria.

STEP 3 — TIPO PELLE/CAPELLI (solo Beauty):
Solo per Skincare e Haircare, dopo l'obiettivo chiedere il tipo di pelle/capelli.
Skincare → [CHIPS: Grassa, Secca, Mista, Sensibile]
Haircare → [CHIPS: Sottili, Spessi, Ricci, Lisci]
Per categorie NON beauty, saltare questo step e mostrare direttamente i prodotti.`,
  },
  {
    title: "Raccomandazione Prodotti",
    icon: <ShoppingBag className="h-4 w-4" />,
    content: `Quando il visitatore chiede prodotti specifici E il catalogo esiste:
- Testo BREVISSIMO (1 frase), es. "Ecco cosa abbiamo!"
- Aggiungere alla fine: [PRODUCTS: titolo esatto 1, titolo esatto 2, titolo esatto 3]
- Usare i titoli ESATTI dal catalogo
- MAI mostrare 1 solo prodotto — sempre almeno 2-3
- MAI descrivere dettagli prodotto nel testo (le card lo fanno automaticamente)

FALLBACK: Se l'AI parla di prodotti ma dimentica il marker, il sistema rileva keyword di prodotto e aggiunge le card automaticamente.`,
  },
  {
    title: "Raccolta Lead",
    icon: <Users className="h-4 w-4" />,
    content: `- Quando il visitatore invia 👍: ringraziare e chiedere nome/email in modo naturale
- Quando il visitatore invia 👎: scusarsi e offrire di collegare con una persona reale, chiedere nome/email
- NON chiedere contatti se non attivato da emoji thumbs
- NON insistere se rifiutano
- Estrazione contatti automatica via regex (email) + AI (nome) dalla conversazione`,
  },
  {
    title: "Limiti e Rate Limiting",
    icon: <Zap className="h-4 w-4" />,
    content: `- Piano Free: 100 risposte AI/mese
- Piano Pro: 10.000 risposte AI/mese
- Quando il limite è raggiunto, viene mostrato un messaggio di fallback automatico
- Modello usato: gemini-2.5-flash (chat) / gemini-2.5-flash-lite (voce, più veloce)`,
  },
];

const VOICE_PROMPT_BLOCKS: PromptBlock[] = [
  {
    title: "Differenze Modalità Voce",
    icon: <Mic className="h-4 w-4" />,
    content: `- Modello più veloce: gemini-2.5-flash-lite (anziché gemini-2.5-flash)
- Risposte più brevi: max 400 token (anziché 800)
- Nel flusso categorie, l'AI DEVE elencare le categorie a voce nella risposta (es. "Stai cercando skincare, haircare, abbigliamento o scarpe?")
- Le istruzioni voce personalizzate (campo "voice_instructions") vengono aggiunte al prompt di sistema`,
  },
];

const CollapsibleBlock = ({ block }: { block: PromptBlock }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {block.icon}
          <span className="font-medium text-sm">{block.title}</span>
          {block.badge && (
            <Badge variant="secondary" className="text-xs">{block.badge}</Badge>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-border pt-3">
          <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
            {block.content}
          </pre>
        </div>
      )}
    </div>
  );
};

const SystemPromptSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Prompt di Sistema — Chat (Produzione + Preview)
          </CardTitle>
          <CardDescription>
            Queste sono le istruzioni hardcoded nel codice delle edge function che l'AI segue.
            Non sono modificabili da qui — le tue "Istruzioni Chat" personalizzate vengono aggiunte IN AGGIUNTA a queste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHAT_PROMPT_BLOCKS.map((block, i) => (
            <CollapsibleBlock key={i} block={block} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5 text-primary" />
            Prompt di Sistema — Voce
          </CardTitle>
          <CardDescription>
            Le differenze specifiche per la modalità voce rispetto alla chat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {VOICE_PROMPT_BLOCKS.map((block, i) => (
            <CollapsibleBlock key={i} block={block} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemPromptSection;
