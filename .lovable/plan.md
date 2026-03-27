

## Piano: Product card con "Add to Cart" nella vista Reels

### Problema attuale
Le product card nella vista Reels sono un semplice link orizzontale con immagine, titolo, prezzo e "View product". L'utente vuole un layout con immagine a sinistra e bottone carrello a destra, con possibilità di aggiungere al carrello con un click.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`** (righe 2452-2487)

Ridisegnare le product card nell'overlay Reels:
- Layout verticale (card impilate dal basso verso l'alto) invece di scroll orizzontale
- Ogni card: immagine prodotto a sinistra, titolo + prezzo al centro, icona carrello (ShoppingCart) a destra come bottone cliccabile
- Il bottone carrello mostra un feedback visivo al click (es. checkmark temporaneo)
- Le card hanno sfondo `bg-white/15 backdrop-blur-md` coerente con lo stile attuale

**File: `supabase/functions/widget-loader/index.ts`**

Applicare lo stesso layout alle product card nella vista Reels del widget di produzione:
- Card verticali dal basso verso l'alto
- Immagine sinistra, titolo+prezzo centro, icona carrello destra
- Click su carrello: se Shopify, usa la cart API esistente (POST `/cart/add.js`); altrimenti apre il link prodotto

### Risultato
Ogni video nella vista Reels mostra le product card impilate verticalmente dal basso, con immagine a sinistra e bottone carrello a destra per aggiunta rapida.

