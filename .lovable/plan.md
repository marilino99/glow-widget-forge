

## Piano: Fix wobble durante drag-and-drop sezioni

### Problema
Il "traballo" è causato dal fatto che ogni volta che il cursore si muove sopra una sezione durante il drag, `onDragOver` ricalcola `dropTargetIdx` e l'indicatore di drop appare/scompare rapidamente, causando il resize del layout che a sua volta muove gli elementi sotto il cursore, triggerando un nuovo `onDragOver` — creando un loop visivo.

### Soluzione
Aggiungere un **debounce spaziale** (dead zone) per evitare che piccoli movimenti del mouse causino il flicker dell'indicatore.

### Modifiche

**File: `src/components/builder/AppearancePanel.tsx`**

1. Nel `onDragOver`, ignorare aggiornamenti se il nuovo `targetIdx` è uguale al `dropTargetIdx` corrente (evitare re-render inutili)

2. Aggiungere una dead zone centrale: se il cursore è nel 30% centrale dell'elemento, non cambiare `dropTargetIdx` — reagire solo quando il cursore è chiaramente nella metà superiore o inferiore (es. primo 35% = sopra, ultimo 35% = sotto, centro = ignora)

3. Dare all'indicatore di drop una dimensione fissa con `min-height` e `margin` negativi o `absolute positioning` per evitare che la sua apparizione sposti gli altri elementi nel layout (causa principale del wobble)

4. Rendere l'indicatore `position: absolute` con `pointer-events: none` sovrapposto al bordo tra le sezioni, così non altera il flusso del documento

### Dettagli tecnici
- L'indicatore diventa `absolute` posizionato con `top: -4px` rispetto alla sezione target, anziché essere un elemento nel flusso
- Il wrapper di ogni sezione diventa `relative` per contenere l'indicatore assoluto
- Dead zone: `const ratio = (e.clientY - rect.top) / rect.height; if (ratio > 0.3 && ratio < 0.7) return;`

