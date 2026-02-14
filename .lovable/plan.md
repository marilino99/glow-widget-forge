

## Effetto gradiente viola sulla headline Hero

Applicare un gradiente testo sulla headline "Widgets that turn visitors into customers", passando dal colore scuro (foreground) al viola, ispirandosi all'immagine di riferimento dove alcune lettere sfumano gradualmente nel viola.

### Cosa cambia

La headline attualmente ha la parola "customers" con un gradiente grigio. Il nuovo effetto applichera un gradiente che parte dal colore scuro del testo e sfuma progressivamente verso il viola (coerente con il glow e il pulsante CTA), distribuito su tutta la headline invece che solo sull'ultima parola.

### Dettaglio tecnico

**File: `src/components/landing/Hero.tsx`**

- Rimuovere lo `<span>` separato per "customers" con il suo gradiente grigio
- Applicare all'intero `<h1>` un gradiente testo via Tailwind:
  - `bg-gradient-to-r from-foreground via-foreground to-[hsl(270,80%,55%)]`
  - `bg-clip-text text-transparent`
- Il gradiente partira dal colore scuro (foreground) sulla sinistra e sfumera verso il viola sulla destra, creando lo stesso effetto della reference image
- Il viola utilizzato (`hsl(270,80%,55%)`) e lo stesso gia presente nei glow blob, mantenendo coerenza visiva

