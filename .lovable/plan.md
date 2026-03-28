
## Piano: ripristinare il widget live che non appare

### Problema reale
Do I know what the issue is? Sì.

L’errore che sta bloccando tutto è questo: nel `widget-loader` del layout popup viene usata la variabile `btn`, ma il bottone launcher non viene più creato da nessuna parte.

Ho verificato che:
- in `supabase/functions/widget-loader/index.ts` esistono riferimenti a `btn` in più punti:
  - `hideLauncher()`
  - `btn.onclick = ...`
  - `root.appendChild(btn)`
- però non esiste più nessun `var btn = d.createElement('button')` nel ramo popup
- invece nel layout `bottom-bar` il launcher esiste (`bbLauncher`), quindi quel ramo non ha questo bug

Questo spiega perfettamente il log:
`[Widjet] Render error: btn is not defined`
e il motivo per cui il widget non compare proprio sul sito: il render va in crash prima di montare il launcher.

### File da correggere
- `supabase/functions/widget-loader/index.ts`

### Nota importante
Gli altri warning che si vedono nella console del builder (`DialogContent`, `Function components cannot be given refs`) sono rumore del pannello interno e non sono la causa della sparizione del widget sul sito live.

### Modifiche da fare
1. Ripristinare la creazione del launcher popup `btn`
   - creare di nuovo il bottone con `id = 'wj-btn'`
   - usare `buttonLogo` se presente, altrimenti l’icona fallback
   - inserirlo nel ramo popup, prima dei listener che lo usano

2. Riallineare tutta la logica open/close del popup al launcher reale
   - `hideLauncher()` deve agire su `btn`
   - `showLauncher()` deve ri-mostrare `btn`
   - `btn.onclick` deve aprire `pop`
   - `closeWidget()` deve chiudere `pop` e far riapparire `btn`

3. Verificare il montaggio DOM del popup
   - mantenere:
     - `root.appendChild(pop)`
     - `root.appendChild(btn)`
   - evitare altri riferimenti a variabili non definite nello stesso ramo popup

4. Fare un controllo rapido di coerenza con le modifiche recenti
   - lasciare invariati:
     - spacing uniforme tra sezioni
     - stile outline del bottone “Inspire Me”
   - assicurarsi che il fix tocchi solo il launcher e non rompa la parità preview/live

### Risultato atteso
Dopo il fix:
- il widget live tornerà a comparire sul sito
- il launcher sarà di nuovo visibile
- cliccando il launcher il popup si aprirà correttamente
- il crash `btn is not defined` sparirà dalla console
