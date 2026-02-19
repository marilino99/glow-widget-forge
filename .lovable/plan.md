
## Fix: Remove Black Gap in Chat Scroll

### Problem
The chat messages container uses `flex-1` which stretches to fill all vertical space. When messages don't fill the entire area, a large black gap appears between the last message and the input box.

### Solution
Wrap the messages inside the scroll container with a flex column that uses `justify-end`, so messages are pushed to the bottom of the scrollable area -- eliminating the gap between the last message and the input field.

### Technical Details

**File:** `src/components/builder/WidgetPreviewPanel.tsx`

1. Update the chat messages container (line 885) from:
   ```tsx
   <div className="flex-1 overflow-y-auto px-4 py-4">
   ```
   to:
   ```tsx
   <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col justify-end">
   ```

   This single class addition makes messages stack from the bottom up, so the input always sits directly below the last message with no gap. When messages overflow, scrolling works normally.

2. Reduce bottom padding on the input container (line 935) from `p-4` to `px-4 py-2` to tighten the spacing between messages and input, matching the reference screenshot.
