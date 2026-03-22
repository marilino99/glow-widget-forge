

## Piano: Fix errore sintassi JS nel widget-loader che impedisce il rendering del widget

### Problema
Le frecce del carosello aggiunte nell'ultimo aggiornamento contengono un errore di escape delle virgolette nell'onclick handler. Il widget-loader genera codice JS con virgolette non escapate che rompono il parsing dell'intera funzione IIFE, impedendo al widget di renderizzarsi.

La riga problematica nel sorgente:
```js
onclick="this.parentElement.querySelector(\'#' + prodId + '\').scrollBy({left:-150,behavior:\'smooth\'})"
```

Poiché questa è dentro un template literal, `\'` diventa `'`, producendo JS non valido:
```js
msgHtml += '<button ... onclick="this.parentElement.querySelector('#...'
```
La `'` dentro `querySelector('` chiude la stringa JS iniziata con `'<button...`, causando un SyntaxError fatale che blocca l'intero widget.

### Soluzione
In `supabase/functions/widget-loader/index.ts` (righe 1872-1873), sostituire le virgolette escapate con `&apos;` (HTML entity) oppure usare `\\x27` (escape JS) per evitare conflitti tra i tre livelli di quoting (template literal → JS string → HTML attribute):

```js
// Da:
onclick="this.parentElement.querySelector(\'#' + prodId + '\').scrollBy({left:-150,behavior:\'smooth\'})"

// A:
onclick="this.parentElement.querySelector(&apos;#' + prodId + '&apos;).scrollBy({left:-150,behavior:&apos;smooth&apos;})"
```

Oppure, meglio ancora, rimuovere completamente gli onclick inline e aggiungere gli event listener via JS dopo `bubble.innerHTML = msgHtml` (come già fatto per i chip e i cart buttons), evitando del tutto i problemi di escaping multi-livello.

### File coinvolto
- `supabase/functions/widget-loader/index.ts` — righe 1870-1874

### Risultato
Il widget tornerà a funzionare correttamente su Shopify (e su qualsiasi sito con embed). Le frecce del carosello continueranno a funzionare ma senza rompere il parsing JS.

