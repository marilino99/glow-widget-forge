

## Fix: Restore Details Panel Margins

The previous fix added `overflow-hidden` and changed visibility from `md:flex` to `lg:flex`, which is clipping the content (IDs, badges, etc.) and hiding the panel at your viewport width.

### Changes
**`src/components/builder/ConversationsPanel.tsx`** (line 506):
- Remove `overflow-hidden` from the Details panel container
- Change `hidden lg:flex` back to `hidden md:flex` so it's visible at the current viewport size
- This restores the original behavior where text naturally truncates via CSS (`truncate` classes) without hard-clipping the entire panel

