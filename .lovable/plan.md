

## Piano: Migliorare il drag-and-drop con indicatore visivo di drop

### Problema
Il drag-and-drop funziona ma non è chiaro *dove* la sezione verrà posizionata. Manca un feedback visivo durante il trascinamento.

### Modifiche

**File: `src/components/builder/AppearancePanel.tsx`**

1. Aggiungere stato `dropTargetIdx: number | null` per tracciare dove l'utente sta trascinando

2. Nel `onDragOver` di ogni sezione, calcolare se il cursore è nella metà superiore o inferiore dell'elemento per determinare se l'indicatore va sopra o sotto:
   - Usare `e.clientY` vs `getBoundingClientRect()` per capire la posizione
   - Settare `dropTargetIdx` all'indice corrispondente

3. Rendere una **linea blu orizzontale** (2-3px, colore primary) tra le sezioni nella posizione indicata da `dropTargetIdx`:
   - La linea appare tra le sezioni come indicatore di inserimento
   - Con una piccola animazione di fade-in

4. Nel `onDragLeave` del container, resettare `dropTargetIdx` a null

5. Nel `onDrop`, resettare `dropTargetIdx` a null

6. Spostare il grip handle dentro l'header della sezione (visibile, non con offset negativo) per renderlo più ovvio e accessibile

7. Aggiungere un leggero `border-dashed border-primary` sulla sezione che si sta trascinando (oltre all'opacity ridotta)

### Dettagli tecnici
- Stato locale `dropTargetIdx` gestito con `useState<number | null>`
- L'indicatore è un `div` con `h-0.5 bg-primary rounded-full mx-4` inserito condizionalmente tra le sezioni
- Il calcolo sopra/sotto usa: `const rect = e.currentTarget.getBoundingClientRect(); const isAbove = e.clientY < rect.top + rect.height / 2`

