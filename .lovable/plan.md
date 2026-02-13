

## Effetto Gradiente Arcobaleno sul Pulsante Publish

Aggiungere un bordo animato con gradiente arcobaleno che scorre intorno al pulsante "Publish" quando ci si passa sopra col mouse.

### Come funziona

Il pulsante verra' avvolto in un contenitore con un gradiente conico arcobaleno che ruota continuamente. Al passaggio del mouse, il gradiente diventa visibile creando l'effetto di un bordo luminoso che scorre.

### Modifiche

**1. `tailwind.config.ts`**
- Aggiungere una keyframe `rainbow-spin` che ruota il gradiente di 360 gradi
- Aggiungere l'animazione corrispondente `animate-rainbow-spin`

**2. `src/components/builder/AddToWebsiteDialog.tsx`**
- Sostituire il semplice `<Button>` con una struttura a due livelli:
  - Un `div` esterno con il gradiente conico arcobaleno (`conic-gradient`) che ruota tramite l'animazione
  - Il `Button` interno posizionato sopra, con sfondo solido che lascia visibile solo un sottile bordo arcobaleno (circa 2px)
- Il gradiente e' visibile solo al hover del contenitore esterno (opacity 0 di default, opacity 100 al hover)
- Transizione fluida di opacita' per un effetto di comparsa morbido

### Dettagli tecnici

- Il gradiente conico usa i colori: rosso, arancione, giallo, verde, ciano, blu, viola, e torna al rosso
- La rotazione completa avviene in circa 2 secondi per un effetto fluido ma non troppo veloce
- Il pulsante interno mantiene il suo stile originale (colori primary, dimensione sm)
- Il bordo arcobaleno ha uno spessore di circa 2px grazie al padding del contenitore esterno

