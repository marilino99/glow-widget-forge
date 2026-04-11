

# Fix: Voice Mode Must List All Categories on Unrecognized Input

## Problem

When the user says "something else" or gives an unrecognized category in voice mode, the AI responds with "I'm not sure what you're looking for" instead of listing all available product categories.

## Root Cause

The voice prompt (rule 12) says to "list the available categories naturally" but does not explicitly instruct the AI to **re-list all categories when the user's response doesn't match any known category**. The AI interprets an unrecognized answer as a dead end.

## Fix

Update rule 12 (CATEGORY DISCOVERY FLOW) in the **default voice prompt** of both `chatbot-reply` and `chatbot-preview` to add an explicit instruction:

> "If the visitor says something that doesn't match any category, or says 'something else' / 'other', DO NOT say you don't understand. Instead, list ALL available product categories again so the visitor can choose."

### Files to modify

| File | Change |
|---|---|
| `supabase/functions/chatbot-reply/index.ts` | Update voice prompt rule 12 + chat prompt category rule to handle unrecognized category input |
| `supabase/functions/chatbot-preview/index.ts` | Same change for builder preview parity |

### Exact prompt change (both files, voice section)

Current rule 12:
```
12. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): When the visitor wants help choosing, list the available categories naturally in your spoken response so they can HEAR the options. DO NOT show [PRODUCTS:] during discovery.
```

Updated rule 12:
```
12. CATEGORY DISCOVERY FLOW (HIGHEST PRIORITY): When the visitor wants help choosing, list the available categories naturally in your spoken response so they can HEAR the options. DO NOT show [PRODUCTS:] during discovery. If the visitor says something that doesn't match any category (e.g. "something else", "other", or an unrecognized term), DO NOT say you don't understand — instead, list ALL the available categories again so they can pick one.
```

The same addition will be applied to the chat prompt's category discovery rule for full parity.

