

## Piano: Migliorare leggibilità delle product card nei Reels

### Problema
Le product card nella vista Reels del widget live hanno testo sovrapposto e poco leggibile perché:
1. Lo sfondo della card è troppo trasparente (`rgba(255,255,255,0.15)`) — il contenuto del video dietro traspare troppo
2. Il padding e la spaziatura tra titolo e prezzo sono troppo stretti (`gap:2px`, `padding:8px`)
3. Il gradiente scuro sul fondo del video non è abbastanza intenso per garantire contrasto

### Modifiche

**File: `supabase/functions/widget-loader/index.ts`**

1. **Aumentare opacità sfondo card** — da `rgba(255,255,255,0.15)` a `rgba(0,0,0,0.65)` (sfondo scuro semi-trasparente) sia nelle card collapsed (deck) che expanded, per contrasto netto col video dietro

2. **Aumentare padding e gap** — card padding da `8px` a `10px 12px`, gap tra titolo e prezzo da `2px` a `4px`

3. **Aumentare dimensione testo** — titolo da `11px` a `13px`, prezzo da `14px` a `15px`

4. **Aumentare altezza del deck collapsed** — da `56px` a `64px` per evitare che le card si sovrappongano verticalmente

5. **Intensificare il gradiente di fondo** — da `rgba(0,0,0,0.85)` a `rgba(0,0,0,0.9)` e altezza da `180px` a `220px`

Queste modifiche si applicano alla funzione `buildCardHtml` e ai container `deck`/`stack` (righe ~1697-1742).

