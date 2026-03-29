

## Piano: Bloccare lo scroll del sito quando il widget è aperto su mobile

### Problema
Quando il widget si apre full-screen su mobile, l'utente può ancora scorrere il sito web sottostante, vedendo il contenuto del sito dietro/sotto il widget. Si vuole che il widget occupi tutto lo schermo senza possibilità di scroll del body.

### Soluzione
Due modifiche nel file `supabase/functions/widget-loader/index.ts`:

1. **CSS**: Aggiungere una media query `@media (max-width: 640px)` (che manca — la precedente modifica non è stata salvata) per rendere il popup full-screen su mobile, e aggiungere una regola per `body.wj-open` che blocca lo scroll:

```css
@media (max-width: 640px) {
  body.wj-open {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
    height: 100% !important;
  }
  #wj-pop {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    right: 0 !important; bottom: 0 !important;
    width: 100% !important; height: 100% !important;
    border-radius: 0 !important;
    max-width: none !important; max-height: none !important;
  }
  #wj-pop.open { animation: none !important; }
  #wj-btn { position: fixed !important; bottom: 20px !important; right: 20px !important; }
}
```

2. **JS**: Nella logica di apertura (`btn.onclick`, riga ~1891) aggiungere `document.body.classList.add('wj-open')`, e nella chiusura (`closeWidget()`, riga ~1881) aggiungere `document.body.classList.remove('wj-open')`. La classe viene aggiunta/rimossa solo se siamo su mobile (`window.innerWidth <= 640`).

### File coinvolti
- `supabase/functions/widget-loader/index.ts` — CSS media query + toggle classe body

### Risultato
Su mobile: il widget si apre a schermo intero, il sito sottostante è completamente bloccato e invisibile. Su desktop: nessun cambiamento.

