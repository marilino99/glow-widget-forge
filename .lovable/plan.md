

## Piano: Fix regex escape che rompe il widget live

### Problema
Il widget non appare più su Shopify perché la regex per separare emoji e label nei chip (riga 1831) contiene `\p{Emoji_Presentation}` **dentro un template literal** (backtick). Deno interpreta `\p` come una escape sequence non valida nel template literal, producendo codice JS corrotto che causa un SyntaxError fatale nell'intero IIFE del widget — impedendo qualsiasi rendering.

### Soluzione
Nella riga 1831, i backslash della regex Unicode devono essere raddoppiati (`\\p` invece di `\p`) perché il codice è generato come stringa dentro un template literal, e solo il JS risultante nel browser deve vedere `\p{...}`.

### Modifica

**`supabase/functions/widget-loader/index.ts`** — riga 1831

Da:
```js
var emojiMatch = chipText.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u);
```

A:
```js
var emojiMatch = chipText.match(/^(\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F)\\s*/u);
```

Poi redeploy della edge function `widget-loader`.

### Risultato
Il widget tornerà visibile su Shopify. I chip continueranno a separare correttamente emoji e label.

