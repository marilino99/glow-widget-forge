

## Miglioramento allineamento UI della colonna sinistra dell'Hero

### Problema
Con `md:items-stretch` il contenitore sinistro si estende per tutta l'altezza, ma il contenuto testuale resta ancorato in alto con spaziature troppo ampie tra badge, titolo, sottotitolo e pulsante. Il risultato e' un layout "disperso" che non comunica coesione visiva.

### Soluzione
Centrare verticalmente il blocco di testo nella colonna sinistra usando `justify-center`, e ridurre leggermente gli spazi tra gli elementi per un aspetto piu' compatto e professionale.

### Dettaglio tecnico

**File: `src/components/landing/Hero.tsx`**

1. **Colonna sinistra** (riga 35): aggiungere `flex flex-col justify-center` per centrare verticalmente il contenuto rispetto all'immagine a destra
2. **Spaziatura badge** (riga 42): ridurre `mb-6` a `mb-4` per avvicinare il badge al titolo
3. **Spaziatura sottotitolo** (riga 72): ridurre `mt-5` a `mt-4`
4. **Spaziatura CTA** (riga 84): ridurre `mt-10` a `mt-8` per compattare il blocco

Queste modifiche renderanno la colonna sinistra visivamente piu' bilanciata e coesa, con gli elementi raggruppati in modo armonico al centro verticale.
