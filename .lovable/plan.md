

## Problem

When the user disconnects their Shopify store from Widjet, the widget snippet remains in the store's `theme.liquid`. If they reconnect later, the old snippet is still there (possibly with a stale widget ID).

## Solution

Create a new edge function `shopify-uninstall-widget` that removes the Widjet snippet from the Shopify theme before the connection record is deleted. Call it during the disconnect flow.

### 1. Create `supabase/functions/shopify-uninstall-widget/index.ts`

- Authenticate user
- Fetch the `shopify_connections` record (with `admin_access_token` and `store_domain`) using the service role client
- Get the active theme via Shopify Themes API
- Read `layout/theme.liquid`
- Remove the Widjet snippet block using the same regex: `/<!-- Start of Widjet \(widjet\.com\) code -->[\s\S]*?<!-- End of Widjet code -->/`
- If found, PUT the cleaned content back; if not found, return success silently
- Return `{ success: true }`

### 2. Update `src/hooks/useShopifyConnection.ts` disconnect flow

Before deleting the DB row, call the new edge function:

```typescript
const disconnect = useCallback(async () => {
  if (!user || !connection) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    // Remove widget from Shopify theme first
    await supabase.functions.invoke("shopify-uninstall-widget", {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    // Then delete DB record
    await (supabase as any).from("shopify_connections").delete().eq("user_id", user.id);
    setConnection(null);
    toast({ title: "Disconnected", description: "Shopify store disconnected and widget removed." });
  } catch (e) { ... }
}, [...]);
```

The uninstall is best-effort -- if the Shopify API call fails (e.g. token revoked), the disconnect still proceeds by deleting the DB row.

### 3. Deploy

Deploy the new `shopify-uninstall-widget` edge function.

