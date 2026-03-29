

## Piano: Widget full-screen su mobile

### Problema
Il popup del widget (`#wj-pop`) ha dimensioni fisse (`380px × 660px`) e `position:absolute` ancorato al bottone launcher. Su mobile questo crea un widget "storto" che non riempie lo schermo, come si vede nello screenshot.

### Soluzione
Aggiungere una media query `@media (max-width: 640px)` nel CSS del widget-loader (blocco non-iframe) che rende il popup full-screen su mobile:

**File: `supabase/functions/widget-loader/index.ts`**

Dopo il CSS di `#wj-pop` (riga ~426-431), aggiungere:

```css
@media (max-width: 640px) {
  #wj-root {
    bottom: 0 !important;
    right: 0 !important;
    left: 0 !important;
    top: 0 !important;
  }
  #wj-pop {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    max-width: none !important;
    max-height: none !important;
  }
  #wj-btn {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
  }
}
```

Questo farà sì che:
- Su desktop (>640px): comportamento invariato, popup 380×660px ancorato al bottone
- Su mobile (≤640px): il widget si apre a schermo intero come nell'esempio di OpenWidget (foto 2), con il launcher che resta fisso in basso a destra

### File coinvolti
- `supabase/functions/widget-loader/index.ts` — aggiunta media query mobile al blocco CSS non-iframe

