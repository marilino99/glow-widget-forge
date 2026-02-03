
# Plan: Production-Ready Widget Embed Code

## Overview
Transform the "Add to website" dialog from a placeholder to a working, production-ready embed system like OpenWidget. Users will get their unique widget ID automatically, and the code will actually work when pasted into their website.

## What Changes

### 1. Update AddToWebsiteDialog Component
- Pass the user's actual widget configuration ID to the dialog
- Generate real embed code with the user's unique widget ID
- Include proper async loading and initialization
- Add noscript fallback for accessibility

### 2. Create Widget Loader Edge Function
- New edge function `widget-loader` that serves the widget JavaScript
- Accepts widget ID parameter to load the correct configuration
- Returns the widget code that renders on external websites

### 3. Update Builder Page
- Pass widget configuration ID to AddToWebsiteDialog
- Ensure the ID is available when the dialog opens

## Embed Code Structure (What Users Will Copy)

```html
<!-- Start of Widjet (widjet.com) code -->
<script>
  window.__wj = window.__wj || {};
  window.__wj.widgetId = "abc123-user-unique-id";
  window.__wj.product_name = "widjet";
  ;(function(w,d,s){
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s);
    j.async=true;
    j.src="https://your-project.supabase.co/functions/v1/widget-loader";
    f.parentNode.insertBefore(j,f);
  })(window,document,'script');
</script>
<noscript>Enable JavaScript to use the widget powered by Widjet</noscript>
<!-- End of Widjet code -->
```

## Technical Details

### Files to Modify
1. **src/components/builder/AddToWebsiteDialog.tsx**
   - Add `widgetId` prop
   - Update embed code template with real ID and CDN URL
   - Add noscript fallback

2. **src/pages/Builder.tsx**
   - Query widget configuration ID
   - Pass ID to AddToWebsiteDialog

### New Files to Create
1. **supabase/functions/widget-loader/index.ts**
   - Edge function that serves the embeddable widget script
   - Fetches configuration by widget ID
   - Returns JavaScript that renders the widget

### Database
- No changes needed - the existing `widget_configurations.id` serves as the widget ID

## User Experience
1. User clicks "Add to website"
2. Dialog shows their unique embed code (no "YOUR_WIDGET_ID" placeholder)
3. User copies code and pastes into their website
4. Widget loads and displays with their configuration
