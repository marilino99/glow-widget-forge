

## Problem

Both `chatbot-preview` and `chatbot-reply` have a deterministic early return that fires whenever a product keyword is detected AND Shopify is not connected (line 160 in chatbot-preview). This happens **before** the RAG search and knowledge base lookup, so the chatbot never checks if the answer exists in training sources/FAQs.

## Solution

Remove the early deterministic intercept. Instead:

1. **Let the normal RAG + knowledge base flow run first** (embeddings search, training sources fallback, FAQ items).
2. **After** the knowledge base is assembled, check: if Shopify is not connected AND the query has product intent AND the knowledge base has **no relevant content** (RAG returned nothing useful, no training sources matched), **then** return the "connect Shopify" message.
3. If the knowledge base **does** have relevant content, let the AI answer normally using that content — the system prompt already has the `NO PRODUCT CATALOG` instruction that tells the AI not to invent products.

### Changes in `chatbot-preview/index.ts`

- **Remove** the early return block at lines 160-166 (the `if (!shopifyConn && isProductIntent(queryText))` that returns immediately).
- **Move** the Shopify connect check to **after** the knowledge base is built (after RAG + training sources + FAQ). Add logic:
  ```typescript
  // After knowledgeBase is fully assembled
  if (!shopifyConn && isProductIntent(queryText) && !knowledgeBase.trim()) {
    return Response with getConnectShopifyMessage(...)
  }
  ```
  This way, if training sources or FAQs have relevant info, the AI will use them. Only when there's truly nothing in the knowledge base AND the user is asking about products, we suggest Shopify.

### Changes in `chatbot-reply/index.ts`

- Apply the same pattern: remove the early product-intent intercept, move it after RAG + knowledge base assembly, gated on `!knowledgeBase.trim()`.

### What stays the same
- The `NO PRODUCT CATALOG` instruction in the system prompt remains, so even if the AI answers from the knowledge base, it won't invent products.
- The `isProductIntent` helper and `getConnectShopifyMessage` helper stay unchanged.
- Product cards are still only fetched when Shopify is connected.

