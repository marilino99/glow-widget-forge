

## Piano: Aprire la vista Reels fullscreen dal bottone "Inspire Me" nel widget preview

### Situazione attuale
- **Widget di produzione** (widget-loader): la logica Reels fullscreen è già implementata. Cliccando su "Inspire Me" si apre la vista con video a scroll verticale, snap, autoplay, prodotti overlay, close button. Funziona già.
- **Widget preview nel builder** (WidgetPreviewPanel.tsx): la box "Inspire Me" è visibile ma il bottone non fa nulla — manca la vista Reels.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

1. **Aggiungere stato** `showInspireReels` (boolean) per controllare la vista Reels nel preview.

2. **Vista Reels fullscreen**: Quando `showInspireReels` è true, rendere sopra la home view un overlay nero che occupa tutto lo spazio del widget con:
   - Scroll verticale con `scroll-snap-type: y mandatory`
   - Ogni video occupa il 100% dell'altezza, con `scroll-snap-align: start`, autoplay, muted, loop
   - Overlay prodotti in basso con gradiente trasparente→nero, card prodotto con immagine, titolo, prezzo
   - Bottone X in alto a destra per chiudere (torna alla home)
   - Tap sul video per mute/unmute

3. **Click handler**: Collegare il click sulla box e sul bottone "Inspire Me ✨" a `setShowInspireReels(true)`. Se non ci sono video, il click non fa nulla.

4. **Autoplay con IntersectionObserver**: Usare un observer per fare play/pause dei video in base a quale slide è visibile (stesso pattern del widget-loader).

### Risultato
Nel builder preview, cliccando "Inspire Me" si apre un'esperienza Reels fullscreen identica a quella del widget di produzione, con video scrollabili verticalmente, prodotti taggati, e navigazione stile Instagram/TikTok.

