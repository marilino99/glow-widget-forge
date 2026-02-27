

# Sistema di Limite 100 Risposte AI Mensili

## Panoramica

Implementare un sistema che blocca le risposte AI automatiche quando l'utente Free supera 100 risposte al mese, spingendolo a fare l'upgrade. Gli utenti Pro avranno un limite di 10.000 risposte.

## Cosa cambia per l'utente

- **0-69 risposte**: Tutto normale, nessun avviso
- **70 risposte**: Banner discreto nella sidebar ("Hai usato il 70% delle risposte AI")
- **90 risposte**: Warning visibile con CTA upgrade
- **100+ risposte**: L'AI smette di rispondere. Il visitatore riceve un messaggio fallback tipo "L'assistente non e' disponibile, lascia un messaggio e ti rispondero'". Il proprietario vede un banner nel pannello Conversations
- Il contatore si resetta automaticamente ogni mese

## Dettagli tecnici

### 1. Edge Function `chatbot-reply` (modifica)
- Prima di generare la risposta AI, contare i messaggi `is_ai_response = true` dell'utente nel mese corrente
- Se il conteggio >= limite (100 free / 10.000 pro), verificare il piano tramite Stripe
- Se il limite e' superato: inserire un messaggio fallback invece della risposta AI, con flag `is_limit_message: true` o un contenuto specifico
- Se sotto il limite: procedere normalmente

### 2. Edge Function `check-subscription` (modifica)
- Aggiungere nel response il conteggio mensile delle risposte AI (`ai_responses_this_month`)
- Calcolare il conteggio filtrando `chat_messages` per `is_ai_response = true` e `created_at >= inizio mese corrente`

### 3. Hook `useSubscription` (modifica)
- Esporre `aiResponsesThisMonth` dallo stato
- Calcolare `aiResponseLimit` (100 per free, 10000 per pro)
- Esporre `isApproachingLimit` (>=70%) e `isAtLimit` (>=100%)

### 4. Sidebar - Usage overview (modifica in `BuilderSidebar.tsx`)
- Cambiare il conteggio da "totale storico" a "mensile" (filtrando per mese corrente)
- Aggiungere colori progressivi alla barra: verde sotto il 70%, giallo al 70%, rosso al 90%
- Aggiungere CTA "Upgrade" quando si avvicina al limite

### 5. Banner nel pannello Conversations (`ConversationsPanel.tsx`)
- Mostrare un banner in cima quando il limite e' raggiunto: "Le risposte AI sono esaurite per questo mese. Fai l'upgrade per continuare."

### 6. Messaggio fallback per il visitatore
- Quando il limite e' raggiunto, il widget mostra al visitatore: "L'assistente non e' al momento disponibile. Lascia un messaggio e ti risponderemo il prima possibile."
- Questo messaggio viene salvato come messaggio `owner` nella conversazione

