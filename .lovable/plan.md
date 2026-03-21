

## Problem

When the user clicks "Find the right product for me", the AI correctly follows rule 11 (ask for categories with `[CHIPS:]`), but the **product fallback** at lines 558-574 detects product intent keywords in the user message and forces product cards anyway — overriding the AI's intended category discovery flow.

## Solution

Reorder the parsing logic so `[CHIPS:]` is extracted **before** the product fallback, and skip the fallback when chips are present.

## Changes

### File: `supabase/functions/chatbot-reply/index.ts`

1. **Move `[CHIPS:]` parsing** (currently at lines 576-586) to **before** the product fallback block (before line 558).

2. **Add a chips guard** to the product fallback condition at line 558:
   ```
   // Only fallback to products if NO chips were found
   } else if (productCardsData && productCardsData.length > 0 && !metadata?.chips) {
   ```

This way, when the AI responds with categories (`[CHIPS: Uomo, Donna, Accessori]`), the fallback won't override it with product cards.

### Deployment
- Redeploy `chatbot-reply` edge function.

