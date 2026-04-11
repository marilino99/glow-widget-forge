

## Problem

The preview was showing Italian default chip labels ("Cercare il prodotto adatto a me", "Tracciare il mio ordine", "Ho bisogno di più informazioni") from the screenshot you sent. After the sync fix, the preview now pulls chips from the database, which contains different AI-generated values. You want the screenshot chips to be the ones used everywhere.

## Plan

1. **Update database chips** — Run a SQL migration (or use the widget-config edge function) to set the `custom_chips` column for your widget to the Italian defaults:
   ```json
   ["Cercare il prodotto adatto a me", "Tracciare il mio ordine", "Ho bisogno di più informazioni"]
   ```

2. **Verify sync** — Both the preview (WidgetPreviewPanel) and the live widget (widget-loader) already use `custom_chips` from the database, falling back to the same Italian defaults when empty. So once the DB is updated, both will show the correct chips.

No code changes needed — just a database update to set the correct chip values.

