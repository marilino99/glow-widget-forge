

## Piano: Sostituire "All Widgets" con pagina Templates

### Idea
La pagina "All widgets" attuale (screenshot) mostra canali come Help page, Email, Slack, WordPress — tutti "Coming soon". Non aggiunge valore reale. Meglio sostituirla con una **galleria di template** visiva dove l'utente può vedere e applicare i vari stili del widget.

### Cosa cambia

**1. Riscrivere `AllChannelsOverlay.tsx`** come galleria template
- Mantenere lo stesso layout a card (stile screenshot) ma ogni card rappresenta un template
- Ogni card mostra: sfondo colorato con mini-preview del widget, nome del template, breve descrizione, badge "Free" o "Pro"
- Click su una card → dialog di conferma → applica il template (riusa la logica già presente in `TemplatesPanel`)

**2. Template cards (basati sugli 8 template esistenti)**
- Minimal Light, Ocean Blue, Sunset Vibes (Free)
- Black Friday, Luxury Gold, Nature Green, Neon Purple, Coral Pink (Pro)
- Ogni card ha il gradiente/colore del template come sfondo, con un'icona widget al centro

**3. Mantenere la struttura**
- Header "Templates" con freccia Back (come ora)
- Grid 2 colonne per le card grandi, 3 colonne per le piccole
- Card Pro mostrano lucchetto se l'utente non è Pro

**4. Eliminare i canali "Coming soon"**
- Help page, Email, Slack, WordPress vengono rimossi da questa vista
- Se in futuro servono, si crea una sezione separata

### File coinvolti
- `src/components/builder/AllChannelsOverlay.tsx` — riscrittura completa come TemplatesGallery
- `src/components/builder/TemplatesPanel.tsx` — esportare l'array `templates` e i color/gradient map per riuso
- File che importano `AllChannelsOverlay` — aggiornare props se necessario

### Risultato
L'overlay "All widgets" diventa una galleria template visiva e funzionale, coerente con lo stile dello screenshot ma con contenuto utile.

