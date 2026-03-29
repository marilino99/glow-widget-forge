

## Piano: Perché il pulsante microfono non fa nulla + fix

### Problema
Il pulsante microfono che vedi nel builder preview (pannello destro) è solo un'icona decorativa. L'`onClick` fa solo `e.stopPropagation()` — non apre nulla.

La Voice View con il blob 3D e la Web Speech API esiste solo nel **widget live** (il codice che gira sui siti dei clienti, dentro `widget-loader/index.ts`). Nel builder preview di React non è stata implementata nessuna schermata vocale.

### Dove funziona
- **Sito live con widget installato** (es. il tuo Shopify): lì il pulsante apre la voice view con blob + riconoscimento vocale
- **Builder preview**: solo icona statica, nessuna azione

### Soluzione
Aggiungere una voice view simulata nel builder preview (`WidgetPreviewPanel.tsx`):

1. **Stato React**: aggiungere `showVoiceView` state
2. **Click handler**: il mic button setta `showVoiceView = true`
3. **Voice View overlay**: rendering condizionale di un overlay con lo stesso design (sfondo `#ededee`, blob SVG animato arancione, status "Listening...", pulsanti stop/mute, chevron close)
4. **Animazioni CSS**: le animazioni del blob e del pulse vengono aggiunte come classi Tailwind custom o inline styles
5. **No logica audio**: nel preview non si attiva il microfono reale, si mostra solo l'interfaccia visiva come anteprima di come apparirà ai clienti

### File coinvolti
- `src/components/builder/WidgetPreviewPanel.tsx` — aggiungere stato, overlay voice view, animazioni blob

### Risultato
Cliccando il mic nel preview del builder si vedrà esattamente la schermata con il blob arancione, come appare nel widget live. Per la funzionalità vocale reale, serve aprire il widget sul sito live.

