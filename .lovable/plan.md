

## Fix Voice Mode TTS: Make the Chatbot Speak Responses Aloud

### Root Cause
Two issues are preventing voice responses:

1. **ElevenLabs API key is invalid** — every call returns 401, so the system falls back to browser Web Speech API.
2. **Browser fallback has a critical double-callback bug** — the safety timeout (line 2467-2470) fires `resumeListening()` after ~1-5 seconds regardless of whether the utterance is still playing. This cancels the speech mid-sentence (because `resumeListening` restarts recognition, which can interfere) or triggers the callback twice, breaking the flow.

### Plan

**1. Fix the `fallbackSpeak` double-callback bug in `widget-loader/index.ts`**
- Add a `done` flag so that `onend`, `onerror`, and the safety timeout only fire the callback **once**.
- The safety timeout should only act if neither `onend` nor `onerror` have fired yet.
- Increase the safety timeout ceiling from 5s to 15s — long AI responses need more time to be spoken.

```js
function fallbackSpeak(text, onDone) {
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    if (onDone) onDone();
    else resumeListening();
  }
  if (w.speechSynthesis) {
    try { w.speechSynthesis.cancel(); } catch(e) {}
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = langMap[lang] || 'en-US';
    utter.rate = 1.0;
    utter.onend = finish;
    utter.onerror = finish;
    try {
      w.speechSynthesis.speak(utter);
      // Safety net with generous timeout
      setTimeout(finish, Math.min(Math.max(text.length * 60, 2000), 15000));
    } catch(e) { finish(); }
  } else { finish(); }
}
```

**2. Apply same fix in `WidgetPreviewPanel.tsx`**
- Mirror the double-callback fix in the builder preview's fallback TTS function.

**3. Redeploy `widget-loader` edge function**

### What stays the same
- ElevenLabs TTS flow — it will automatically work once a valid API key is configured via the connector
- Voice recognition, blob UI, voice mute — unchanged
- No database changes

### Note on ElevenLabs
The API key configured in the connector is currently invalid (all calls return 401). The browser fallback will work with this fix, but for premium voice quality, the ElevenLabs connector needs to be reconnected with a valid key via **Settings > Connectors > ElevenLabs**.

