

## Piano: Voice chat segue la stessa logica di discovery della chat scritta

### Problema
In voice mode, l'AI segue lo stesso system prompt della chat scritta, ma i marker `[CHIPS:]` e `[PRODUCTS:]` generano bottoni cliccabili — inutili nella conversazione vocale. L'utente parla genericamente ("sto cercando un prodotto") e l'AI dovrebbe **elencare le categorie a voce** (es. "Stai cercando skincare, haircare, clothing o shoes?") invece di generare chip silenziosi.

### Soluzione
Aggiungere istruzioni specifiche nel **VOICE MODE RULES** del system prompt per dire all'AI di:
1. **Elencare le opzioni nel testo** invece di usare `[CHIPS:]` — dire le categorie/goal a voce
2. **Mantenere il flusso di discovery** (categoria → goal → tipo pelle/capelli → prodotti) ma in forma parlata
3. **Per i prodotti**: usare comunque `[PRODUCTS:]` così vengono mostrati nella chat, ma **descriverli brevemente a voce** (es. "Ti consiglio il Serum X e la Crema Y, li trovi nella chat")

### Modifiche

**File: `supabase/functions/chatbot-reply/index.ts`** e **`supabase/functions/chatbot-preview/index.ts`**

Espandere il blocco `voiceModeRules` aggiungendo:

```
VOICE DISCOVERY RULES:
- Do NOT use [CHIPS:] markers. Instead, list the options naturally in your spoken reply.
  Example: "What are you looking for? We have Skincare, Haircare, Clothing, and Shoes."
- Follow the same category → goal → type discovery flow as text chat, but speak the options.
- When recommending products, still use the [PRODUCTS:] marker so they appear in the chat,
  but also briefly mention 1-2 product names in your spoken reply.
- Keep the conversational flow: ask one question at a time, wait for the user's spoken answer.
```

### File coinvolti
- `supabase/functions/chatbot-reply/index.ts` — aggiornare `voiceModeRules`
- `supabase/functions/chatbot-preview/index.ts` — stessa modifica per parità preview/live

### Risultato
- Utente dice "cerco un prodotto" → AI risponde a voce: "Cosa stai cercando? Abbiamo Skincare, Haircare, Clothing e Shoes"
- Utente dice "skincare" → AI: "Perfetto! Qual è il tuo obiettivo? Idratazione, anti-age, acne, luminosità, o vuoi che ti ispiri?"
- Flusso identico alla chat, ma parlato naturalmente

