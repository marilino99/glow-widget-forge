

## Tab bar styling update

The active tab button currently uses a solid `bg-white` background. Based on the reference image, the active tab should have:

- A slightly transparent/frosted background instead of pure white
- A subtle warm gradient (very light, almost imperceptible)
- Softer shadow and slightly more rounded feel

### Technical changes

**File: `src/components/landing/DashboardPreview.tsx`**

Update the active tab button classes (line 61):
- Replace `bg-white text-[#110c29] shadow-lg` with a semi-transparent background using a subtle linear gradient
- Use inline style for the gradient: `background: linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7))` with `backdrop-blur-sm`
- Keep the dark text color and add a soft `shadow-md` instead of `shadow-lg`
- Add a faint `border border-white/30` to the active button for that frosted edge

This will make the active tab look translucent with a gentle warmth, matching the reference screenshot.

