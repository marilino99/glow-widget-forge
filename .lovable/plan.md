

## Plan: Align "All widgets" title with "Back" button

Currently the "Back" button and "All widgets" title are stacked vertically. The user wants them on the same horizontal line.

### Changes

**`src/components/builder/AllChannelsOverlay.tsx`**:
- Combine the "Back" button and "All widgets" `h1` into a single flex row using `flex items-center gap-4`
- Remove the separate `div` wrappers and margins that currently stack them vertically
- The result: "Back" button on the left, "All widgets" title next to it, both vertically centered on the same line

