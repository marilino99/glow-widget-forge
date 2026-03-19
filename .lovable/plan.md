
Obiettivo: sbloccare il collegamento Instagram per account diversi dal tester.

Cosa ho verificato nel progetto:
- Il flusso OAuth parte da `supabase/functions/instagram-oauth-start/index.ts` e reindirizza a Instagram Business Login.
- Il callback `supabase/functions/instagram-oauth-callback/index.ts` salva la connessione solo dopo che Meta restituisce il `code`.
- Nel frontend `src/hooks/useInstagramDMConnection.ts` oggi vengono mostrati solo errori generici (`token_exchange`, `db_save`, `internal`).
- Non c’è nessun filtro nel nostro codice che limiti gli account: il blocco avviene prima, direttamente lato Meta.

Perché succede:
- L’errore `Insufficient Developer Role` indica quasi sempre che la tua app Meta è ancora in Development mode.
- In Development mode, Meta consente il login solo ad account associati all’app con un ruolo valido (Administrator, Developer, Tester, ecc.).
- Quindi un account Instagram “normale”, non invitato come tester/ruolo, viene bloccato da Meta prima ancora di tornare al callback della tua app.

Cosa fare subito:
1. Se vuoi solo testare internamente:
   - aggiungi quell’account come Tester/Developer nella app Meta
   - fai accettare l’invito dall’account invitato
   - poi riprova il login
2. Se vuoi far collegare account non-tester:
   - porta la app in Live mode
   - completa l’App Review per i permessi Instagram Messaging/business richiesti
3. Verifica anche che l’account Instagram sia professionale/business e configurato correttamente secondo i requisiti Meta.

Piano di implementazione consigliato:
1. Migliorare l’UX del collegamento Instagram nel builder:
   - mostrare un avviso chiaro prima del click su “Connect” se l’app è in test/dev
   - spiegare che in dev possono collegarsi solo tester/developer
2. Migliorare la gestione errori del callback:
   - intercettare meglio i fallimenti OAuth
   - mostrare messaggi specifici invece di “Errore interno”
3. Aggiungere una checklist guidata nella card Instagram:
   - account invitato come tester
   - invito accettato
   - app in Live mode per utenti reali
   - account Instagram professionale
4. Opzionale: aggiungere un link/documentazione rapida nella UI per evitare questo blocco in futuro.

Nota tecnica:
- Questo non è principalmente un bug del codice attuale.
- Il vero collo di bottiglia è la configurazione Meta e la modalità Development della app.
- Il codice andrebbe però migliorato per rendere il problema subito comprensibile all’utente invece di lasciarlo “misterioso”.
