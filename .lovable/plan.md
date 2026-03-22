

## Piano: Frecce di navigazione on-hover per il carosello prodotti nella chat

### Obiettivo
Aggiungere frecce sinistra/destra (dentro cerchi) a metà altezza del carosello prodotti nella chat, visibili solo al passaggio del mouse. Sia nella preview che nel widget live.

### Modifiche

**`src/components/builder/WidgetPreviewPanel.tsx`** (2 blocchi: riga ~1065 e ~1590)
- Avvolgere il container prodotti (`flex overflow-x-auto`) in un `div` con `position: relative` e `group` (Tailwind).
- Aggiungere due `button` freccia (sinistra e destra) posizionati `absolute top-1/2 -translate-y-1/2`, con `opacity-0 group-hover:opacity-100 transition-opacity`.
- Stile: cerchio bianco con ombra, icona `ChevronLeft`/`ChevronRight` di Lucide.
- onClick: fare scroll del container prodotti di ~200px a sinistra/destra usando `scrollBy({ left: ±200, behavior: 'smooth' })` tramite un `useRef` o `ref` callback.

**`supabase/functions/widget-loader/index.ts`** (riga ~1826)
- Avvolgere il `div` dei prodotti in un wrapper con `position:relative`.
- Aggiungere due bottoni freccia (HTML inline con SVG chevron) posizionati a metà altezza, nascosti di default (`opacity:0;transition:opacity 0.2s`) e visibili al hover del wrapper (`wrapper:hover .arrow { opacity:1 }`).
- Aggiungere CSS per `.wj-chat-prod-wrap:hover .wj-chat-prod-arrow{opacity:1}` in entrambi i blocchi CSS (standard e hardened).
- Aggiungere JS per gestire il click delle frecce: `container.scrollBy({ left: ±200, behavior: 'smooth' })`.

### Dettagli tecnici
- Freccia sinistra: `left:4px`, freccia destra: `right:4px`
- Cerchio: ~28px, sfondo bianco, ombra leggera, bordo sottile grigio
- Icona: chevron SVG ~14px, colore grigio scuro
- Il wrapper del carosello avrà classe `wj-chat-prod-wrap` nel live

