

## Problem
The purple glow around the hero image is barely visible — it appears as a thin line rather than a dramatic diffused aura. Two issues:

1. **CSS Compatibility**: The modern `hsl(270, 80%, 60% / 0.6)` alpha syntax may not render correctly in all browsers. The safer `hsla()` syntax should be used instead.
2. **Intensity**: Even if rendering, the values are too subtle for a white background. The glow needs to be significantly more dramatic.

## Solution

### File: `src/index.css` (line 243)

Replace the current `box-shadow` with much more intense values using `hsla()` syntax for full browser compatibility:

```css
.hero-image-border {
  box-shadow: 
    0 0 30px 10px hsla(270, 80%, 60%, 0.7),
    0 0 60px 20px hsla(270, 75%, 55%, 0.5),
    0 0 100px 40px hsla(270, 70%, 55%, 0.35),
    0 0 160px 60px hsla(270, 65%, 50%, 0.2),
    0 0 220px 80px hsla(270, 60%, 50%, 0.1);
}
```

This adds 5 layers with:
- Higher opacities (0.7 for the innermost layer)
- Larger spread values (up to 80px spread, 220px blur)
- `hsla()` syntax for full browser support

No changes needed in Hero.tsx — the overflow-visible is already in place.

