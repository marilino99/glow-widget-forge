

## Plan: Dual Business Mode for Product Cards (Shopify vs Manual)

### Problem
The `chatbot-preview` function still gates product card display behind a Shopify connection check. When no Shopify is connected, it either shows a "connect Shopify" message or tells the AI to say "connect Shopify." The `chatbot-reply` function was partially fixed but the `chatbot-preview` was not. Manual product cards (for gyms, services, etc.) are blocked in the preview chatbot.

### What Changes

**1. `supabase/functions/chatbot-preview/index.ts`** (main fix)
- Remove the `getConnectShopifyMessage` function entirely
- Remove the gate at line 230 that blocks product display when `!shopifyConn`
- Remove the gate at line 327 that intercepts `[PRODUCTS:]` markers and replaces them with "connect Shopify" message
- Update the system prompt (line 269): instead of telling the AI "NO PRODUCT CATALOG: connect Shopify", check if `productCardsData` has items. If yes, show them regardless of Shopify. If no products exist at all, use a generic "no products configured" message
- Fetch `product_cards` for all users (already done), but stop requiring `shopifyConn` to display them

**2. `supabase/functions/chatbot-reply/index.ts`** (cleanup)
- Remove the `getConnectShopifyMessage` function (it's defined but no longer called in this file after previous edits)
- Remove the Shopify connection check (`shopifyConn` query at line 256-260) since it's no longer needed -- product cards are fetched for all users already

**3. Widget-loader** -- No changes needed. It already renders cards with a "View" button linking to `product_url`, and only shows the cart button when `shopifyDomain && p.shopify_variant_id` are present. Manual cards (without variant IDs) already work correctly.

### Result
- **Shopify users**: Product cards sync from Shopify, show "Add to Cart" buttons in the widget
- **Non-Shopify users** (gyms, services): Manual product cards show "View" buttons that open the `product_url` in a new tab (e.g., Stripe payment link, membership signup page)
- Both modes use the same chatbot AI logic and `[PRODUCTS:]` marker system

