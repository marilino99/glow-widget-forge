
# Add Wix Integration Button to "Add to Website" Dialog

## Overview
Add a dedicated Wix button with the Wix logo to the installation help section. When clicked, it will open a dialog/panel with Wix-specific installation instructions using the "Embed code" tool.

## Implementation Details

### 1. Create Wix Logo SVG Component
Create a new component for the Wix logo to maintain clean code:
- File: `src/components/icons/WixLogo.tsx`
- Official Wix brand colors (black/white)

### 2. Update AddToWebsiteDialog Component
Modify `src/components/builder/AddToWebsiteDialog.tsx`:

**Changes to the integration section (lines 119-128):**
- Replace the plain text list with clickable platform buttons
- Add Wix button with logo that triggers a Wix-specific guide
- Style buttons consistently with the existing design

**Add new state and UI:**
- Add `showWixGuide` state to toggle Wix instructions panel
- When Wix button is clicked, show inline step-by-step instructions:
  1. Open Wix Editor
  2. Click "Add Elements" (+)
  3. Select "Embed code"
  4. Click the code box → "Enter Code"
  5. Paste the widget code
  6. Position and publish

### 3. UI Structure

```text
+------------------------------------------+
| Need help with the installation?         |
| [Send instructions] [Write to us]        |
+------------------------------------------+
| Try seamless integration with:           |
| [Wix logo] [WordPress] [Shopify] [...]   |
+------------------------------------------+
           ↓ (when Wix clicked)
+------------------------------------------+
| Install on Wix                     [X]   |
| 1. Open Wix Editor                       |
| 2. Click "Add Elements" (+)              |
| 3. Select "Embed code"                   |
| 4. Click box → "Enter Code"              |
| 5. Paste code below                      |
| [Copy Wix Code]                          |
| 6. Position & Publish                    |
+------------------------------------------+
```

## Technical Details

### Files to Create
1. `src/components/icons/WixLogo.tsx` - SVG component

### Files to Modify
1. `src/components/builder/AddToWebsiteDialog.tsx`:
   - Add state for `showWixGuide`
   - Import WixLogo component
   - Replace text platform list with button grid
   - Add collapsible Wix guide section with numbered steps

### No API Key Required
This implementation uses a guided manual approach - the user still copies the embed code but gets Wix-specific instructions. No Wix API credentials needed.

### Future Enhancement (Optional)
The native Wix App integration (requiring OAuth) can be added later following the documented plan in `.lovable/wix-app-integration-plan.md`.
