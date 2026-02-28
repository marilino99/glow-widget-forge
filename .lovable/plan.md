
# Highlight Selected Date Range in Calendar

## Overview
Add visual highlighting to the calendar so that all days within the selected `dateFrom`–`dateTo` range show a subtle background, making the selected period clearly visible.

## Approach
Instead of switching to `mode="range"` (which would change the selection UX), we'll use react-day-picker's `modifiers` and `modifiersStyles` props on both calendars to highlight days that fall within the current range.

## Technical Details

**File: `src/components/builder/BuilderHome.tsx`**

Add to both `<Calendar>` components:
- A `modifiers` prop with an `inRange` modifier that matches days between `dateFrom` and `dateTo`
- A `modifiersStyles` prop that applies a light indigo/purple background (`rgba(129,140,248,0.12)`) and rounded corners to those days
- This gives a soft highlight across the entire selected period without changing the click behavior

The modifier will use `{ after: dateFrom - 1day, before: dateTo + 1day }` (or equivalent date range logic) so both endpoints and all days in between are highlighted.

Both the "Start date" and "End date" calendar views will show this range highlight, giving users immediate visual feedback of their selected timeframe.
