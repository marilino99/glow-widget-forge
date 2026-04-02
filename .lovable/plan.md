

## Piano: Multi-select categorie con logica "All Templates"

### Logica
- Cambiare `activeFilter` da singolo valore a `Set<TemplateCategory>` per le categorie, più un booleano/flag per "all" e "favorites"
- Se clicco "Sales", "Support", "Lead Generation" → tutti e tre selezionati, filtro mostra template di tutte e tre le categorie
- Se clicco "All Templates" → deseleziona tutte le altre categorie, rimane solo "All Templates"
- Se "All Templates" è attivo e clicco una categoria specifica → "All Templates" si deseleziona, rimane solo quella categoria
- Se deselezioni l'ultima categoria rimasta → torna automaticamente a "All Templates"

### Modifiche in `src/components/builder/AllChannelsOverlay.tsx`

**1. Stato** — Sostituire `activeFilter: "all" | "favorites" | TemplateCategory` con:
- `filterMode: "all" | "favorites" | "categories"` 
- `selectedCategories: Set<TemplateCategory>`

**2. Logica toggle categoria** — Quando clicco una categoria:
- Se `filterMode` è `"all"` o `"favorites"`: passa a `"categories"`, set contiene solo quella categoria
- Se `filterMode` è `"categories"`: toggle la categoria nel set. Se il set diventa vuoto, torna a `"all"`

**3. Logica "All Templates"** — Quando clicco "All Templates": `filterMode = "all"`, svuota `selectedCategories`

**4. Checkbox checked** — "All Templates" checked se `filterMode === "all"`. Categorie specifiche checked se presenti nel `selectedCategories` set

**5. Filtro template** — Se `filterMode === "all"`: mostra tutti. Se `"favorites"`: filtra per favorites. Se `"categories"`: filtra `t.category in selectedCategories`

### File coinvolti
- `src/components/builder/AllChannelsOverlay.tsx`

