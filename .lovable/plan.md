

## Problem

The purple rotating border is visible, but the diffused glow (box-shadow) around it is still not showing. Looking at the screenshot confirms this -- the border is sharp with no soft purple aura around it.

The likely cause is that the `motion.div` wrapper (line 96-101) or the flex layout container may still be clipping the shadow. Additionally, box-shadow on a white background needs higher opacity to be visible.

## Solution

Two changes:

### 1. Hero.tsx - Add overflow-visible to parent containers
- Add `overflow-visible` to the `motion.div` wrapper (line 101) to ensure box-shadow is not clipped by any parent
- Optionally add padding to the parent flex container so the glow has space to render without being cut by padding/edges

### 2. index.css - Increase glow intensity
- Increase the box-shadow opacity and spread values to make them more visible on a white background
- Use larger spread radius and higher alpha values

### Technical Details

**File: `src/components/landing/Hero.tsx`**
- Line 101: Add `overflow-visible` to the motion.div class
- Line 39 (parent flex container): Add some padding or overflow-visible to prevent clipping

**File: `src/index.css`**
- Increase `.hero-image-border` box-shadow values:
  - First layer: `0 0 50px 5px hsl(270, 80%, 60% / 0.5)`
  - Second layer: `0 0 100px 15px hsl(270, 70%, 55% / 0.3)`
  - Third layer: `0 0 150px 25px hsl(270, 60%, 50% / 0.15)`

