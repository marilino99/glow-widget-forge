

## Plan: Change "+120 reviews" to "+60 reviews" in G2 badge SVG

### Problem
The text in the SVG is rendered as vector paths (not editable text). There's no "6" glyph in the existing paths, so we can't simply swap path data like we did for 4.8→4.4.

### Solution
Replace the large text path (line 2) with SVG `<text>` elements that render "4.4 score, +60 reviews". This gives us editable text while keeping the stars and G2 logo paths untouched.

### What changes
- **`src/assets/g2-badge.svg`**: Remove the single giant path on line 2 that renders all the text. Replace with `<text>` elements styled to match (font-size, fill color `#333`, positioned at the same coordinates ~y=19, starting at ~x=30). Stars (lines 3-9) and G2 logo (lines 10-11) remain completely untouched.

### Risk
The font rendering may look slightly different from the original path-based text since it will depend on the viewer's available fonts. I'll use a system sans-serif font at the matching size to keep it close.

