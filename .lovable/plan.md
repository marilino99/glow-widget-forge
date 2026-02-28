

# Chats by Country Section

## Overview
Add a "Chats by country" section below the performance chart, displaying a top-5 country ranking with horizontal bar charts (matching the screenshot reference). Since geographic data isn't currently tracked, we'll need both database and backend changes.

## Changes Required

### 1. Database Migration
Add a `country` column to the `conversations` table to store the visitor's country when a chat is initiated.

```sql
ALTER TABLE conversations ADD COLUMN country text DEFAULT NULL;
```

### 2. Edge Function Update (`send-chat-message/index.ts`)
When creating a new conversation, detect the visitor's country from the request IP using a free geolocation API (e.g., `https://ipapi.co/{ip}/country_name/`) and store it in the `country` field. The IP is extracted from the `x-forwarded-for` header. This only runs on conversation creation (not every message).

### 3. BuilderHome UI (`src/components/builder/BuilderHome.tsx`)
Add a new section below the chart area with:
- **Title**: "Chats by country"
- **Layout**: Full-width card with the top 5 countries listed as rows
- Each row shows: country name, a horizontal progress bar (indigo, proportional to max), and the count number
- Data is fetched from conversations grouped by country within the selected date range
- Countries with `null` are labeled as "Unknown"
- Styled consistently with the existing card design (rounded-2xl, border, etc.)

### Technical Notes
- The query groups conversations by `country`, counts them, orders descending, and limits to 5
- The horizontal bars use simple `div` widths calculated as percentage of the top country's count
- No map library is needed -- the screenshot's key feature is the ranking list on the right, which we replicate as the full component (adding a world map SVG would add significant complexity for little value at this stage)
- Existing conversations won't have country data until the edge function update is deployed; the UI handles nulls gracefully

