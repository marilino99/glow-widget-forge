

# Voice Mode: Product Cards Visibility

## What we're building

When the user is in voice mode and the AI recommends products (via `[PRODUCTS:]` marker in the response), the voice view will:
1. Animate the blob upward to make room
2. Show product cards at the bottom of the voice view, scrollable horizontally
3. For generic product questions, the AI already lists categories verbally (this is already implemented via the `VOICE_MODE_HINT` in the system prompt)

## Current state

- Voice view is a full-screen overlay (`#wj-voice-view`) with blob centered and controls at the bottom
- Product cards are rendered only inside chat messages (`renderMessage`) — they are invisible when voice view is open
- Builder preview (`WidgetPreviewPanel.tsx`) has a similar voice overlay with `VoiceBlob3D` centered

## Technical plan

### 1. Widget Loader (`supabase/functions/widget-loader/index.ts`)

**Add CSS for voice product cards:**
- Add `#wj-voice-products` container style: horizontal scroll, positioned at the bottom above the controls
- Add transition on `#wj-voice-blob-wrap` for smooth upward movement (`transition: transform 0.4s ease`)
- When products are shown, blob gets `transform: translateY(-60px)` class

**Add HTML container:**
- Insert an empty `#wj-voice-products` container inside `#wj-voice-view`, between the blob and the bottom controls

**Modify `renderMessage` / polling logic:**
- When voice view is open and a new message arrives with `metadata.products`, populate `#wj-voice-products` with the same product card HTML used in chat
- Add class to blob wrap to trigger upward animation
- Clear voice products when voice session ends

### 2. Builder Preview (`src/components/builder/WidgetPreviewPanel.tsx`)

**Add voice products state:**
- Track `voiceProducts` state — populated when a bot reply in voice mode contains product metadata

**Modify voice view render:**
- When `voiceProducts` is populated, shift the blob upward with CSS transition
- Render a horizontal product card carousel below the blob (reuse existing card markup style)

**Update `speakAssistantReply` / message handling:**
- When in voice mode, extract product metadata from the latest bot message and set `voiceProducts`
- Clear on voice session end

### 3. Voice session cleanup
- On `stopVoiceSession`, clear voice products and reset blob position in both widget-loader and builder

## Files to modify

| File | Change |
|---|---|
| `supabase/functions/widget-loader/index.ts` | Add voice products CSS, HTML container, render logic on poll, blob animation |
| `src/components/builder/WidgetPreviewPanel.tsx` | Add voiceProducts state, blob shift animation, product cards in voice overlay |

