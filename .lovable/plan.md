
## Gradient visibile nell'header del widget (tema dark)

### Problema attuale
Quando selezioni il tema **dark** con sfondo **gradient**, il gradiente viene applicato al contenitore esterno del widget, ma il contenuto scrollabile interno ha `bg-black` che copre completamente il gradiente. Il risultato e' che l'area dell'header con "Hello, nice to see you here" appare nera invece di mostrare il colore selezionato.

### Soluzione
Spostare il gradiente dal contenitore esterno all'area dell'header, in modo che sia visibile nella parte superiore del widget (dove c'e' il "sayHello") e sfumi verso il nero/scuro nel resto del contenuto.

### Cosa vedrai
- In tema **dark + gradient**: l'header mostrera' un gradiente che parte dal colore selezionato in alto e sfuma verso il nero
- Il gradiente sara' dinamico e seguira' il colore scelto (preset o custom hex)
- Il decorative blur blob nell'header verra' mantenuto per un effetto ancora piu' ricco
- In tema **light + gradient** e **solid**: nessun cambiamento, tutto resta com'e'

### Dettagli tecnici

Modifiche in `src/components/builder/WidgetPreviewPanel.tsx`:

1. **Header gradient per dark mode**: Quando `backgroundType === "gradient"` e `widgetTheme === "dark"`, applicare un gradiente inline all'area dell'header (`px-6 py-5`) che va dal colore selezionato (con opacita') verso trasparente
2. **Preset colors**: Per i colori preset, usare il valore `hex` dal `colorMap` per generare il gradiente
3. **Custom hex**: Per i colori custom, usare direttamente `actualHexColor`
4. **Struttura**: Il gradiente header sara' applicato come sfondo inline sulla div dell'header, sfumando verso il basso cosi' che il contenuto sottostante (contact card, product cards) resti su sfondo scuro

File coinvolto:
- `src/components/builder/WidgetPreviewPanel.tsx`
