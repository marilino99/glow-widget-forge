

## Piano: Allineare la Voice View del widget live al preview

### Differenze trovate

| Elemento | Preview | Widget Live |
|---|---|---|
| Blob size | 160x160px | 280x280px |
| Blob position | Flex centered | Absolute top:50% translate(-50%,-60%) |
| Layout | Flex column justify-between | Mixed absolute positioning |
| Close button | Top-right, 32px, bg-white/80, ChevronDown icon | Top-right, 40px, transparent bg, ChevronDown icon |
| Controls gap | 24px (gap-6) | 20px |
| Mic button color | #ef4444 (red-500) | #b45454 (darker red) |
| Mic button border | none, shadow-md | none, custom shadow |
| Status pill | rgba(255,255,255,0.7) bg | rgba(255,255,255,0.8) bg |

### Modifiche

**`supabase/functions/widget-loader/index.ts`** — aggiornare gli stili CSS della voice view per replicare il layout del preview:

1. **Blob**: ridurre da 280px a 160px, rimuovere posizionamento assoluto, usare flex centering
2. **Layout**: cambiare `#wj-voice-view` in flex-column con justify-content:space-between (come il preview)
3. **Close button**: ridurre a 32px, aggiungere background `rgba(255,255,255,0.8)` e shadow-sm
4. **Controls**: aggiornare gap a 24px, cambiare colore mic button a `#ef4444` (red-500) con hover `#dc2626` (red-600), shadow-md
5. **Stop button**: allineare shadow e border style al preview
6. **Status pill**: aggiornare background a `rgba(255,255,255,0.7)`
7. **Powered by**: padding-bottom 12px come nel preview

Stesso aggiornamento nella sezione CSS duplicata per bottom-bar (righe ~600+).

### File coinvolto
- `supabase/functions/widget-loader/index.ts`

### Risultato
La voice view nel widget live sarà identica a quella nel builder preview: blob più piccolo e centrato, pulsanti con gli stessi colori e dimensioni, layout coerente.

