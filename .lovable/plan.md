

## Rendere il colore piu' visibile nel tema Gradient (Light)

### Problema
Nel tema gradient con sfondo chiaro (light), l'overlay colorato nella parte superiore del widget usa valori di opacita' molto bassi (`30` e `15` in esadecimale, cioe' circa 19% e 8%). Questo fa si' che il colore scelto dall'utente sia quasi invisibile, "coperto" dallo sfondo grigio chiaro (`#f8f8f8`).

### Soluzione
Aumentare l'opacita' dell'overlay gradient nel tema light per rendere il colore brand molto piu' evidente. Si interverra' su due punti:

1. **Overlay gradient (linee 1593-1601)**: Aumentare le opacita' del tema light da `30/15` a `60/30` (circa 37% e 19%), raddoppiando la visibilita' del colore scelto.

2. **Blob decorativo nell'header (linee 1610-1614)**: Aumentare l'opacita' del blob nel tema light da `25/05` a `40/15` per coerenza.

### Dettagli tecnici

**File**: `src/components/builder/WidgetPreviewPanel.tsx`

**Modifica 1 - Overlay gradient (riga 1598)**:
- Da: `${actualHexColor}30` e `${actualHexColor}15`
- A: `${actualHexColor}60` e `${actualHexColor}30`

**Modifica 2 - Blob header (riga 1613)**:
- Da: `${actualHexColor}25` e `${actualHexColor}05`
- A: `${actualHexColor}40` e `${actualHexColor}15`

Queste modifiche riguardano solo il tema light; il tema dark rimane invariato perche' gia' ha opacita' adeguate.

