

## Piano: Impedire la ripetizione vocale quando l'utente non parla

### Problema
Quando l'utente non parla dopo una risposta vocale dell'AI, il widget continua a ripetere l'ultima frase. Questo succede perché:
1. Il TTS finisce → riavvia il riconoscimento vocale
2. Il riconoscimento non riceve input → si chiude (`onend`)
3. `onend` riavvia il riconoscimento automaticamente (loop infinito)
4. In alcuni browser, `continuous: true` può ri-triggerare `onresult` con risultati precedenti, causando il re-invio dello stesso messaggio e quindi la ri-lettura della stessa risposta

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

1. **Aggiungere un ref `lastSpokenTextRef`** per tracciare l'ultima frase pronunciata dal TTS, evitando di ripeterla:
   - In `speakAssistantReply`: salvare il testo nel ref prima di pronunciarlo
   - Non pronunciare se il testo è identico all'ultimo già letto (reset del ref solo quando l'utente manda un nuovo messaggio)

2. **Rimuovere `continuous: true`** dalla configurazione del recognition — usare singole sessioni che si riavviano solo su `onend`, con un contatore di tentativi a vuoto:
   - Dopo 3 cicli senza input vocale, smettere di riavviare e restare in stato "listening" (microfono attivo visivamente ma senza loop aggressivo)
   - Reset del contatore quando arriva un `onresult` valido

3. **Aggiungere debounce nel restart** del recognition in `utterance.onend`: piccolo delay (300ms) prima di riavviare, per evitare race condition

4. **Stessa logica nel widget-loader** (`supabase/functions/widget-loader/index.ts`): cercare nel template string la logica equivalente e applicare gli stessi guard (lastSpokenText, max retry senza input, no continuous)

### File coinvolti
- `src/components/builder/WidgetPreviewPanel.tsx`
- `supabase/functions/widget-loader/index.ts`

### Risultato
- L'AI saluta e risponde a voce
- Se l'utente non parla, il widget resta in ascolto silenzioso senza ripetere
- Quando l'utente parla, il ciclo conversazionale riprende normalmente

