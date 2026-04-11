
Obiettivo

Ripristinare davvero la Voice Mode nel widget live, così il bot:
1. legge subito il messaggio iniziale visibile in alto;
2. legge ad alta voce ogni risposta dopo che l’utente parla.

Problema trovato

- I log del backend confermano che la voce premium sta fallendo con `401 invalid_api_key`, quindi il widget sta ripiegando sulla voce nativa del browser.
- Nel widget live questo fallback viene avviato solo dopo una chiamata async al backend: è proprio il caso che molti browser bloccano in silenzio, quindi il testo si vede ma non parte l’audio.
- Nel preview c’è anche un ritardo iniziale prima del primo speak, che peggiora ulteriormente il problema del “gesture context”.
- Per questo oggi tu vedi le risposte in chat, ma in voice mode non senti nulla.

Piano

1. Correggere il flusso voice nel widget live
- File: `supabase/functions/widget-loader/index.ts`
- Aggiungere un “unlock/prewarm” della voce browser nel click che apre la Voice Mode.
- Far usare al fallback browser una sessione TTS già preparata nel contesto utente, invece di crearla solo dopo il fetch async.
- Far leggere come greeting la stessa frase realmente mostrata nel widget, non una stringa scollegata.
- Mantenere le guardie `isSpeaking` e fermare anche `speechSynthesis` quando chiudi o muti la voice mode.

2. Allineare la preview al live
- File: `src/components/builder/WidgetPreviewPanel.tsx`
- Applicare la stessa logica del widget live.
- Rimuovere il ritardo che spezza il primo speak.
- Tenere la stessa gestione di mute/close, così preview e live restano identici.

3. Ripristinare anche la voce premium
- Verificare la configurazione del connettore ElevenLabs, perché i log mostrano chiaramente `invalid_api_key`.
- Anche se la chiave restasse invalida, il fallback corretto dovrà comunque parlare.
- Se la chiave viene riallineata, il widget tornerà a usare la voce naturale senza dipendere dal fallback browser.

4. QA finale
- Test sul widget pubblicato:
  - apertura voice mode → legge subito il messaggio iniziale;
  - domanda vocale → risposta letta ad alta voce;
  - ritorno alla chat → messaggi ancora visibili correttamente;
  - mute/close → l’audio si interrompe davvero e il microfono non riparte male.

Dettagli tecnici

- File coinvolti: `supabase/functions/widget-loader/index.ts`, `src/components/builder/WidgetPreviewPanel.tsx`
- Nessuna modifica a database o permessi.
- La causa è una combinazione di:
  - fallback browser avviato troppo tardi;
  - contesto utente perso;
  - chiave ElevenLabs non valida lato backend.
