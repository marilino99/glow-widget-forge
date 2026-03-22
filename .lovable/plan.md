

## Piano: Fix bottoni freccia nel widget live

### Problema
Nel CSS "!important" del widget live (righe 452-453), le proprietà `background` e `color` dei bottoni freccia (`.wj-link-arrow` e `.wj-link-arrow svg`) mancano di `!important`, permettendo al CSS del sito ospitante di sovrascrivere il colore del widget con i valori di default grigi.

### Modifiche

**`supabase/functions/widget-loader/index.ts`** — 2 righe:

- **Riga 452**: Aggiungere `!important` al background di `.wj-link-arrow`
  - Da: `background:\${color.bg};`
  - A: `background:\${color.bg} !important;`

- **Riga 453**: Aggiungere `!important` al color di `.wj-link-arrow svg`
  - Da: `color:\${btnText}`
  - A: `color:\${btnText} !important`

Questo garantirà che i bottoni freccia nel widget live usino sempre il colore del widget scelto dall'utente, come nella preview.

