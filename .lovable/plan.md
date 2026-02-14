

## Problem

The purple glow (box-shadow) around the hero image is not visible because the parent `<section>` element in the Hero component has `overflow-hidden` applied, which clips any shadow that extends beyond the section boundaries.

**Line 18 in Hero.tsx:**
```
<section className="relative overflow-hidden px-6 pb-24 pt-10 md:pb-32 md:pt-16">
```

The `overflow-hidden` is there to contain the background blur effects (the decorative blobs), but it also clips the `box-shadow` on the hero image.

## Solution

Two changes are needed:

1. **Hero.tsx** - Remove `overflow-hidden` from the `<section>` tag and instead move it to the background effects container only (the div with the decorative blobs), so the glow on the image is no longer clipped.

2. Specifically, change the section class from `overflow-hidden` to `overflow-x-clip` (or remove it entirely), which will prevent horizontal scrollbar from the blobs but still allow the vertical glow to be visible. Alternatively, move `overflow-hidden` to only the background blobs wrapper div.

## Technical Details

- **File**: `src/components/landing/Hero.tsx`, line 18
- Change: Replace `overflow-hidden` on the `<section>` with `overflow-x-clip` to only clip horizontal overflow (preventing scrollbar from blobs) while allowing the vertical box-shadow glow to render visibly.
- The background blobs container (line 20) already has `overflow-hidden`, so horizontal containment is handled there too.

