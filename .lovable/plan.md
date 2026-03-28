

## Piano: Fix widget invisibile — migliorare error handling e diagnostica

### Problema
Il widget-loader ha un `try-catch` che cattura sia errori di JSON parse sia errori runtime di `render()`, ma logga solo `'[Widjet] Parse error'` senza mostrare l'errore reale. Qualsiasi crash dentro `render()` viene silenziosamente ingoiato, rendendo impossibile diagnosticare il problema.

### Modifiche

**File: `supabase/functions/widget-loader/index.ts`**

1. **Migliorare il try-catch principale** (~riga 116-125):
   - Cambiare `console.error('[Widjet] Parse error')` in `console.error('[Widjet] Error:', e.message, e.stack)`
   - Separare il JSON parse dal render in due try-catch distinti

2. **Aggiungere try-catch interno a `render()`** (~riga 129):
   - Wrappare tutto il corpo di `render()` in un try-catch che logga l'errore specifico con stack trace
   - In caso di errore, creare comunque il bottone del widget (degradazione graceful)

3. **Aggiungere log di diagnostica**:
   - `console.log('[Widjet] Script loaded, fetching config...')` prima della XHR
   - `console.log('[Widjet] Config received, rendering...')` prima di `render(cfg)`
   - `console.log('[Widjet] Render complete')` alla fine di `render()`

### Codice chiave

```javascript
// Prima (riga 116-125):
try {
  var cfg = JSON.parse(x.responseText);
  if (cfg.error) { console.error('[Widjet]', cfg.error); return; }
  render(cfg);
} catch(e) {
  console.error('[Widjet] Parse error');
}

// Dopo:
var cfg;
try {
  cfg = JSON.parse(x.responseText);
} catch(e) {
  console.error('[Widjet] JSON parse error:', e.message);
  return;
}
if (cfg.error) { console.error('[Widjet]', cfg.error); return; }
console.log('[Widjet] Config loaded, rendering...');
try {
  render(cfg);
  console.log('[Widjet] Render complete');
} catch(e) {
  console.error('[Widjet] Render error:', e.message, e.stack);
}
```

### Risultato
Con questa modifica, se il widget non appare, aprendo la console del browser sulla pagina Shopify vedrai l'errore specifico (es. `TypeError: Cannot read property 'addEventListener' of null at line X`), permettendo di identificare e risolvere il bug esatto.

