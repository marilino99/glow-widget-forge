

## Fix Chart Line to Match Reference Image

The reference image shows a very specific wave pattern: the line has smooth, rounded S-curve "steps" -- each step consists of a gentle dip down followed by a rise to a higher level, like a staircase with smooth wave transitions. The line is also thicker and more uniform.

### Changes to `src/components/landing/AIControl.tsx`

**Update the SVG path data** to replicate the stair-step wave pattern from the reference:
- Each "step" is a smooth S-curve: the line plateaus briefly, dips slightly, then climbs to the next level
- The oscillations are gentle and uniform in shape (same wave amplitude at each step)
- The overall trend goes from bottom-left to top-right
- Increase stroke width from 3 to 4 for a thicker, more prominent line matching the reference

**Update the fill gradient** to better match the reference:
- The fill in the reference is a light purple/lavender that fades to transparent at the bottom
- Adjust fill gradient colors to use a purple tint matching the line gradient

**New path design** using smooth cubic bezier curves that create uniform S-shaped steps, approximately 7-8 steps from left to right, each with the same wave shape but progressively higher.

