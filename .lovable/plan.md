

## Problem

The `syncCartUi` function (line 1352) runs **up to 4 times** with delays, and **each iteration** calls `emitThemeEvents(cart)` which dispatches `cart:update` CustomEvents to the Horizon theme. The Horizon theme reacts to each event by re-rendering the cart UI, causing the count to spike (multiple adds queued) then settle back down to the real count.

Additionally, `refreshThemeSections()` replaces section HTML on the first attempt, which can trigger the theme's own JS to re-initialize and fire its own cart events — compounding the problem.

## Solution

Simplify the cart sync to **emit theme events only once** and remove the aggressive retry loop:

### Changes to `supabase/functions/widget-loader/index.ts`

**Replace the `syncCartUi` retry loop (lines 1352-1371) with a single fetch + emit:**

1. Fetch `/cart.js` once after a short delay (~300ms)
2. Call `applyCartCount()` to update badge selectors directly
3. Call `emitThemeEvents()` **exactly once**
4. Call `refreshThemeSections()` **exactly once**
5. **No retries** — the duplicate events are what cause the "jumpy" counter

This means:
- Remove `syncAttempt`, `maxSyncAttempts` variables
- Replace `syncCartUi` with a single `setTimeout` that fetches `/cart.js`, applies count, emits events, and refreshes sections — all once
- Add a small delay (~300ms) before the sync to let Shopify's backend process the add

