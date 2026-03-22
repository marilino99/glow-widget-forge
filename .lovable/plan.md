

## Problema
Nella `chatbot-preview` il marker `[PRODUCTS: ...]` non viene riconosciuto quando l'AI tronca la risposta (il `maxOutputTokens` è solo 800 vs 2048 nel live). Senza la parentesi di chiusura `]`, la regex non matcha e il testo raw resta visibile nella bolla.

Il `chatbot-reply` (live) ha già un fallback per marker troncati (riga 661), ma `chatbot-preview` no.

## Piano

### 1. Allineare la logica di parsing in `chatbot-preview` a `chatbot-reply`
**File:** `supabase/functions/chatbot-preview/index.ts`

- **Riga 424**: Cambiare la regex del product marker da strict (`\]\s*$`) a flessibile (`\]?\s*$`) con flag `s`, come già fatto nel live.
- **Aggiungere fallback per marker troncato**: dopo il match principale, aggiungere un secondo tentativo con `/\[(?:PROD(?:UCTS?)?:?\s*.*)?$/s` che pulisce il testo e mostra i primi 3 prodotti dal catalogo (stesso pattern del live, righe 661-699).
- **Aumentare `maxOutputTokens`** da 800 a 1200 per ridurre i casi di troncamento.

### 2. Aggiungere cleanup del marker anche nel testo visibile
- Aggiungere una regex di sicurezza finale che rimuova qualsiasi residuo `[PRODUCTS:` dal `cleanReply` prima di restituirlo, come rete di protezione.

### Risultato
- Il marker `[PRODUCTS:]` non apparirà mai come testo nella bolla, anche se troncato.
- I prodotti verranno mostrati come card anche in caso di troncamento.
- Parità logica completa tra preview e live.

