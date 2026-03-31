

## Piano: Sostituire la favicon Lovable con il logo Widjet

### Problema
Il file `public/favicon.png` è ancora il logo di Lovable. Tutti i riferimenti in `index.html` puntano a `/favicon.png`, quindi Google e i browser mostrano l'icona sbagliata.

### Soluzione

1. **Copiare `src/assets/widjet-icon.png` → `public/favicon.png`** — sovrascrivere il file esistente con l'icona Widjet
2. Nessuna modifica a `index.html` necessaria — i riferimenti `<link rel="icon" href="/favicon.png">` e `<link rel="apple-touch-icon" href="/favicon.png">` restano corretti

### File coinvolto
- `public/favicon.png` — sostituito con `widjet-icon.png`

### Risultato
Dopo il deploy, browser e Google mostreranno il logo Widjet al posto di quello Lovable. I browser con cache potrebbero impiegare qualche giorno ad aggiornarsi.

