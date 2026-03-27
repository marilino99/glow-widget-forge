

## Piano: Box "Inspire Me" nella home del widget

### Problema
Attualmente "Inspire me" è un piccolo chip. L'utente vuole una box dedicata nella home del widget (come FAQ, Custom Links, Google Reviews), con il primo video in loop a sinistra e un bottone "Inspire Me" a destra.

### Modifiche

**File: `supabase/functions/widget-loader/index.ts`**

1. **Aggiungere CSS** per la nuova box `#wj-inspire-box`:
   - Container con `display:flex`, `align-items:center`, `gap:12px`, `padding:16px`, `margin:8px 16px`, `border-radius:16px`, background coerente col tema (stessa `bgFaq`)
   - Video a sinistra: `width:80px`, `height:100px`, `border-radius:12px`, `object-fit:cover`, loop + muted + autoplay
   - Bottone a destra: stile simile al CTA esistente, con testo "Inspire Me" e emoji ✨

2. **Sostituire il chip attuale** (righe ~1614-1622, il `inspireChip` con `#wj-inspire-chip`) con la nuova box:
   - Creare un `div#wj-inspire-box` con dentro un `<video>` (primo video della lista) e un `<button>`
   - Inserirlo nella home (`scroll`) dopo i custom links o in posizione simile alle altre box (dopo FAQ / prima di Google Reviews)
   - Il click sul bottone apre la vista Reels fullscreen (stessa logica attuale)

3. **Mantenere invariata** tutta la logica Reels (apertura, chiusura, autoplay, prodotti overlay).

### Risultato
Una box rettangolare nella home del widget con video che scorre in loop a sinistra e bottone "Inspire Me" a destra, coerente visivamente con le altre sezioni (FAQ, Links, Reviews).

