

## Make the wow-pill background solid white

The pill already has `background: #ffffff` but the issue is that the page background behind the glow may not be fully white, making the glow look off. The fix is simple:

### Change in `src/index.css`

Ensure the `.wow-pill` has a clean solid white background with no transparency or inherited values interfering. The current code already sets `background: #ffffff`, so the real issue might be that the `::after` glow pseudo-element is bleeding through. We need to make sure the pill itself sits cleanly on top with an opaque white fill.

- Confirm `background: #ffffff` on `.wow-pill`
- Add `box-shadow: none` to remove any residual shadow
- Ensure `isolation: isolate` and proper `z-index` stacking so the white background covers the glow behind the text area, while the glow only appears around the edges (exactly like the ClickUp reference)

This is a one-line verification/tweak in `src/index.css`.

