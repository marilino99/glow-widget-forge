

## Hide Initial Chips When Voice Mode Sends a Message

### Problem
When users speak in voice mode, their messages appear in the chat via `sendMessageText()`, but the initial quick-action chips ("Cercare il prodotto adatto a me", "Tracciare il mio ordine", "Ho bisogno di piu informazioni") remain visible. When returning to chat view, these chips clutter the conversation alongside the user's actual spoken messages.

### Solution
Remove the initial chips container (`#wj-chat-chips`) inside `sendMessageText()` so that any message -- whether typed, chip-clicked, or voice-spoken -- automatically hides the initial chips.

### Changes

**File: `supabase/functions/widget-loader/index.ts`**
- In the `sendMessageText()` function (around line 2543), add a line to remove the initial chips container right after the message is rendered:
  ```js
  function sendMessageText(text, isVoice) {
    if (!text || !text.trim()) return;
    var msg = text.trim();
    // Remove initial quick-action chips on first message
    var initChips = d.getElementById('wj-chat-chips');
    if (initChips) initChips.remove();
    // ... rest of function
  }
  ```

**File: `src/components/builder/WidgetPreviewPanel.tsx`**
- Apply the same logic in the preview panel's equivalent send function so the builder preview matches the live widget behavior.

### Scope
- Two files modified, one line added in each
- No database changes
- Redeploy `widget-loader` edge function

