

## Plan: Dynamic Color & Background Sync for Widget Preview

### Summary
When you select a color in the Theme & Colors panel, the widget preview will update in real-time to reflect:
1. **Button colors** - All buttons ("Contact us", "Show") will use the selected color
2. **Background** - When "Gradient" is selected, the widget background will show a subtle gradient based on the selected color

---

### Changes Overview

#### 1. Add Background Type to Configuration
- Add `backgroundType` to the widget configuration so it syncs between the panel and preview
- Update the configuration hook and database (if needed) to persist this setting

#### 2. Create Color Mapping System
Define how each color name translates to:
- Button background color (e.g., "blue" → `bg-blue-500`)
- Gradient background (e.g., "blue" → gradient from blue to a complementary shade)

| Color | Button | Gradient (Light Theme) | Gradient (Dark Theme) |
|-------|--------|------------------------|----------------------|
| blue | `bg-blue-500` | Violet → White → Cyan | Blue → Slate-900 |
| purple | `bg-purple-500` | Purple → White → Pink | Purple → Slate-900 |
| cyan | `bg-cyan-500` | Cyan → White → Emerald | Cyan → Slate-900 |
| green | `bg-green-500` | Green → White → Lime | Green → Slate-900 |
| etc. | ... | ... | ... |

#### 3. Update Widget Preview Panel
Apply the selected color dynamically to:
- "Contact us" button
- "Show" button (product cards)
- Chat send button accent
- Widget background (when gradient mode is active)

#### 4. Update Theme Colors Panel
- Pass `backgroundType` up to parent when changed
- Show the current color in the preview thumbnails (solid/gradient options)

---

### Technical Details

**Files to modify:**

1. **`src/hooks/useWidgetConfiguration.ts`**
   - Add `backgroundType: "solid" | "gradient" | "image"` to the configuration interface
   - Update default value and database mapping

2. **`src/components/builder/ThemeColorsPanel.tsx`**
   - Lift `backgroundType` state to props (receive from parent, notify on change)
   - Update preview thumbnails to reflect current selected color

3. **`src/components/builder/BuilderSidebar.tsx`**
   - Pass `backgroundType` and handler through to ThemeColorsPanel

4. **`src/pages/Builder.tsx`**
   - Add `backgroundType` to the config state passed to WidgetPreviewPanel

5. **`src/components/builder/WidgetPreviewPanel.tsx`**
   - Create color mapping object for button and gradient colors
   - Replace hardcoded colors (`bg-blue-500`, `bg-cyan-500`) with dynamic values
   - Apply gradient background based on `backgroundType` and `widgetColor`

---

### Example Color Application

```text
Selected: purple + gradient + light theme
┌──────────────────────────────┐
│  Background: gradient from   │
│  violet-100 → white → pink-50│
├──────────────────────────────┤
│  [Contact us] → bg-purple-500│
│  [Show]       → bg-purple-500│
└──────────────────────────────┘
```

---

### Database Migration (if persisting)
If you want `backgroundType` to persist, we'll add it to the `widget_configurations` table:
- Column: `background_type` (text, default: 'gradient')

