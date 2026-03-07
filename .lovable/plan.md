

## Problem

The sidebar uses `hidden lg:flex` which hides it entirely below 1024px. When the window shrinks to ~50% of a desktop screen (~960px), it crosses the `lg` breakpoint and the sidebar disappears completely instead of just shrinking to mini mode.

## Solution

Change the sidebar visibility breakpoint from `lg:flex` (1024px) to `md:flex` (768px). This way:
- Below 768px (true mobile): sidebar hidden, bottom bar shown
- Between 768px and 1100px: sidebar visible but auto-collapsed to mini (60px) via the existing resize listener
- Above 1100px: sidebar fully expanded

### Changes in `src/pages/Builder.tsx`

**Line 392** - Change `hidden lg:flex` to `hidden md:flex` on the sidebar container.

Also update all other `lg:flex` / `lg:hidden` references related to sidebar elements (reopen button at line 626, toggle button at line 646) to use `md:` instead of `lg:` for consistency.

This is a minimal change -- just swapping the Tailwind breakpoint prefix so the sidebar remains visible on tablet/half-screen sizes and the auto-mini logic at 1100px handles the shrinking.

