

## Sfumatura graduale dei loghi "Trusted by"

Il problema attuale e' che il gradiente della maschera CSS passa da trasparente a nero troppo velocemente (in solo il 15% della larghezza), creando un taglio netto visibile.

### Soluzione

Modificare il `mask-image` nel file `src/components/ui/logos3.tsx` con un gradiente molto piu' morbido che usa piu' stop intermedi per creare una dissolvenza progressiva su entrambi i lati:

- **Sinistra (uscita)**: i loghi svaniscono gradualmente partendo da circa il 25% della larghezza fino al bordo sinistro
- **Destra (entrata)**: i loghi appaiono gradualmente dal bordo destro fino a circa il 75% della larghezza

### Dettaglio tecnico

Sostituire l'attuale gradiente lineare con uno piu' articolato con stop multipli:

```
transparent 0%,
rgba(0,0,0,0.1) 5%,
rgba(0,0,0,0.3) 10%,
rgba(0,0,0,0.6) 15%,
black 25%,
black 75%,
rgba(0,0,0,0.6) 85%,
rgba(0,0,0,0.3) 90%,
rgba(0,0,0,0.1) 95%,
transparent 100%
```

Questo crea una curva di opacita' molto piu' dolce, eliminando completamente il "taglio" netto su entrambi i lati.

### File modificato
- `src/components/ui/logos3.tsx` - aggiornamento della proprieta' `maskImage` e `WebkitMaskImage`

