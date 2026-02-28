

## Fix Avatar Cards Style in Hero Social Proof

The reference image shows 3 avatar cards stacked like a fan of playing cards: the front card is fully visible on the left, and the subsequent cards peek out behind it to the right, each slightly rotated clockwise and offset. All cards have prominent rounded corners (rounded-2xl) and visible white borders/shadows.

### Changes

**File: `src/components/landing/Hero.tsx`**

Update the social proof avatar stack styling:

- Use a wrapper with `relative` positioning instead of `-space-x-3`
- Position cards with `absolute` so they stack naturally (front card on top)
- Front card (z-30): full size, no rotation, prominent shadow
- Middle card (z-20): shifted right ~12px, rotated ~6deg clockwise
- Back card (z-10): shifted right ~22px, rotated ~12deg clockwise
- All cards: `rounded-2xl` (more rounded), thicker white border, slightly larger size (~44px)
- Cards should have a subtle white/light background fill visible around the avatar image

This creates the exact "fanned deck" effect shown in the reference image.

