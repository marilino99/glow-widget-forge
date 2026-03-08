

# RAG Storage Indicator in Builder Header

## What
Add a "RAG Storage" badge in the top-right header bar of the builder (next to Feedback/Bell/Avatar), showing current usage vs. limit. Like the screenshot reference: a pill with a green dot, bold usage, and max capacity. Hovering shows a tooltip with details and a progress bar.

## Storage Limits per Plan
- **Free**: 1 MB (reasonable for ~10-20 scraped pages with embeddings)
- **Plus**: 10 MB
- **Business**: 100 MB

## How It Works
The storage size is calculated client-side by querying `training_chunks` (sum of content text length) for the current user. This is a lightweight approximation — no need for a new DB column or edge function.

## Technical Plan

### 1. Create `src/hooks/useRagStorage.ts`
- Query `training_chunks` table filtered by `user_id`, selecting `content`
- Sum up `content.length` (bytes) of all chunks to get total usage
- Return `{ usedBytes, limitBytes, usagePercent, isLoading }`
- Limit determined by plan (passed as param or from subscription)

### 2. Update `src/pages/Builder.tsx` (header bar, line ~654)
- Import the hook and render a small pill/badge before FeedbackPopover
- Design: rounded pill with border, green dot (amber if >70%, red if >90%), bold used size, "/" limit
- Wrap in a Tooltip (from Radix) showing "Total RAG usage — X of Y" with a thin progress bar beneath
- Format bytes with a helper (0 B, 1.2 KB, 3.5 MB, etc.)

### Layout
```text
[ PanelLeft | View Label ]          [ RAG: 0B/1MB ] [ Feedback ] [ Bell ] [ Avatar ]
```

The pill matches the style in the screenshot — compact, clean, with a colored status dot.

