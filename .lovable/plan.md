
## Piano: fix reale del TTS che non legge le risposte AI

### Problema individuato
Il problema principale è nel **builder preview**: tu parli, il messaggio viene inviato, la risposta arriva in chat, ma non viene letta perché il callback del microfono usa una **versione vecchia di `handleSendChatMessage`**.

In pratica:
- `startVoiceSession()` fa `setShowVoiceView(true)`
- subito dopo crea `recognition.onresult = () => handleSendChatMessage(...)`
- però quella funzione resta legata al render precedente, quando `showVoiceView` era ancora `false`
- quindi dentro `handleSendChatMessage` il blocco:
```ts
if (showVoiceView && window.speechSynthesis) { ... }
```
non parte mai, anche se la schermata vocale è aperta

Questo spiega perfettamente il comportamento che descrivi:
- il bot **risponde in chat**
- ma **non parla**

### Cosa modificherei

#### 1) Rendere il controllo Voice/TTS stabile nel preview
In `src/components/builder/WidgetPreviewPanel.tsx`:
- introdurre ref stabili tipo:
  - `showVoiceViewRef`
  - `voiceMutedRef`
  - opzionale `isSpeakingRef`
- sincronizzarli con `useEffect`

Così la logica vocale non dipende da valori React “catturati” in closure vecchie.

#### 2) Spostare il TTS in una funzione dedicata
Creare una funzione tipo:
```ts
speakAssistantReply(text)
```
che:
- controlla `showVoiceViewRef.current`
- controlla `voiceMutedRef.current`
- fa `speechSynthesis.cancel()` prima di parlare
- pulisce il testo (`markdown`, newline inutili)
- imposta `utterance.lang`
- mette `voiceStatus = "processing"` o `"speaking"`
- stoppa il microfono mentre parla
- a fine audio riavvia il recognition e torna a `listening`

Questo evita che il TTS dipenda da stato React non aggiornato.

#### 3) Far usare ai callback del microfono la versione aggiornata della send logic
Sempre nel preview:
- evitare che `recognition.onresult` chiami una funzione con stato stale
- soluzione più sicura: usare una ref anche per la funzione di invio, oppure far sì che `onresult` invochi una funzione che legge sempre dai ref correnti

#### 4) Correggere anche la logica del mute
Ora il mute cancella il parlato, ma il TTS non controlla davvero uno stato stabile.
Va reso coerente:
- se muted, non deve parlare
- se sto parlando e l’utente muta, l’audio va fermato subito
- il microfono non deve ripartire in automatico se siamo muted

#### 5) Allineare anche il widget live
Nel file `supabase/functions/widget-loader/index.ts` la base è già più corretta, ma la renderei più robusta per parità preview/live:
- in `speakText()` aggiungere guardia anche su `voiceMuted`
- fare `speechSynthesis.cancel()` prima di ogni nuovo `speak()`
- evitare doppie letture se arrivano più poll consecutivi
- lasciare il riavvio microfono solo quando la voice view è ancora aperta e non è muted

### File coinvolti
- `src/components/builder/WidgetPreviewPanel.tsx`
- `supabase/functions/widget-loader/index.ts`

### Risultato atteso
Dopo il fix:
1. apri la voice view nel builder
2. parli
3. il messaggio viene inviato
4. il bot risponde in chat
5. la risposta viene **letta davvero a voce**
6. finito il parlato, il microfono torna in ascolto

### Dettaglio tecnico
La causa non sembra essere il chatbot né il backend: la risposta arriva correttamente. Il bug è molto probabilmente nel **flow client-side del preview**, dovuto a:
- closure stale di React
- check `showVoiceView` dentro una funzione creata nel render sbagliato

Il fix corretto non è “aggiungere altro TTS”, ma **rendere persistente la state machine voice/TTS tramite refs**, così i callback Web Speech lavorano sempre con lo stato attuale.
