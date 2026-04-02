

## Piano: Icona cuore Favorites sulle card template

### Cosa cambia

**1. Stato favorites** — Aggiungere `useState<Set<string>>` per tracciare gli ID dei template preferiti. Quando si clicca il cuore, l'ID viene aggiunto/rimosso dal Set.

**2. Icona cuore su hover** — Nell'area preview di ogni card (div con il colore/gradiente), aggiungere un bottone con l'icona `Heart` in alto a destra. Visibile solo su hover del gruppo (`opacity-0 group-hover:opacity-100`), stile simile allo screenshot: sfondo grigio chiaro arrotondato con cuore scuro. Se il template è nei favorites, il cuore è riempito (`fill-current`) e sempre visibile.

**3. Badge Pro/Free spostato** — Il badge Pro/Free attualmente occupa `top-3 right-3`. Il cuore andrà in `top-3 right-3` e il badge Pro/Free si sposta a `top-3 left-3`.

**4. Filtro Favorites** — Il bottone "FAVORITES" nella sidebar filtra i template mostrando solo quelli nel Set. Il contatore mostra `favorites.size`.

**5. Persistenza locale** — I favorites vengono salvati in `localStorage` per mantenerli tra sessioni.

### File coinvolti
- `src/components/builder/AllChannelsOverlay.tsx` — tutte le modifiche

### Dettagli tecnici
- `useState<Set<string>>` inizializzato da `localStorage.getItem("widget-template-favorites")`
- Toggle: crea nuovo Set, add/delete, salva in localStorage
- Cuore: `<button onClick={toggleFav} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ...">`
- Se è favorito: `opacity-100` sempre (override hover), `Heart` con `fill="currentColor"`
- Filtro sidebar: quando si clicca FAVORITES, setta `activeFilter` a `"favorites"` (aggiungere come valore possibile)

