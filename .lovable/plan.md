

## Animazione "cool" per la minimizzazione del widget

Quando il widget si chiude (minimizza), aggiungeremo un'animazione fluida che lo fa ridurre con un effetto combinato di scala + dissolvenza + scorrimento verso il basso, dando l'impressione che il widget "scivoli" nel bottone circolare. Quando si riapre, l'animazione inversa lo fa apparire dal basso con un leggero rimbalzo.

### Cosa vedrai

- **Chiusura**: il widget si restringe, diventa trasparente e scivola leggermente verso il basso prima di scomparire
- **Apertura**: il widget appare dal basso con un effetto di scala + dissolvenza fluido
- **Bottone**: il pulsante circolare ha un piccolo effetto "pop" (scala) quando appare dopo la chiusura

### Dettagli tecnici

1. **Aggiungere keyframes e classi di animazione** in `tailwind.config.ts`:
   - `widget-collapse`: combinazione di scale(1 -> 0.8), opacity(1 -> 0), translateY(0 -> 20px)
   - `widget-expand`: inverso del collapse con una leggera curva ease-out
   - `button-pop`: scala 0.5 -> 1.1 -> 1 con effetto rimbalzo

2. **Gestire lo stato di transizione** in `WidgetPreviewPanel.tsx`:
   - Introdurre uno stato `isAnimating` per gestire il momento tra "aperto" e "chiuso"
   - Quando l'utente clicca minimizza: prima esegui l'animazione di chiusura, poi dopo ~300ms imposta `isCollapsed = true`
   - Quando l'utente clicca il bottone per aprire: imposta `isCollapsed = false` e applica la classe di animazione di apertura

3. **Applicare le classi CSS condizionali** al contenitore del widget popup in base allo stato di animazione

File coinvolti:
- `tailwind.config.ts` - nuovi keyframes e animazioni
- `src/components/builder/WidgetPreviewPanel.tsx` - logica di transizione e classi animate
