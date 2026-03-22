

## Piano: Fix emoji splitting nei discovery chip del widget live

### Problema
La preview usa una regex Unicode completa (`\p{Emoji_Presentation}` con supporto ZWJ) che cattura correttamente emoji composte come 💇‍♀️ (haircare). Il widget live invece usa `codePointAt(0)` che cattura solo il primo codepoint, lasciando i caratteri rimanenti (variation selector, ZWJ, secondo emoji) nel testo della label. Risultato: emoji spezzate e layout sminchiato.

### Soluzione
Sostituire la logica `codePointAt` nel widget-loader con un loop che consuma l'intera sequenza emoji, inclusi:
- Codepoint base (surrogate pair se > 0xFFFF)
- Variation selectors (0xFE0F)
- ZWJ (0x200D) + emoji successiva

Questo replica il comportamento della regex Unicode della preview senza usare `\p{...}` (che rompe il template literal).

### Modifica

**`supabase/functions/widget-loader/index.ts`** — righe 1831-1835

Da (logica naive singolo codepoint):
```js
var cp = chipText.codePointAt(0) || 0;
var isEmoji = cp > 0x2600;
var emojiEnd = isEmoji ? (cp > 0xFFFF ? 2 : 1) : 0;
if (isEmoji && emojiEnd > 0 && chipText.charAt(emojiEnd) === ' ') { emojiEnd++; }
var emojiMatch = isEmoji ? [chipText.slice(0, emojiEnd), chipText.slice(0, cp > 0xFFFF ? 2 : 1)] : null;
```

A (loop che consuma l'intera sequenza ZWJ):
```js
var pos = 0;
var cp = chipText.codePointAt(0) || 0;
var isEmoji = cp > 0x2300;
if (isEmoji) {
  // consume first emoji codepoint
  pos += cp > 0xFFFF ? 2 : 1;
  // consume variation selector if present
  if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
  // consume ZWJ sequences
  while (chipText.charCodeAt(pos) === 0x200D) {
    pos++; // skip ZWJ
    var nextCp = chipText.codePointAt(pos) || 0;
    if (nextCp) { pos += nextCp > 0xFFFF ? 2 : 1; }
    if (chipText.charCodeAt(pos) === 0xFE0F) pos++;
  }
  // skip trailing space
  if (chipText.charAt(pos) === ' ') pos++;
}
var emojiMatch = isEmoji ? [chipText.slice(0, pos), chipText.slice(0, pos).replace(/\s+$/, '')] : null;
```

Poi redeploy della edge function `widget-loader`.

### Risultato
Le emoji composte (💇‍♀️, 👩‍💼, ecc.) verranno catturate interamente nello span `.wj-chip-emoji`, eliminando i caratteri residui dalla label. Il comportamento sarà identico alla preview.

