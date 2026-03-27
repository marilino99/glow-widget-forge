

## Piano: Mostrare la box "Inspire Me" con mockup quando non ci sono video

### Problema
Quando il toggle "Inspire Me" è attivo ma non ci sono video caricati, la box non appare nel preview del widget. L'utente vuole vedere comunque la sezione con un video mockup/placeholder.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`**

1. Cambiare la condizione da `inspireEnabled && inspireVideos.length > 0` a solo `inspireEnabled`
2. Se ci sono video, mostrare il primo video come ora
3. Se non ci sono video, mostrare un placeholder al posto del `<video>`: un div 72x96px con sfondo gradient (toni caldi/beauty), un'icona play centrata, e un leggero effetto shimmer — simulando un video mockup
4. Il contatore mostra "No videos yet" invece di "1 video"

**File: `supabase/functions/widget-loader/index.ts`**

Stessa logica: se `inspire_enabled` è true ma non ci sono video, rendere comunque la box con un placeholder grafico al posto del video (div con gradient + icona play SVG inline).

### Risultato
La box "Inspire Me" è sempre visibile quando il toggle è attivo, con un mockup video placeholder che dà all'utente un'anteprima dell'esperienza.

