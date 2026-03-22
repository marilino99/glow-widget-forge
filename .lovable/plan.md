

## Piano: Aggiungere chip "Inspire me" senza emoji

Dato che gli altri goal chips (Hydration, Anti-aging, ecc.) non hanno emoji, è coerente aggiungere "Inspire me" senza emoji. Il chip funzionerà come scorciatoia: quando cliccato, salta lo step successivo (tipo di pelle/capelli) e mostra direttamente i prodotti più popolari della categoria selezionata.

### Modifiche

**1. `supabase/functions/chatbot-preview/index.ts`**
- Nel prompt (riga ~332-343), aggiornare le istruzioni per il GOAL DISCOVERY FLOW:
  - Aggiungere "Always include 'Inspire me' (translated) as the last goal chip in every category"
  - Aggiungere regola: "When the visitor selects 'Inspire me', skip the skin/hair type step and show the most popular products from the selected category directly"
- Tradurre "Inspire me" nelle istruzioni: "Ispirami" (IT), "Inspírame" (ES), "Inspire-moi" (FR), "Inspirier mich" (DE), "Inspire-me" (PT)

**2. `supabase/functions/chatbot-reply/index.ts`**
- Stesse modifiche al prompt (riga ~524-535): aggiungere "Inspire me" come ultimo chip in ogni categoria e regola per saltare il terzo step

### Esempi risultanti
- Skincare → `[CHIPS: Hydration, Anti-aging, Acne & Blemishes, Radiance, Sensitive skin, Inspire me]`
- Haircare → `[CHIPS: Hydration & Repair, Volume, Shine & Smoothness, Scalp care, Inspire me]`
- Clothing → `[CHIPS: Casual, Formal, Sportswear, Summer, Inspire me]`

Nessuna emoji, coerente con tutti gli altri goal chips.

