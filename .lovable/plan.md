

## Piano: Fix widget-loader crash — `color is not defined`

### Problema
Il widget live è completamente rotto. I log mostrano ripetutamente:
```
ReferenceError: color is not defined
    at Object.handler (widget-loader/index.ts:394:157)
```

Il file `widget-loader/index.ts` è un unico grande template literal (backtick string). Alla riga 396, c'è `${color.bg}` **senza backslash di escape**. Deno lo interpreta come variabile server-side, ma `color` non esiste nel contesto della Edge Function — solo nel browser. Questo crash impedisce la generazione dell'intero script del widget.

### Fix
Una sola modifica alla riga 396:

```
// DA (broken):
background:${color.bg}

// A (fixed):
background:\${color.bg}
```

Aggiungere il `\` prima di `${color.bg}` per fare in modo che l'interpolazione avvenga lato client, non lato server.

### File coinvolto
- `supabase/functions/widget-loader/index.ts` — riga 396, aggiungere backslash escape

### Risultato
Il widget tornerà visibile e funzionante su tutti i siti dove è installato.

