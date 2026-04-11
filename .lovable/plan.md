

## Piano: Separare il Prompt di Sistema in Chat e Voice

### Cosa cambia

Attualmente c'è un unico `system_prompt_template` con un placeholder `{{VOICE_MODE_HINT}}`. Il piano è creare due prompt indipendenti, ciascuno ottimizzato per il proprio canale.

### Modifiche

**1. Database**
- Aggiungere colonna `voice_system_prompt_template` (text, nullable) alla tabella `widget_configurations`

**2. UI — SystemPromptSection.tsx**
- Trasformare in due sezioni con tabs o accordion: "Prompt Chat" e "Prompt Voice"
- Ciascuna con il proprio textarea, pulsante salva, e reset to default
- Il prompt chat di default sarà quello attuale senza `{{VOICE_MODE_HINT}}`
- Il prompt voice di default sarà una versione ottimizzata: risposte brevi (1-2 frasi), tono conversazionale, categorie elencate a voce, niente elenchi puntati

**3. Edge Functions (chatbot-reply + chatbot-preview)**
- Leggere anche `voice_system_prompt_template` dalla config
- Se `voiceMode === true` e `voice_system_prompt_template` esiste → usare quello
- Se `voiceMode === true` ma non c'è template voice → fallback al default voice hardcoded
- Se `voiceMode === false` → usare `system_prompt_template` (o default chat)

**4. Placeholder semplificato**
- Rimuovere `{{VOICE_MODE_HINT}}` dal prompt chat (non serve più)
- Il prompt voice avrà le sue regole native senza bisogno di hint condizionali

### Dettagli tecnici

| Elemento | Dettaglio |
|---|---|
| Nuova colonna DB | `voice_system_prompt_template text DEFAULT NULL` |
| File UI | `src/components/builder/SystemPromptSection.tsx` |
| Edge functions | `chatbot-reply/index.ts`, `chatbot-preview/index.ts` |
| Logica fallback | Chat: `system_prompt_template` → default chat. Voice: `voice_system_prompt_template` → default voice |

