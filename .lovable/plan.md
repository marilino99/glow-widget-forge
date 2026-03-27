

## Piano: Fix product card non visibili nei Reels del preview

### Problema
Le product card nei Reels non appaiono perché alla riga 2428, `linkedProducts` cerca i prodotti in `productCards` — che è la lista filtrata del Product Carousel (vuota se il carousel è disabilitato o non ci sono prodotti Shopify). I prodotti dello store (`rawProductCards`) non vengono passati al `WidgetPreviewPanel`.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**
1. Aggiungere una prop opzionale `inspireStoreProducts?: ProductCardData[]` all'interfaccia.
2. Alla riga 2428, usare `inspireStoreProducts` (con fallback a `productCards`) per risolvere i `linkedProductIds`:
   ```
   const linkedProducts = (video.linkedProductIds || [])
     .map(pid => (inspireStoreProducts || productCards).find(p => p.id === pid))
     .filter(Boolean);
   ```

**File: `src/pages/Builder.tsx`**
1. Passare `inspireStoreProducts={rawProductCards}` a entrambe le istanze di `WidgetPreviewPanel` (riga ~886 e ~950).

### Risultato
Le product card linkate ai video appariranno correttamente nella vista Reels del preview, indipendentemente dallo stato del Product Carousel.

