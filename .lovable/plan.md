

## Voice Mode: Verbalize Categories Instead of Chips

### Problem
After unifying chat and voice responses, both modes now rely on visual chips for the category discovery flow. But chips are a visual UI element — in voice mode, the user hears the AI response via TTS but can't "see" the chips. The AI needs to **say the categories aloud** in voice mode so the listener knows their options.

### Approach
Add a small voice-mode-aware instruction **only for the category discovery step** in both `chatbot-reply/index.ts` and `chatbot-preview/index.ts`. Everything else stays unified.

### What changes
In the system prompt's **Category Discovery Flow** rule (rule 11 / the equivalent in preview), add a conditional sentence:

- **Chat mode** (current behavior): "The category chips will be added automatically — just write a short question."
- **Voice mode** (new): "List the available categories naturally in your response, e.g. 'Ok, stai cercando skincare, haircare, abbigliamento o scarpe?' so the listener can hear the options."

The `voiceMode` flag is already passed to both functions. We just need to use it to toggle one line in the system prompt.

### Files modified
1. `supabase/functions/chatbot-reply/index.ts` — add voice-mode conditional text in the category discovery rule
2. `supabase/functions/chatbot-preview/index.ts` — same change

### What stays the same
- The full discovery flow (category → goal → skin/hair type → products) is identical
- Product cards, `[PRODUCTS:]` markers, `[CHIPS:]` markers all work the same
- Voice UI, TTS, blob — unchanged
- No database changes

