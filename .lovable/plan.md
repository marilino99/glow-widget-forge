
# Onboarding Multi-Step Redesign

## Overview
Redesign the onboarding from a single card with URL input into a multi-step, visually engaging experience with animated transitions, progress indicator, and a live branding extraction preview.

## Steps

### Step 1 - Welcome (no input required)
- Full-screen layout with Widjet logo (using the navbar logo for brand consistency)
- Headline: "Welcome to Widjet" with a subtitle explaining the 3-step setup
- Animated entrance with framer-motion (fade up)
- Single "Get Started" button
- Subtle gradient background matching the builder's violet aesthetic

### Step 2 - Website URL
- Input for website URL (same logic as current)
- Animated illustration/icon of a globe with sparkles
- Helper text: "We'll automatically extract your logo, colors and theme"
- "Continue" button (disabled until URL entered) + "Skip" link

### Step 3 - Brand Extraction (loading/result)
- When extracting: animated loading state with pulsing dots and status text ("Scanning website...", "Extracting colors...", "Detecting logo...")
- When complete: show a mini preview card with the extracted logo, color swatch, and theme detected
- User sees what was found before proceeding
- "Continue to Builder" button auto-redirects after brief display

## Visual Design
- Dark gradient background (consistent with landing page aesthetic)
- Progress bar at the top showing steps 1/2/3
- Each step transitions with framer-motion slide/fade animations
- Cards with glassmorphism (backdrop-blur, semi-transparent background)
- Violet accent colors matching the builder palette

## Technical Details

### Files to modify
- **src/pages/Onboarding.tsx** - Complete rewrite with multi-step state machine using useState for currentStep (0, 1, 2), framer-motion AnimatePresence for transitions, and the existing branding extraction logic moved into step 3

### Dependencies used (already installed)
- framer-motion for animations
- lucide-react for icons
- Existing UI components (Button, Input, Label, Progress)

### Logic changes
- Step 0 (Welcome): No data, just "Get Started" button
- Step 1 (URL): Same URL input, on submit triggers extraction and moves to step 2
- Step 2 (Extraction + Results): Runs extract-branding, shows animated progress, then displays results with extracted logo/color/theme. On "Continue", saves to widget_configurations (same upsert logic) and navigates to /builder
- Skip remains available at steps 1 and 2, navigating directly to /builder
