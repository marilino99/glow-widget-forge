
# Migrare chatbot-preview a Google Gemini 2.0 Flash

## Situazione attuale
- `chatbot-reply` (produzione): usa gia Google Gemini 2.0 Flash direttamente -- nessuna modifica necessaria
- `chatbot-preview` (builder): usa Lovable AI Gateway -- da migrare a Google Gemini API diretta

## Cosa cambia

### File: `supabase/functions/chatbot-preview/index.ts`

1. Sostituire `LOVABLE_API_KEY` con `GOOGLE_GEMINI_API_KEY` (gia configurata)
2. Convertire il formato messaggi da OpenAI-compatible a formato Gemini nativo:
   - Da `{ role: "system"/"user"/"assistant", content: "..." }` 
   - A `{ role: "user"/"model", parts: [{ text: "..." }] }` con `system_instruction` separata
3. Cambiare l'endpoint da `ai.gateway.lovable.dev` a `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
4. Aggiornare il parsing della risposta da `choices[0].message.content` a `candidates[0].content.parts[0].text`

## Limiti gratuiti di Gemini 2.0 Flash
- 15 richieste al minuto (RPM)
- 1.500 richieste al giorno (RPD)
- 1 milione di token al minuto

Questo dovrebbe essere piu che sufficiente per l'uso in preview/builder.

## Dettagli tecnici

Il modello selezionato sara `gemini-2.0-flash` nell'URL dell'endpoint. Nessuna nuova chiave API necessaria, la `GOOGLE_GEMINI_API_KEY` e gia presente nei secrets.
