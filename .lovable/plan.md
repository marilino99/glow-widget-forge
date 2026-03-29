

## Piano: Pulsante Voice AI nella contact card + schermata vocale stile Zowie

### Panoramica
Aggiungere un pulsante microfono nell'header della contact card del widget (accanto al nome del business, es. "AI Sales Expert"). Cliccandolo si apre una vista full-screen con:
- Blob animato organico (stile Zowie, arancione/coral)
- Stato "Connecting..." → "Listening..." → "Processing..."
- Pulsanti Close (X) e Mute mic
- Branding "Powered by WidJet"

L'utente parla, il sistema trascrive l'audio usando la Web Speech API del browser (nessun servizio esterno necessario), invia il testo trascritto alla chat come messaggio normale, e mostra la risposta AI nella chat. Quando l'utente finisce la sessione vocale, viene riportato alla chat view dove può vedere le risposte e i prodotti consigliati.

### Componenti tecnici

#### 1. CSS — Stili per la voice view
Aggiungere nel blocco CSS del widget-loader:
- `#wj-voice-view`: vista full-screen con sfondo chiaro (#f0f0f0)
- `#wj-voice-blob`: blob SVG animato con colore arancione/coral, animazione morph organica
- `#wj-voice-status`: testo stato ("Connecting", "Listening...", "Processing...")
- `#wj-voice-controls`: container per i pulsanti close e mute
- Pulsante close (cerchio bianco con X) e mute (cerchio rosso con mic barrato)
- Animazione `@keyframes wjBlobMorph` per il morphing organico del blob
- Chevron in alto a destra per chiudere (come nello screenshot)

#### 2. HTML — Pulsante nella contact card + Voice View
- Aggiungere un'icona microfono nella contact card, accanto al nome, come pulsante cliccabile
- Creare un nuovo `div#wj-voice-view` con la struttura: chevron close, blob SVG, status text, controls (X + mute), branding

#### 3. JavaScript — Logica vocale
- **Web Speech API** (`webkitSpeechRecognition` / `SpeechRecognition`): riconoscimento vocale nel browser, zero costi, supportato su Chrome/Safari/Edge
- Al click del pulsante mic: mostrare voice view, iniziare recognition
- Stato: Connecting → Listening (blob pulsa) → quando l'utente finisce di parlare → Processing (invia messaggio) → torna a Listening
- Il testo riconosciuto viene inviato come messaggio chat normale (stessa funzione `sendMessageText`)
- Pulsante mute: pausa/riprendi recognition
- Pulsante X o chevron: chiude voice view, ferma recognition, mostra chat view con le risposte

#### 4. Flusso utente
1. Utente vede il widget aperto → nella contact card c'è un'icona 🎙️
2. Click → si apre la voice view full-screen (blob arancione, "Connecting...")
3. Il browser chiede permesso microfono → "Listening..."
4. Utente parla → blob pulsa → testo trascritto inviato alla chat
5. AI risponde nella chat (con eventuali prodotti)
6. Utente può continuare a parlare o chiudere (X) → torna alla chat view con tutte le risposte visibili

### File coinvolti
- `supabase/functions/widget-loader/index.ts` — CSS, HTML voice view, JS logica Speech API, pulsante nella contact card
- `src/components/builder/WidgetPreviewPanel.tsx` — aggiungere icona mic nella preview della contact card

### Limitazioni note
- Web Speech API non supportata su Firefox (fallback: mostra toast "Browser non supportato")
- Funziona meglio su Chrome, Safari, Edge
- Nessun costo aggiuntivo: la trascrizione avviene nel browser

