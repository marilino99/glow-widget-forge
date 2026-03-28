

## Piano: Fix errore `bgFaq is not defined` nel widget-loader

### Causa
Il `widget-loader` crasha alla riga 305 perché le righe 305-312 (sezione CSS "Inspire") usano interpolazioni non-escaped (`${bgFaq}`, `${dark}`, `${textMain}`, ecc.) dentro un template literal server-side. Deno prova a risolvere queste variabili a livello server dove non esistono. Le righe precedenti (es. 301) usano correttamente `\${bgFaq}` (con backslash).

### Fix

**File: `supabase/functions/widget-loader/index.ts`** (righe 305-312)

Aggiungere il backslash di escape a tutte le interpolazioni nelle righe della sezione "Inspire":

- Riga 305: `${bgFaq}` → `\${bgFaq}`
- Riga 306: `${dark ? ...}` → `\${dark ? ...}`
- Riga 309: `${textMain}` → `\${textMain}`
- Riga 310: `${textSub}` → `\${textSub}`
- Riga 311: `${color.bg}`, `${btnText}` → `\${color.bg}`, `\${btnText}`
- Riga 312: `${color.hover}` → `\${color.hover}`

### Risultato
Il widget-loader non crasherà più e il widget sarà visibile sullo store Shopify.

