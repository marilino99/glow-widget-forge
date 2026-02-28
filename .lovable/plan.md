

# Mappa del mondo migliorata

## Problema
La mappa attuale usa tracciati SVG disegnati a mano con forme geometriche semplici che non assomigliano ai veri confini dei paesi. Il risultato e' visivamente brutto e non professionale.

## Soluzione
Sostituire completamente il componente `WorldMap.tsx` con una mappa del mondo basata su tracciati SVG realistici derivati da Natural Earth (proiezione equirettangolare). Ogni paese sara' rappresentato dal suo contorno geografico reale, non da forme approssimative.

## Approccio tecnico

### Sostituzione di `src/components/builder/WorldMap.tsx`
- Usare tracciati SVG accurati per i principali paesi del mondo (circa 50+ paesi con i contorni reali)
- I path SVG saranno derivati da dati geografici reali (Natural Earth 110m) convertiti in coordinate SVG semplificate
- Ogni paese mantiene il suo codice ISO (US, GB, DE, IT, ecc.) come ID
- La logica di colorazione rimane la stessa: paesi con chat si colorano di indaco con opacita' proporzionale al volume
- I paesi senza dati restano grigio chiaro
- Il viewBox sara' calibrato per una proiezione equirettangolare standard (tipo Mercator semplificato)

### Dettagli
- Nessuna libreria esterna necessaria -- tutto inline SVG
- I tracciati saranno piu' dettagliati (curve reali dei confini) ma comunque leggeri (ogni path e' una stringa di coordinate semplificata)
- Il componente mantiene la stessa interfaccia props (`countryData`) e la stessa logica di mapping nomi->ID
- Nessuna modifica necessaria a `BuilderHome.tsx` -- solo il file `WorldMap.tsx` viene riscritto

### Risultato atteso
Una mappa del mondo dove si riconoscono chiaramente le forme di Italia, Francia, USA, Brasile, India, ecc. con i confini realistici, non forme geometriche approssimative.

