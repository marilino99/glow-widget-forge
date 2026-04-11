

## Problem

Currently, when `voiceMode` is active, two things change in `chatbot-reply` and `chatbot-preview`:

1. **Different instructions**: The system uses `voice_instructions` instead of `chatbot_instructions`
2. **VOICE MODE RULES appended**: These tell the AI to give short 1-3 sentence replies, skip `[CHIPS:]` markers, avoid markdown/emojis, and speak options aloud instead of showing them as interactive chips

This means Voice mode gets a completely different (simplified) response flow compared to Chat mode.

## Plan

**Remove the voice-specific divergence** in both `chatbot-reply/index.ts` and `chatbot-preview/index.ts`:

1. **Always use `chatbot_instructions`** — remove the conditional that switches to `voice_instructions` when `voiceMode` is true
2. **Remove the `voiceModeRules` block** — stop appending the VOICE MODE RULES that change AI behavior (short replies, no chips, no markdown, etc.)
3. The `voiceMode` flag will still be passed through the pipeline (for potential future use), but it will no longer alter the AI's response logic

### What stays the same
- The voice UI (blob, mic, TTS playback) remains unchanged
- The `voice_instructions` column stays in the DB (no migration needed)
- The `sendMessageText(text, isVoice)` call in widget-loader still passes the flag

### Result
Both Chat and Voice will receive identical AI responses: same discovery flow, same chips, same product cards, same formatting.

