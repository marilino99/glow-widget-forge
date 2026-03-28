

## Piano: Fix widget che scompare — variabile `inspireView` non definita

### Problema identificato
Il widget live crasha completamente a causa di un bug nella struttura del codice in `widget-loader/index.ts`:

1. **Linea 1807**: `pop.appendChild(inspireView)` viene eseguito **sempre**, indipendentemente dalla configurazione
2. Ma `inspireView` viene creato solo dentro il blocco `if (hasVideos)` (linea ~1587), che a sua volta dipende da `inspireEnabled`
3. Quando `inspireEnabled` è `false` (o è true ma non ci sono video), `inspireView` è `undefined` → `appendChild(undefined)` genera un **TypeError** che blocca l'intero script del widget, facendolo sparire

### Soluzione

**File: `supabase/functions/widget-loader/index.ts`**

1. **Creare `inspireView` sempre** (prima della sezione inspire, subito dopo la dichiarazione di `homeView`):
   - `var inspireView = d.createElement('div'); inspireView.id = 'wj-inspire-view'; inspireView.style.display = 'none';`
   - Così `pop.appendChild(inspireView)` non crasherà mai

2. **Spostare il blocco `if (hasVideos)`** (righe 1587-1790) **dentro** il blocco `if (inspireEnabled)` (prima della chiusura a riga 1578), in modo che la logica dei video sia correttamente nidificata

3. **Wrap condizionale per `pop.appendChild(inspireView)`** — aggiungere solo se `inspireEnabled` è true:
   ```
   pop.appendChild(homeView);
   if (inspireEnabled) { pop.appendChild(inspireView); }
   pop.appendChild(chatView);
   ```

### Risultato
Il widget non crasherà più quando `inspireEnabled` è false o quando non ci sono video, risolvendo il problema della sparizione del widget dal sito.

