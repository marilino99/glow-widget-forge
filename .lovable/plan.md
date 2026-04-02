

## Piano: Redesign pagina Templates stile screenshot

### Layout
Riprodurre il layout dello screenshot: sidebar filtri a sinistra + griglia 2 colonne di card a destra.

### Cosa cambia in `AllChannelsOverlay.tsx`

**1. Aggiungere categorie ai template**
Estendere `WidgetTemplate` con un campo `category` (es. "sales", "support", "lead-gen", "branding"). Aggiungere la categoria a ciascun template esistente.

**2. Sidebar filtri (sinistra)**
- Titolo "FILTER BY CATEGORY" in stile screenshot
- Checkbox list: All Templates, Sales, Support, Lead Generation, Branding
- Badge "FAVORITES" in alto (contatore, per futuro uso)
- Stato filtro: selezionando una categoria si filtrano le card a destra

**3. Griglia template (destra)**
- Layout a 2 colonne (come screenshot)
- Ogni card: area preview grande con sfondo colorato/gradiente + icona widget, sotto il nome del template, poi due bottoni "Preview" e "Choose"
- "Preview" apre un dialog con anteprima più grande
- "Choose" apre il dialog di conferma esistente per applicare il template
- Badge Free/Pro nell'angolo della card

**4. Header**
- Titolo centrato "Choose your template" (grande, bold)
- Linea separatrice sotto
- Pulsante Back in alto a sinistra

### Struttura visiva

```text
┌─────────────────────────────────────────────────┐
│  ← Back         Choose your template            │
│─────────────────────────────────────────────────│
│                                                  │
│  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │FAVORITES │  │  Template   │  │  Template   │  │
│  │    0     │  │  preview    │  │  preview    │  │
│  ├──────────┤  │            │  │            │  │
│  │FILTER BY │  │  Name      │  │  Name      │  │
│  │CATEGORY  │  │ [Preview]  │  │ [Preview]  │  │
│  │☑ All     │  │ [Choose]   │  │ [Choose]   │  │
│  │☐ Sales   │  ├────────────┤  ├────────────┤  │
│  │☐ Support │  │  Template   │  │  Template   │  │
│  │☐ Lead Gen│  │  ...       │  │  ...       │  │
│  └──────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────┘
```

### File coinvolti
- `src/components/builder/TemplatesPanel.tsx` — aggiungere campo `category` all'interfaccia e ai dati
- `src/components/builder/AllChannelsOverlay.tsx` — riscrittura completa con sidebar filtri + griglia 2 colonne + bottoni Preview/Choose

### Dettagli tecnici
- Categorie definite come array costante con label e valore
- Stato filtro gestito con `useState<string>("all")`
- Filtro "All Templates" mostra tutti, le altre categorie filtrano per match
- Card più alte con area preview prominente (simile allo screenshot)
- Bottoni "Preview" (outline) e "Choose" (filled, blu/nero) sotto ogni card

