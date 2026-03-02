
# Restructure Top Header to Match ElevenLabs Design

## Current State
The builder has a full-width top bar with the logo on the left and actions/account on the right. Below that, the sidebar starts with a PanelLeft toggle button and workspace selector.

## Target Design (from screenshot)
The ElevenLabs layout has:
- **Logo** ("Widjet") at the top-left of the **sidebar area**, not a full-width bar
- **Workspace selector** ("ElevenCreative" with avatar and chevron) below the logo, still inside the sidebar
- A **vertical border** (the sidebar's right border) separates these from the main content
- On the **right side of the vertical border**, at the **same height as the logo**, sits the current view label ("Home") with a sidebar collapse/expand icon

There is NO full-width top bar spanning the entire page.

## Plan

### 1. Remove the full-width top header bar
Delete the current `h-12` top bar that spans the full width with logo, Feedback, Docs, Bell, and account dropdown.

### 2. Move logo into sidebar top area
Place the Widjet logo at the top of the sidebar column, replacing the current PanelLeft toggle button position. The logo sits at the top-left, inside the sidebar, with consistent height (e.g. `h-12` row).

### 3. Keep workspace selector below logo
The existing workspace selector (popover with widget name and favicon) stays in the sidebar, directly below the logo -- no changes needed there.

### 4. Add view label + sidebar toggle in main content header
At the top of the main content area (right of the sidebar border), add a row at the same height as the logo row containing:
- The **sidebar collapse/expand icon** (PanelLeft) on the left
- The **current view label** ("Home", "Conversations", etc.) next to it

This row aligns horizontally with the logo row in the sidebar.

### 5. Move account dropdown and action buttons
Move Feedback, Docs, Bell, and account avatar dropdown to the **right side** of this new main content header row, keeping them accessible.

### Technical Details

**File: `src/pages/Builder.tsx`**

- Remove the top-level `<div className="shrink-0 flex items-center justify-between border-b ...">` block (lines 320-381)
- In the sidebar column (starting ~line 387), replace the PanelLeft toggle with the Widjet logo at the top, followed by a border-b, then the workspace selector
- Add a new header row inside the main content area (`flex-1` div) with:
  - Left: PanelLeft toggle + view label
  - Right: Feedback, Docs, Bell, Account dropdown
- Both the sidebar logo row and the main content header row share the same fixed height (`h-12`) and have `border-b` to create the continuous horizontal line with the vertical sidebar border intersecting it
