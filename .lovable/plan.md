
Diagnosi confermata: il problema non è nella preview né nel widget live che “nascondono” le emoji. L’errore è a monte, nella generazione dei chip.

Cosa ho verificato:
- Nella preview, i log della funzione AI mostrano una risposta raw come `[CHIPS: Skincare, Apparel, Fragrance]`: quindi l’AI sta già restituendo chip senza emoji.
- Nel live, i messaggi salvati nel database hanno `metadata.chips` come `["Skincare","Haircare","Apparel"]` / `["Skincare","Haircare","Clothing"]`: quindi anche il sito riceve già chip senza emoji.
- La preview e il widget live renderizzano semplicemente il testo ricevuto, quindi il rendering frontend non è il colpevole.

Causa reale:
- In `supabase/functions/chatbot-preview/index.ts` e `supabase/functions/chatbot-reply/index.ts` oggi ci si affida solo al prompt (“prepend an emoji”), ma il modello non lo segue in modo affidabile.
- Quando i chip arrivano senza emoji, il codice li accetta così com’è.
- Inoltre il fallback `deriveDiscoveryChips()` non è robusto: usa i `subtitle` dei prodotti come possibile sorgente, ma in questo progetto i subtitle sono descrizioni lunghe prodotto, non categorie pulite.

Piano di correzione:
1. Rendere deterministica l’aggiunta delle emoji nei chip lato backend
- Aggiungere una funzione helper in entrambe le funzioni chat (`chatbot-preview` e `chatbot-reply`) che:
  - controlla ogni chip restituito dall’AI,
  - rileva se ha già un’emoji iniziale,
  - se non ce l’ha, prepende automaticamente un’emoji coerente in base alla categoria.

2. Introdurre una mappa categorie → emoji
- Esempi:
  - skincare / beauty / face / skin → 🧴
  - haircare / hair → 💇‍♀️ oppure 🫧
  - clothing / apparel / fashion / dress → 👗
  - accessories / bag / jewelry → 👜
  - fragrance / perfume → ✨ oppure 🌸
- Tenere una fallback emoji neutra se la categoria non è riconosciuta.

3. Normalizzare sempre i chip prima di salvarli o restituirli
- In `chatbot-preview/index.ts`: normalizzare `metadata.chips` prima della response JSON verso la preview.
- In `chatbot-reply/index.ts`: normalizzare `metadata.chips` prima del salvataggio in `chat_messages.metadata`, così il live riceve già il valore corretto.

4. Correggere anche il fallback discovery
- Aggiornare `deriveDiscoveryChips()` per non basarsi sui subtitle descrittivi.
- Invece:
  - deduplicare categorie pulite se l’AI le produce,
  - usare una lista fallback sensata e già con emoji (es. `🧴 Skincare`, `💇‍♀️ Haircare`, `👗 Clothing`) quando manca output valido.

5. Mantenere preview e live perfettamente allineati
- Riutilizzare la stessa logica di normalizzazione in entrambi i percorsi, così non si rischia di avere preview corretta e live diverso.

Verifica finale prevista:
- In preview: scrivere “aiutami a scegliere” e controllare che compaiano chip tipo `🧴 Skincare`, `💇‍♀️ Haircare`, `👗 Clothing`.
- In live: inviare lo stesso messaggio, verificare che i chip salvati e renderizzati includano le emoji.
- Controllare anche che cliccando un chip continui a funzionare il flusso successivo prodotti.

Dettagli tecnici:
- File da aggiornare:
  - `supabase/functions/chatbot-preview/index.ts`
  - `supabase/functions/chatbot-reply/index.ts`
- Nessuna modifica database necessaria.
- Non serve toccare il rendering della preview o del widget live, a meno che durante il fix emerga un caso secondario di stile/spaziatura.
