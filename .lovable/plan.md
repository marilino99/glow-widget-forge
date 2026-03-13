

## Integrazione Wishlist Plus (Swym) nel Widget

### Cosa faremo
Modificheremo la funzione `toggleWishlist` nel `widget-loader` per rilevare automaticamente se **Wishlist Plus (Swym)** è installato sullo store Shopify. Se presente, il cuore nel widget aggiungerà/rimuoverà i prodotti dalla wishlist Swym (sincronizzata con l'account del cliente). Se non presente, continuerà a usare il fallback localStorage attuale.

### Come funziona l'API Swym
Wishlist Plus espone un oggetto globale `window._swat` sulle pagine Shopify. Le API principali:
- `_swat.addToWishList(product, onSuccess, onError)` — aggiunge un prodotto
- `_swat.removeFromWishList(product, onSuccess, onError)` — rimuove un prodotto
- `_swat.fetch(onSuccess)` — recupera la wishlist corrente per verificare se un prodotto è già salvato

Il prodotto richiede: `{ epi: variantId, empi: productId, du: productUrl }`

### Modifiche al file `supabase/functions/widget-loader/index.ts`

1. **Rilevamento Swym**: Aggiungere un check `var hasSwym = !!window._swat;` dopo il caricamento del widget. Poiché Swym potrebbe caricarsi dopo il widget, usare un polling breve o `SwymCallbacks`.

2. **Estendere i dati prodotto**: I product card già hanno `shopify_variant_id` e `product_url`. Servirà anche lo `shopify_product_id` (empi). Verificheremo se è già disponibile nei dati del widget-config, altrimenti lo aggiungeremo.

3. **Modificare `toggleWishlist`**: Se `_swat` è disponibile, chiamare le API Swym invece di localStorage. Il fallback localStorage resta per store senza Wishlist Plus.

4. **Modificare `isInWishlist`**: Su store con Swym, fare un fetch iniziale della wishlist per sapere quali prodotti sono già salvati e colorare i cuori di conseguenza.

5. **Aggiornare `renderWishlistSection`**: Se Swym è attivo, la sezione "I tuoi preferiti" nel widget legge dalla wishlist Swym anziché da localStorage.

### Dettagli tecnici

**Rilevamento e inizializzazione Swym:**
```text
var swymReady = false;
var swymWishlist = [];

function initSwym() {
  if (window._swat) {
    swymReady = true;
    // Fetch current wishlist to sync heart states
    window._swat.fetch(function(items) {
      swymWishlist = items || [];
      syncHeartStates();
      renderWishlistSection();
    });
  }
}

// Try immediately, then via SwymCallbacks
initSwym();
if (!swymReady) {
  window.SwymCallbacks = window.SwymCallbacks || [];
  window.SwymCallbacks.push(function(swat) {
    swymReady = true;
    swat.fetch(function(items) {
      swymWishlist = items || [];
      syncHeartStates();
      renderWishlistSection();
    });
  });
}
```

**Toggle con Swym:**
```text
function toggleWishlist(product, btnEl) {
  if (swymReady && window._swat) {
    var swymProduct = {
      epi: parseInt(product.shopify_variant_id),
      empi: parseInt(product.shopify_product_id),
      du: product.product_url || ''
    };
    var isCurrentlyIn = swymWishlist.some(i => i.empi === swymProduct.empi);
    if (isCurrentlyIn) {
      window._swat.removeFromWishList(swymProduct, function() { ... });
    } else {
      window._swat.addToWishList(swymProduct, function() { ... });
    }
  } else {
    // Fallback localStorage (codice esistente)
  }
}
```

**Dati necessari dal backend:** Verificare che `widget-config` includa `shopify_product_id` per ogni prodotto. Se non presente, aggiungerlo dalla tabella `product_cards`.

### File da modificare
- `supabase/functions/widget-loader/index.ts` — logica Swym + toggle + render
- `supabase/functions/widget-config/index.ts` — includere `shopify_product_id` nei dati prodotto (se non già presente)
- Possibile migrazione DB se `shopify_product_id` non è già nella tabella `product_cards`

