

## Piano: Uniformare spaziatura tra sezioni nel widget preview

### Problema
Le sezioni hanno spacing inconsistente: `product-carousel` usa `mt-4`, `faq` usa `mt-4`, `custom-links` non ha margin-top, `inspire-me` usa `mt-2`. Anche lo spazio tra la contact card e la prima sezione è diverso.

### Soluzione
Uniformare tutte le sezioni con lo stesso `mt-4` (16px) per avere spaziatura identica tra la contact card e ogni sezione, e tra le sezioni stesse.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

1. **Riga ~2651** (`product-carousel`): ha già `mt-4` — OK, nessuna modifica
2. **Riga ~2716** (`faq`): ha già `mt-4` — OK, nessuna modifica  
3. **Riga ~2767** (`custom-links`): aggiungere `mt-4` al div wrapper
4. **Riga ~2785** (`inspire-me`): cambiare `mt-2` → `mt-4`

Questo garantisce che tutte le sezioni abbiano esattamente 16px di spazio sopra, identico allo spazio tra la contact card e la prima sezione.

