
Obiettivo

Far sì che la Voice Mode legga davvero:
1. il saluto iniziale;
2. ogni risposta del chatbot dopo che l’utente parla;
sia nel preview sia nel widget live.

Diagnosi reale

- Il bot risponde già correttamente: i log di `chatbot-preview` mostrano la reply AI, e nel live i messaggi arrivano in chat.
- Quindi il problema non è il chatbot: è il layer TTS del browser.
- Dopo la rimozione di ElevenLabs, preview e live dipendono solo da `speechSynthesis`.
- Il codice attuale prova a parlare, ma poi usa un timeout che “chiude” lo speech anche quando il browser non ha mai iniziato davvero l’audio.
- Risultato: la UI passa da `Processing` a `Listening`, ma non senti nulla. Il replay conferma proprio questo comportamento.
- Inoltre il saluto iniziale non usa la stessa frase realmente visibile nel widget, quindi anche il greeting va riallineato.

Piano

1. Correggere il motore TTS nel widget live
- File: `supabase/functions/widget-loader/index.ts`
- Sostituire il flusso attuale con un controller TTS browser-only più robusto.
- Gestire esplicitamente `onstart`, `onend`, `onerror` e uno stato reale `speaking`.
- Non far mai ripartire il microfono se la voce non è partita davvero.
- Se `speechSynthesis` non parte entro un breve timeout, fare un retry controllato invece di fingere che abbia parlato.
- Usare come saluto la stessa stringa mostrata nel widget, non una frase separata.

2. Allineare il preview al live
- File: `src/components/builder/WidgetPreviewPanel.tsx`
- Applicare la stessa identica logica TTS del widget live.
- Introdurre anche nel preview uno stato visibile `speaking`, così si vede quando il bot sta davvero leggendo.
- Rimuovere il timeout “falso positivo” che oggi fa tornare a `Listening` anche senza audio.
- Tenere identici greeting, mute, close e resume listening tra preview e live.

3. Sistemare i race condition tra TTS e microfono
- In entrambi i file:
  - fermare il recognition prima di parlare;
  - riattivarlo solo dopo fine speech reale;
  - sincronizzare subito ref e state (`showVoiceView`, `voiceMuted`, `isSpeaking`) per evitare stati incoerenti;
  - cancellare davvero TTS e recognition su mute/close.

4. QA finale
- Preview:
  - apri voice mode → il saluto si sente subito;
  - dici “hello” → il bot risponde a voce;
  - lo stato mostra `Speaking` mentre legge.
- Live:
  - stesso comportamento del preview;
  - mute/close interrompono davvero l’audio;
  - tornando in chat i messaggi restano corretti.

Dettagli tecnici

- File coinvolti: `supabase/functions/widget-loader/index.ts`, `src/components/builder/WidgetPreviewPanel.tsx`
- Nessuna modifica a database o permessi.
- Non serve toccare la logica AI: le risposte già esistono, il problema è solo nel TTS client.
- Punto chiave da correggere: oggi il codice tratta il TTS come “finito” anche quando il browser non ha mai iniziato a parlare.
