
# Chatbot sempre attivo con knowledge base su Widjet

## Cosa cambia

Attualmente il chatbot funziona solo se l'utente attiva il toggle E scrive delle istruzioni personalizzate. Vogliamo che funzioni **subito, di default**, con una knowledge base integrata su Widjet -- senza che l'utente debba fare nulla.

## Modifiche

### 1. Edge Function `chatbot-reply`
- Rimuovere il controllo che blocca il bot se `chatbot_instructions` e vuoto (riga 53)
- Il bot funzionera sempre quando `chatbot_enabled` e `true`
- Aggiungere una **knowledge base predefinita su Widjet** direttamente nel system prompt, che viene sempre inclusa
- Se l'utente ha scritto istruzioni aggiuntive nel campo `chatbot_instructions`, queste vengono aggiunte IN AGGIUNTA alla knowledge base di Widjet
- Il system prompt dira al bot di rispondere SOLO su argomenti relativi a Widjet e di rifiutare educatamente domande fuori tema

La knowledge base predefinita includera:
- Cos'e Widjet (widget personalizzabile per siti web)
- Funzionalita principali (chat, FAQ, product cards, Instagram, WhatsApp, Google Reviews, ecc.)
- Come si installa (copia-incolla codice)
- Piani e prezzi
- Come personalizzare il widget dal builder

### 2. Edge Function `send-chat-message`
- Il chatbot viene gia triggerato quando `chatbot_enabled` e `true` -- nessuna modifica necessaria qui

### 3. Database: default `chatbot_enabled` a `true`
- Migrazione per cambiare il default di `chatbot_enabled` da `false` a `true`, cosi i nuovi utenti hanno il bot attivo di default
- Per gli utenti esistenti, aggiornare il valore a `true` dove ancora `false`

### 4. UI `ChatbotPanel.tsx`
- Il campo "Knowledge base / Istruzioni" diventa opzionale e viene rinominato a qualcosa come "Istruzioni aggiuntive (opzionale)"
- Aggiungere una nota che spiega che il bot sa gia rispondere su Widjet di default
- Il bot funziona anche se il campo e vuoto

### 5. `useWidgetConfiguration.ts`
- Cambiare il default di `chatbotEnabled` da `false` a `true`

## File coinvolti
- `supabase/functions/chatbot-reply/index.ts` -- knowledge base Widjet + rimuovere blocco istruzioni vuote
- `src/components/builder/ChatbotPanel.tsx` -- UI aggiornata
- `src/hooks/useWidgetConfiguration.ts` -- default `chatbotEnabled: true`
- Migrazione DB -- default `chatbot_enabled` a `true` + update utenti esistenti
