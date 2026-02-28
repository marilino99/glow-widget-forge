

## Add Gradient Chart Line to "Live Insights" Card

Add an SVG-based area chart with a smooth curved line and gradient fill to the "Live insights into your team and AI" card, matching the reference image style.

### Design
- Smooth upward-trending curved line (SVG path) starting from bottom-left
- Line color transitions from cyan (#00d4ff) through blue (#4f46e5) to purple (#a855f7) using an SVG linear gradient
- Area fill below the line with a matching gradient that fades to transparent at the bottom
- Positioned at the bottom of the card, extending edge-to-edge within the rounded corners
- The card needs `overflow-hidden` and `relative` positioning to clip the chart properly

### Technical Changes

**File: `src/components/landing/AIControl.tsx`**

1. Create a new `InsightsChart` component using inline SVG (no recharts dependency needed for a static decorative element):
   - SVG with `viewBox` and `preserveAspectRatio="none"` to stretch responsively
   - A smooth cubic bezier path simulating an upward growth chart
   - `linearGradient` for the stroke (cyan to blue to purple)
   - `linearGradient` for the fill area (matching colors, fading to transparent vertically)
   - Thick stroke (3-4px) with `strokeLinecap="round"` and `strokeLinejoin="round"`

2. Update the "Insights" card (line 188):
   - Add `relative overflow-hidden` to the card's className
   - Add bottom padding (`pb-40 md:pb-48`) to make room for the chart
   - Render `<InsightsChart />` absolutely positioned at the bottom of the card

