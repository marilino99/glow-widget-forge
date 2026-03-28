

## Piano: Uniformare margine inferiore tra sezioni nel widget preview

### Problema
Tra la contact card ("Chat Now") e la prima sezione c'è solo `mt-4` (16px). Ma tra due sezioni consecutive lo spazio è `pb-4` + `mt-4` = 32px, perché ogni sezione ha `pb-4` interno. Il risultato è che lo spazio tra sezioni è il doppio rispetto allo spazio contact-card → prima sezione.

### Soluzione
Rimuovere `pb-4` da tutte le sezioni, lasciando solo `mt-4` come spaziatore uniforme (16px) tra ogni elemento.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

1. **`product-carousel`** (~riga 2658): rimuovere `pb-4` dal div interno
2. **`faq`** (~riga 2720): rimuovere `pb-4` dal div interno  
3. **`custom-links`** (~riga 2767): rimuovere `pb-4` dal div wrapper
4. **`inspire-me`** (~riga 2785): rimuovere `pb-4` dal div wrapper

Risultato: tutte le sezioni avranno esattamente 16px di distanza, uguale allo spazio tra la contact card e la prima sezione.

