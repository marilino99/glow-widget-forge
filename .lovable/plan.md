

# Voice Mode: Full Discovery Flow Parity

## Problem

Currently in voice mode, when the user asks for product help, the AI follows the discovery flow (categories → goals → products) but:
- **Chips (categories/goals) are only rendered in the hidden chat view** — the user in voice mode never sees them
- The user can only respond by speaking, with no visual feedback about available options
- Products already show correctly in voice view (blob shifts up + cards appear)

The user wants the **exact same multi-step flow as chat** replicated in voice, with chips shown visually at each step and products only at the final step.

## Plan

### 1. Add Voice Chips Container (widget-loader)

Add a `#wj-voice-chips` container inside `#wj-voice-view`, positioned below the blob (above controls). When the AI sends `metadata.chips`, render them as tappable buttons in the voice overlay — same style as chat chips but adapted for the voice view layout.

**CSS additions:**
- `#wj-voice-chips`: horizontal wrap layout, centered, positioned between blob and controls
- `.wj-voice-chip`: styled like discovery chips but slightly larger for touch targets

**HTML:** Add empty `<div id="wj-voice-chips"></div>` inside voice view

### 2. Show Chips in Voice View on Poll (widget-loader)

In the polling loop (around line 2720), when voice view is open and a new bot message has `metadata.chips`:
- Populate `#wj-voice-chips` with chip buttons
- Each chip sends its text as a message when tapped (same as chat chips)
- Clear previous chips when new ones arrive
- Clear chips when products arrive (final step)

### 3. Chips Click → Send as Voice Message (widget-loader)

When a voice chip is clicked:
- Send the chip text as a visitor message via `sendMessageText()`
- Remove the chips container
- Show typing/processing state

### 4. Clear Chips on Voice Session End (widget-loader)

In `closeVoiceView()` and `clearVoiceProducts()`, also clear `#wj-voice-chips`.

### 5. Builder Preview Parity (WidgetPreviewPanel.tsx)

- Add `voiceChips` state alongside `voiceProducts`
- When in voice mode and bot reply has `metadata.chips`, set `voiceChips`
- Render chip buttons in the voice overlay (below blob, above controls)
- Chip click sends message and clears chips
- Clear chips when products arrive or voice session ends

## Files to modify

| File | Change |
|---|---|
| `supabase/functions/widget-loader/index.ts` | Add voice chips CSS, HTML container, render on poll, click handler, cleanup |
| `src/components/builder/WidgetPreviewPanel.tsx` | Add voiceChips state, render in voice overlay, click handling, cleanup |

