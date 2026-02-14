

## Effetto hover accattivante sul pulsante "Start for Free"

Aggiungere un effetto hover dinamico al pulsante "Start for Free" nella sezione Hero per renderlo piu' attraente e interattivo.

### Effetto proposto

Quando l'utente passa il mouse sul pulsante:
- **Scala leggermente** (scale 1.05) per dare un senso di interattivita'
- **Ombra glow piu' intensa** che si espande con il colore primario
- **Leggero shift verso l'alto** (translateY -2px) per un effetto "sollevamento"
- **Transizione fluida** su tutte le proprieta'

### Dettaglio tecnico

**File: `src/components/landing/Hero.tsx`**

Aggiornare le classi del pulsante "Start for Free" aggiungendo:
- `transition-all duration-300` per transizioni fluide
- `hover:scale-105` per l'ingrandimento
- `hover:-translate-y-0.5` per il sollevamento
- `hover:shadow-xl hover:shadow-primary/40` per il glow espanso

Il risultato sara' un pulsante che "si solleva" e brilla quando l'utente ci passa sopra, creando un chiaro invito all'azione.

### File modificato
- `src/components/landing/Hero.tsx` - classi hover sul Button principale

