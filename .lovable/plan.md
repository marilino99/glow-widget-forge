
## Fix: rimuovere l'effetto sbiadimento hover dal pulsante "Start for Free"

### Problema
Il componente Button ha uno stile predefinito `hover:bg-primary/90` che riduce l'opacita' del colore di sfondo al 90% quando si passa il mouse. Questo fa sembrare il pulsante "meno nero" e contrasta con l'effetto glow viola, rendendolo meno incisivo.

### Soluzione
Aggiungere `hover:bg-primary` al pulsante in `Hero.tsx` per sovrascrivere il comportamento predefinito e mantenere il colore pieno al 100% anche durante l'hover. In questo modo l'unico effetto visibile sara' il sollevamento + ingrandimento + glow viola, senza sbiadimento.

### Dettaglio tecnico

**File: `src/components/landing/Hero.tsx`**

Aggiungere la classe `hover:bg-primary` al Button per forzare il colore pieno durante l'hover, sovrascrivendo il `hover:bg-primary/90` definito nel componente base.
