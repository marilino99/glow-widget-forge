

## Move Liquid Glass Effect to Inner Image Wrapper

The glass styling (border, backdrop-blur, shadow, background) will be transferred from the outer container to the inner `div` that wraps the image. The outer container becomes a plain wrapper that only holds the animated glows.

### Changes in `src/components/landing/Hero.tsx`

**Outer container (line ~113):** Remove glass styles, keep only basic layout:
- From: `rounded-3xl border border-white/[0.15] bg-white/[0.06] p-1.5 backdrop-blur-xl shadow-[...]`
- To: `h-full` (just a layout wrapper)

**Inner glass highlight overlay (lines ~115-118):** Move inside the image wrapper instead.

**Image wrapper (line ~120):** Apply the full liquid glass effect:
- From: `relative rounded-2xl overflow-hidden bg-background/80`
- To: `relative rounded-2xl overflow-hidden border border-white/[0.15] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_60px_-15px_rgba(0,0,0,0.3)]`

The glass highlight gradients (the `from-white/[0.08]` and `from-white/[0.04]` overlays) will also move inside the image wrapper.

The animated glow blobs stay in the same position behind everything. The visual border radius stays `rounded-2xl` as requested.

