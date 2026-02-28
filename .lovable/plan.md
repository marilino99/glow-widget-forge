

# Chats by Country -- World Map + Ranking

## Overview
Replace the current "Chats by country" section with a two-column layout: a lightweight SVG world map on the left (countries colored by chat volume) and the top-5 country ranking list on the right, matching the reference screenshot.

## Approach
Use a lightweight inline SVG world map (simplified world paths) rendered as a React component. Countries are highlighted with shades of indigo based on their chat count relative to the maximum. No external map library needed -- keeps the bundle small.

## Changes

### 1. New Component: `src/components/builder/WorldMap.tsx`
- A React component that renders an SVG world map with simplified continent/country paths
- Accepts `countryData` as props (array of `{ country: string; count: number }`)
- Maps country names to SVG path IDs and fills them with indigo shades proportional to count
- Default fill is a very light gray; highlighted countries get `rgba(129,140,248, opacity)` where opacity scales from 0.2 to 1.0
- Uses a standard simplified world SVG with major countries as separate paths (US, India, UK, Germany, France, Brazil, Canada, Australia, Japan, China, etc.)

### 2. Update `src/components/builder/BuilderHome.tsx`
- Replace the current "Chats by country" card content with a two-column grid layout (`lg:grid-cols-[1fr,300px]`)
- **Left column**: The `WorldMap` component showing the colored map
- **Right column**: The existing country ranking list (country name, horizontal bar, count) -- styled with a left border separator
- Keep the same data fetching logic and loading/empty states

### Layout (matching screenshot)
```text
+-----------------------------------------------+
| Chats by country                               |
| +---------------------------+--+--------------+|
| |                           |  | US       500 ||
| |   [World Map SVG]         |  | ████████████ ||
| |   countries colored by    |  | India    456 ||
| |   chat volume             |  | ██████████   ||
| |                           |  | ...          ||
| +---------------------------+--+--------------+|
+-----------------------------------------------+
```

### Technical Details
- The SVG world map uses simplified GeoJSON-derived paths for ~30 major countries
- Country name matching uses a lookup map (e.g., "United States" -> "US" path ID)
- The component is purely presentational -- no interactivity needed
- Responsive: on mobile, the layout stacks vertically (map on top, ranking below)

