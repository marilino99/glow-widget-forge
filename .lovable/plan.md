

## Problem

The current flow does a 302 redirect to `https://lovable.dev/lp/learnn-2512?reward_code=...`, which exposes the destination URL in the browser address bar. The user can copy and share it with anyone.

## Reality Check

Once the user lands on Lovable's external page, the URL is visible and fundamentally out of our control. We **cannot make Lovable's page single-use** since it's a third-party URL. However, we can make it significantly harder to copy/share by **not exposing the URL in the address bar**.

## Solution

Instead of a 302 redirect, the `claim-promo` Edge Function will return an HTML page that:

1. Opens the Lovable URL in **the same tab** via JavaScript (`window.location.replace()`), which replaces the current history entry so the user can't go "back" to see the URL.
2. Uses a brief loading/interstitial page ("Redirecting you to Lovable...") so the transition feels intentional.
3. The URL is embedded in JS (not in a visible `<a>` tag or address bar), making it harder to casually copy.
4. Additionally, the `Referrer-Policy: no-referrer` header prevents the URL from leaking via referrer headers.

### Changes

**File: `supabase/functions/claim-promo/index.ts`**
- Replace the `302 redirect` response with an HTML page that uses `window.location.replace()` to navigate.
- Add `Referrer-Policy: no-referrer` header.
- The reward URL is embedded in obfuscated JS (base64-encoded) so it's not trivially visible in page source.

This won't make it 100% impossible to extract (a determined technical user could still find it via dev tools), but it removes the easy copy-paste from the address bar, which is the main sharing vector.

