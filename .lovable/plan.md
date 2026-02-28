

## Animazione di transizione senza flash dello sfondo

### Problema
Quando si cambia tab, lo sfondo della pagina diventa visibile perché l'animazione coinvolge l'intero contenitore (sfondo bianco + blob inclusi).

### Soluzione
Separare la struttura in due livelli:
1. **Contenitore esterno** (sempre visibile): sfondo bianco, blob viola, bordi arrotondati -- questo non si anima MAI
2. **Contenuto interno** (animato): testi, bullet, immagini/cards -- solo questo fa la transizione

In questo modo lo sfondo bianco e i blob restano sempre fermi e visibili, mentre il contenuto interno fa un fade-in leggero ad ogni cambio tab.

### Dettagli tecnici

**File: `src/components/landing/Solutions.tsx`**

- Mantenere il `<div>` esterno con `bg-white`, blob e `GlowingEffect` sempre statico (come ora)
- Wrappare solo il contenuto interno (la flex row con testo + cards/immagini) in un `<AnimatePresence mode="wait">` + `<motion.div>` con animazione di sola opacita (fade)
- L'animazione sara: `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}` con durata breve (~0.25s)
- I blob e il padding del contenitore restano fuori dall'animazione

Questo garantisce che lo sfondo bianco + i blob non scompaiano mai durante la transizione.

