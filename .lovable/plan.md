

## Piano: Fix chip text wrapping nel widget live

### Problema
I discovery chip usano una griglia fissa a 3 colonne (`repeat(3, minmax(0,1fr))`) con `white-space:normal` e `word-break:break-word`. Questo forza parole come "Skincare" e "Haircare" a spezzarsi a metà parola quando lo spazio nella colonna non è sufficiente.

### Soluzione
Sostituire la griglia fissa con un layout `flex-wrap` e impostare `white-space:nowrap` sui chip, così ogni chip si dimensiona in base al proprio contenuto senza mai spezzare