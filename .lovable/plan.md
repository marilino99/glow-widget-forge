
## Fix: ridurre larghezza immagine e correggere estensione inferiore

### Problema
L'immagine a destra occupa troppo spazio orizzontale (`flex-1` = 50%) e in basso non si estende correttamente fino all'altezza del pulsante "Start for Free". Il `self-stretch` funziona solo se il contenitore flex ha un'altezza definita dal contenuto piu' alto, ma `object-cover` puo' tagliare l'immagine in modo non ottimale.

### Soluzione

**File: `src/components/landing/Hero.tsx`**

1. **Ridurre la larghezza dell'immagine**: Cambiare il wrapper destro da `flex-1` a `flex-1 max-w-md lg:max-w-lg` per limitare la larghezza massima e bilanciare meglio con il testo a sinistra.

2. **Correggere l'estensione inferiore**: Usare `object-contain` invece di `object-cover` sull'immagine per evitare che venga tagliata, e mantenere `h-full` per riempire lo spazio verticale disponibile fino all'altezza del pulsante. Rimuovere `self-stretch` dal wrapper e usare invece `md:items-stretch` sul contenitore padre per garantire che entrambe le colonne abbiano la stessa altezza.

### Modifiche specifiche

- Contenitore padre: da `md:items-start` a `md:items-stretch` per forzare altezza uguale
- Wrapper immagine: da `flex-1 self-stretch` a `flex-1 max-w-md lg:max-w-lg` (rimuovere `self-stretch` perche' il padre gestisce l'altezza)
- Immagine: da `object-cover` a `object-contain` per mostrare tutta l'immagine senza tagli

### File modificato
- `src/components/landing/Hero.tsx`
