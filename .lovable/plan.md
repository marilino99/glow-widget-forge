
# Redesign Sidebar - Stile Lista Pulita

## Panoramica
Ridisegnare la lista principale della sidebar del Builder per passare dallo stile attuale (card con bordi e sfondo) a uno stile lista pulito e minimale come nelle immagini di riferimento: icona + label su una riga, senza bordi o card, con sezioni separate da titoli.

## Cosa cambia visivamente

```text
PRIMA (card style):                    DOPO (list style):
+----------------------------+         
| [icon] Contact card    [>] |         [icon]  Contact card
+----------------------------+         [icon]  WhatsApp         [toggle]
+----------------------------+         [icon]  FAQ              [toggle]
| [icon] WhatsApp  [sw] [>] |         [icon]  Custom links
+----------------------------+         
                                       BOOST SALES
                                       [icon]  Product carousel
                                       [icon]  Metrics          PRO
```

## Modifiche tecniche

### 1. `SidebarItem.tsx` - Redesign completo
- Rimuovere il bordo (`border`), lo sfondo card (`bg-card`), e il padding della card
- Layout: padding verticale py-2.5, padding orizzontale px-2
- Icona a sinistra (h-5 w-5), label con font-medium text-sm
- Rimuovere il ChevronRight (freccia a destra)
- Mantenere toggle e badge PRO sulla destra
- Stato hover: sfondo leggero `hover:bg-muted/50` con rounded-lg
- Stato active: testo primary, nessun bordo speciale

### 2. `BuilderSidebar.tsx` - Aggiustamenti spacing
- Rimuovere `space-y-2` dai gruppi (i nuovi item sono piu compatti, basta space-y-0.5 o nessuno)
- I titoli di sezione restano invariati (uppercase, muted, tracking-wider)
- Il titolo "Widget content" resta invariato
- Nessuna modifica alla logica dei pannelli o alle props

### 3. Nessuna modifica funzionale
- Tutti i click handler, toggle, pannelli e dati restano identici
- Solo stile CSS/Tailwind aggiornato
