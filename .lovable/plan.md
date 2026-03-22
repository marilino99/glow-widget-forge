

## Analisi: Il widget live mostra "Chat Now" invece di "AI Sales Expert"

### Risultato

Ho verificato riga per riga l'intero flusso:

1. **`widget-config/index.ts`** (riga 34, 105): seleziona e ritorna `offer_help` correttamente.
2. **`widget-loader/index.ts`** (riga 172): `var help = cfg.offer_help || 'Write to us'` — corretto.
3. **`widget-loader/index.ts`** (riga 1612): il sottotitolo chat usa `esc(help || tr.contactUs || 'Contact us')` — corretto.
4. **`widget-loader/index.ts`** (riga 1590): il footer nav usa `esc(ctaText || tr.contact)` — questo mostra `cta_text` ("Chat Now"), ma solo nel footer, non nel sottotitolo.

**Il codice sorgente è già corretto.** "Chat Now" è il valore di `cta_text`, non di `offer_help`. Il fatto che tu veda ancora "Chat Now" nel sottotitolo della chat significa che la versione deployata della edge function è ancora quella vecchia (prima della modifica).

### Piano

Forzare il redeploy della edge function `widget-loader` per sincronizzare il codice sorgente (già corretto) con la versione live. Nessuna modifica al codice necessaria.

### Azione
- Redeploy di `widget-loader` tramite il tool di deploy.

