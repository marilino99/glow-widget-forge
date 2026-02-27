

## Problem

The sticky category headers ("Core", "Advanced", "Enterprise") are not working because:

1. The navbar is **not** fixed or sticky -- it scrolls away normally. So `top-16` and `top-[7.5rem]` are incorrect values since there's nothing at the top of the viewport to account for.
2. The `thead` (plan names row) should stick at `top-0`, and category headers should stick just below the thead height.

## Solution

Replace the table-based layout with a div-based layout. CSS `position: sticky` on `<td>` elements inside `<table>` has inconsistent browser support (especially in Safari/WebKit). Converting to divs with CSS Grid will make sticky positioning work reliably.

### Changes (single file: `PricingComparison.tsx`)

1. **Replace `<table>` structure with divs using CSS Grid** (5 columns: label + 4 plans)
2. **Plan header row**: a sticky div at `top-0` with `z-10` and `bg-background` containing the plan names, prices, and CTA buttons
3. **Category header rows** (Core, Advanced, Enterprise): sticky divs at a calculated `top` value matching the header height (approx `top-[9rem]`), with `z-[5]` and `bg-background`
4. **Feature rows**: standard grid rows with border-top styling

This approach guarantees cross-browser sticky behavior since divs fully support `position: sticky` unlike table cells.

### Technical Details

- The outer container will use `display: grid` with `grid-template-columns: 30% repeat(4, 1fr)`
- Each "row" becomes a set of grid items spanning across the columns
- Category headers use `grid-column: 1 / -1` (span all columns) with `position: sticky`
- Plan header section uses the same full-span sticky approach
- All existing styling (colors, fonts, spacing) will be preserved
