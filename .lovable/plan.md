

## Piano: Mostrare fino a 3 anteprime video nella sezione Inspire Me

### Problema
Attualmente la sezione "Inspire Me" nella home del widget mostra solo il primo video come anteprima. L'utente vuole vedere tutti i video caricati (fino a un massimo di 3) affiancati.

### Soluzione
Sostituire il singolo video thumbnail con un layout che mostra fino a 3 video affiancati nella box "Inspire Me", sia nel builder preview che nel widget live.

### Modifiche

**1. Builder Preview** (`src/components/builder/WidgetPreviewPanel.tsx`)
- Nella sezione `inspire-me` (riga ~2984), invece di mostrare solo `inspireVideos[0]`, fare un loop su `inspireVideos.slice(0, 3)` e renderizzare i video affiancati
- Ogni video avrà dimensioni proporzionali (es. ~72px larghezza ciascuno) con `border-radius` e `object-fit: cover`
- Layout flex con gap tra i video

**2. Widget Live** (`supabase/functions/widget-loader/index.ts`)
- Nella costruzione dell'HTML del box inspire (riga ~1684-1687), generare il `mediaHtml` con un loop sui primi 3 video
- Aggiornare gli stili CSS per `#wj-inspire-box` per supportare video multipli affiancati
- Ogni video mantiene le stesse dimensioni (72x96px) con bordi arrotondati

### Layout visivo

```text
┌──────────────────────────────────┐
│ [vid1] [vid2] [vid3]  ✨ Discover│
│                       [Inspire] │
└──────────────────────────────────┘
```

Se ci sono 1, 2 o 3 video, ne mostra esattamente quel numero. Oltre 3, ne mostra solo 3.

