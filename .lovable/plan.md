

## Piano: Allineare sidebar al design di riferimento

### Problema
La sidebar attuale (Favorites + Filter by Category) appare troppo stretta e compressa rispetto al riferimento (screenshot 1). Il bottone Favorites e le label non hanno le proporzioni giuste.

### Modifiche in `src/components/builder/AllChannelsOverlay.tsx`

1. **Sidebar width**: aumentare da `w-56` a `w-64` per dare più respiro
2. **Bottone Favorites**: aggiungere `rounded-lg` (invece di `rounded`) e aumentare leggermente il padding per matchare il riferimento
3. **Label "Filter by Category"**: aumentare dimensione da `text-[11px]` a `text-xs`, aggiungere colore viola `text-[hsl(258,60%,52%)]` come nel riferimento, e aumentare `mb-3` a `mb-4`
4. **Checkbox labels**: aumentare da `text-sm` a `text-base` per matchare la dimensione del riferimento
5. **Spacing categorie**: aumentare `space-y-3` a `space-y-4` per più aria tra le voci
6. **Gap tra Favorites e Filter**: aggiungere più margine sotto Favorites (`mb-4` → `mb-6`)

### File coinvolto
- `src/components/builder/AllChannelsOverlay.tsx`

