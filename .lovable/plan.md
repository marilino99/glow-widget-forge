

## Piano: Riordino sezioni Home Screen con drag-and-drop

### Concetto
Aggiungere un campo `homeSectionOrder` alla configurazione widget che definisce l'ordine delle 4 sezioni (FAQ, Custom Links, Product Carousel, Inspire Me). Nel pannello Home Screen, le sezioni diventano riordinabili tramite drag-and-drop. Il widget preview e il widget live rispettano lo stesso ordine.

### Modifiche

**1. `src/hooks/useWidgetConfiguration.ts`**
- Aggiungere `homeSectionOrder: string[]` all'interfaccia `WidgetConfiguration` con default `["product-carousel", "faq", "custom-links", "inspire-me"]`
- Mappare il campo nel load/save della configurazione

**2. `src/components/builder/AppearancePanel.tsx`** (tab home-screen, righe 1007-1390)
- Aggiungere prop `homeSectionOrder` + `onHomeSectionOrderChange`
- Definire un array di sezioni con chiave/componente JSX, poi renderizzarle nell'ordine definito da `homeSectionOrder`
- Ogni sezione mostra un GripVertical handle per il drag-and-drop tra sezioni (drag sulla riga header della sezione)
- Usare HTML5 drag-and-drop nativo (già usato per FAQ items e custom links)

**3. `src/components/builder/WidgetPreviewPanel.tsx`** (righe 2644-2870)
- Aggiungere prop `homeSectionOrder`
- Invece di rendere le 4 sezioni in ordine fisso, iterare su `homeSectionOrder` e rendere ciascuna sezione condizionalmente

**4. `src/pages/Builder.tsx`**
- Passare `homeSectionOrder` e `onHomeSectionOrderChange` ai componenti AppearancePanel e WidgetPreviewPanel

**5. `supabase/functions/widget-loader/index.ts`**
- Leggere `homeSectionOrder` dalla config e rendere le sezioni nell'ordine specificato

### Dettagli tecnici
- L'ordine viene salvato come array JSON nel campo config esistente (via `onSaveConfig`)
- Il drag-and-drop usa lo stesso pattern HTML5 già presente nel codebase (dataTransfer con indice)
- Le sezioni non abilitate vengono comunque mostrate nel pannello (con toggle off) ma skippate nel preview

