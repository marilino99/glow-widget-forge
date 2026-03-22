
Problema identificato

Nel widget live il click sul chip non è davvero “bloccato” lato UI: il messaggio parte, il polling parte, ma la risposta AI non viene mai salvata perché la funzione backend `chatbot-reply` va in errore.

Causa precisa

Dai log risulta questo errore:
`ReferenceError: isCategoryDiscoveryIntent is not defined`

Questo succede in `supabase/functions/chatbot-reply/index.ts`, dove il codice usa:
- `isCategoryDiscoveryIntent(lastVisitorMessage)` alla riga ~622
- `isProductIntent(lastUserMsg)` alla riga ~693

ma in quel file le relative funzioni helper non sono definite, mentre esistono correttamente in `supabase/functions/chatbot-preview/index.ts`.

Per questo:
- nella widget preview funziona, perché usa `chatbot-preview`
- nel widget live non funziona, perché usa `send-chat-message` → `chatbot-reply` → `get-chat-messages`

Piano di correzione

1. Allineare `chatbot-reply` a `chatbot-preview`
- Aggiungere in `supabase/functions/chatbot-reply/index.ts` le funzioni helper mancanti:
  - `isCategoryDiscoveryIntent`
  - `isProductIntent`
- Riutilizzare la stessa logica già presente nella preview, così il comportamento live e preview torna coerente.

2. Mantenere il flusso discovery già previsto
- Lasciare invariata la logica che, quando il visitor clicca “Find the right product for me”, forza:
  - domanda di discovery
  - chips di categoria generate dal catalogo
  - niente `[PRODUCTS:]` in questo primo step

3. Verifica funzionale
- Controllare che il click sul chip nel live:
  - inserisca il messaggio visitor
  - faccia arrivare la risposta AI
  - mostri i chip categoria sotto il messaggio
- Verificare anche che non ricompaia l’errore in `chatbot-reply` logs.

Dettagli tecnici

File da aggiornare:
- `supabase/functions/chatbot-reply/index.ts`

Modifica prevista:
- copiare/adattare da `supabase/functions/chatbot-preview/index.ts` le due utility mancanti vicino alle costanti `PRODUCT_KEYWORDS` e `CATEGORY_DISCOVERY_PATTERNS`

Nessuna modifica database necessaria.
Nessuna modifica frontend necessaria per questo bug specifico.
