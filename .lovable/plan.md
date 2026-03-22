

## Piano: Fix layout discovery chips nel widget live

### Problema
I discovery chips nel widget live mostrano l'emoji sopra il testo (layout verticale) invece che inline (layout orizzontale come nella preview). Questo accade perché il CSS del tema Shopify sovrascrive `flex-direction` del chip, facendolo diventare `column` invece di `row`.

### Soluzione
Aggiungere `flex-direction:row !important` alla classe `.wj-discovery-chip` nel CSS hardened (con `!important`) del widget-loader.

### Modifiche

**`supabase/functions/widget-loader/index.ts`** (riga ~499, CSS hardened)
- Aggiungere `flex-direction:row !important;gap:4px !important;` alla regola `.wj-discovery-chip` nel blocco CSS con `!important`.

**`supabase/functions/widget-loader/index.ts`** (riga ~344, CSS standard)
- Aggiungere `flex-direction:row;gap:4px;` alla regola `.wj-discovery-chip` nel blocco CSS standard per coerenza.

### Risultato
I chip mostreranno emoji e testo sulla stessa riga, identici alla preview del builder.

