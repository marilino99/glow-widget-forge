

## Piano: Risposte vocali con Text-to-Speech (TTS)

### Problema
La Voice AI attualmente trascrive la voce dell'utente e invia il testo al chatbot, ma la risposta arriva solo come testo nella chat. L'utente vuole che le risposte vengano **lette ad alta voce** dall'assistente, creando una conversazione vocale bidirezionale.

### Soluzione
Usare la **Web Speech Synthesis API** (nativa nel browser, zero costi) per leggere ad alta voce le risposte AI mentre l'utente è nella voice view.

### Modifiche

**`src/components/builder/WidgetPreviewPanel.tsx`**:
1. Nella funzione `handleSendChatMessage`, dopo aver ricevuto `data.reply` (riga ~546), se `showVoiceView` è attiva:
   - Usare `window.speechSynthesis.speak(new SpeechSynthesisUtterance(reply))` per leggere la risposta
   - Impostare la lingua dell'utterance in base a `language` (en/it/es/fr/de/pt)
   - Durante la lettura: `voiceStatus = "processing"`, al termine: riattivare il riconoscimento vocale (`voiceStatus = "listening"`)
   - Mettere in pausa il riconoscimento vocale mentre l'assistente parla (per evitare che il microfono catturi la voce dell'assistente)

2. Nella funzione `stopVoiceSession`: cancellare anche `speechSynthesis.cancel()` per interrompere eventuali letture in corso

3. Nella funzione `toggleVoiceMute`: se si muta, fermare anche la sintesi vocale

**`supabase/functions/widget-loader/index.ts`**:
4. Stessa logica TTS nel widget live: dopo aver ricevuto la risposta dal chatbot, se la voice view è aperta, leggere la risposta con `speechSynthesis`

### Flusso risultante
1. Utente clicca mic → voice view si apre
2. Utente parla → trascrizione → messaggio inviato
3. AI risponde → risposta mostrata in chat + **letta ad alta voce**
4. Durante la lettura il microfono è in pausa
5. Fine lettura → microfono si riattiva → utente può parlare di nuovo
6. Ciclo continuo come una conversazione naturale

### Limitazioni
- La voce sintetica dipende dalle voci installate nel browser/OS dell'utente
- Supportata su Chrome, Safari, Edge (non Firefox mobile)
- Zero costi: è un'API nativa del browser

