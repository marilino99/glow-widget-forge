

## Replicare esattamente le oscillazioni del grafico di riferimento

### Analisi dell'immagine di riferimento

L'immagine mostra un pattern molto specifico:
- La linea parte quasi piatta in basso a sinistra con oscillazioni molto piccole
- Le prime 2-3 onde sono piccole e ravvicinate (ampiezza ~5-8px)
- Man mano che la linea sale verso destra, le onde diventano progressivamente piu ampie e piu distanziate
- Ogni onda ha la forma di una "S" morbida: scende leggermente, poi risale a un livello piu alto
- Circa 7-8 oscillazioni totali
- La linea finisce in alto a destra con le onde piu grandi

### Differenza rispetto alla versione attuale

La versione attuale ha oscillazioni troppo uniformi in ampiezza e spaziatura. Il riferimento mostra chiaramente onde che crescono in dimensione da sinistra a destra.

### Modifiche tecniche

**File: `src/components/landing/AIControl.tsx`**

Riscrivere il path SVG con queste caratteristiche:
- Y iniziale: ~135 (quasi in fondo ma non del tutto)
- Prime onde: ampiezza verticale di ~5px, larghezza ~40px
- Onde centrali: ampiezza verticale di ~12-15px, larghezza ~50px  
- Ultime onde: ampiezza verticale di ~18-22px, larghezza ~60px
- Y finale: ~12 (quasi in cima)
- Usare curve cubiche di Bezier per onde morbide e arrotondate
- Aggiornare sia il path del fill che quello dello stroke

