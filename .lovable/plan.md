

## Single-Use Claim Link

### Approach
Track in the database whether each user has already claimed/clicked the Lovable Pro link. Once claimed, disable the button and show a "Already claimed" state.

### Database Change
Add a column `lovable_promo_claimed` (boolean, default false) to the `profiles` table, or create a lightweight `promo_claims` table. Adding to `profiles` is simpler since it's a 1:1 user attribute.

Migration:
```sql
ALTER TABLE public.profiles ADD COLUMN lovable_promo_claimed boolean NOT NULL DEFAULT false;
```

### Frontend Changes (Builder.tsx)
1. Fetch the user's `lovable_promo_claimed` status from `profiles` on mount (can piggyback on existing profile query).
2. When user clicks "Claim your free credits":
   - Update `profiles` set `lovable_promo_claimed = true` for the current user.
   - Then open the link in a new tab.
3. If `lovable_promo_claimed` is already `true`:
   - Show the button as disabled with text like "Already claimed" or hide the detail view entirely and show a "You've already claimed this offer" message.

### Security
- RLS already restricts profile updates to own user, so users can only mark their own claim.
- The flag can only go from `false` to `true` (enforced client-side; optionally add a trigger to prevent reversal, but low risk since users can only update their own profile).

### UX Flow
- **Not claimed**: Card is clickable, detail view shows steps + active CTA button.
- **Claimed**: Card shows a subtle "Claimed" badge, detail view shows disabled button or confirmation message. The link is no longer accessible.

