

## Problema

I chip appaiono ancora nella voice mode perché ci sono **due implementazioni separate**:

1. **Widget live** (`widget-loader/index.ts`) — qui il fix è stato applicato (`showVoiceChips` ritorna subito)
2. **Builder preview** (`WidgetPreviewPanel.tsx`) — qui i chip vengono ancora renderizzati visivamente (linea 3330) e impostati via `setVoiceChips()` (linea 870)

Lo screenshot mostra il builder preview, che non è stato aggiornato.

## Piano

### 1. Rimuovere i chip visivi dal builder preview

In `src/components/builder/WidgetPreviewPanel.tsx`:
- **Linea 870**: Rimuovere la chiamata `setVoiceChips(data.metadata.chips)` — i chip non devono essere mostrati in voice mode, solo letti dal TTS
- **Linee 3330-3365** (circa): Rimuovere il blocco JSX che renderizza `voiceChips` nella voice view

I chip continueranno ad essere letti ad alta voce dal TTS perché il testo della risposta li include già verbalmente.

### 2. Rideploy widget-loader

Verificare che il `widget-loader` sia stato effettivamente deployato con il fix precedente, per sicurezza.

### File modificati
- `src/components/builder/WidgetPreviewPanel.tsx` — rimuovere rendering visivo dei chip in voice mode

