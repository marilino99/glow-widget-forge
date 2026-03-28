

## Piano: Stile outline per il bottone "Inspire Me"

### Concetto
Il bottone "Inspire Me ✨" nel widget preview attualmente ha sfondo pieno con il colore del tema. Va cambiato in stile **outline**: sfondo bianco, bordo colorato con il colore del tema, testo del colore del tema.

### Modifiche

**File: `src/components/builder/WidgetPreviewPanel.tsx`** (~riga 2802-2805)

Sostituire lo style inline del bottone da sfondo pieno a outline:
- `backgroundColor` → `transparent` (o bianco)
- Aggiungere `border: 1.5px solid {actualHexColor}`
- `color` → `{actualHexColor}` (testo del colore del tema)

Il risultato sarà un bottone con bordo visibile, sfondo bianco/trasparente e testo colorato.

