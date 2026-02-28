

## Piano: Migliorare spaziatura e centratura del mockup chat su desktop

### Problema
Su desktop, il contenuto del mockup della conversazione (messaggi + box prodotti) appare troppo schiacciato ai lati, occupando tutta la larghezza della card.

### Soluzione
Aggiungere un wrapper con larghezza massima e centratura automatica attorno al contenuto del `ChatConversationMockup`, con padding laterale aggiuntivo su desktop.

### Dettagli tecnici

**File:** `src/components/landing/AIControl.tsx`

- Avvolgere il contenuto del `ChatConversationMockup` in un container con `max-w-lg mx-auto` per limitare la larghezza su schermi grandi e centrare il tutto
- Questo mantiene il layout compatto e leggibile su desktop, senza impattare il mobile dove la larghezza e' gia' contenuta

