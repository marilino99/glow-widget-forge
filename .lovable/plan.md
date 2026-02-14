
## Effetto transizione Features -> Dashboard

L'obiettivo e' ricreare l'effetto visibile nello screenshot di riferimento: la sezione Dashboard parte con lo sfondo scuro della sezione Features (#110c29) e sfuma verso il bianco con una curva arrotondata, creando una transizione elegante.

### Cosa cambiera

**File: `src/components/landing/DashboardPreview.tsx`**

1. Rimuovere il gradiente di sfondo attuale (muted/30 -> muted/50 -> muted/30)
2. Aggiungere in cima alla sezione un blocco decorativo che:
   - Ha sfondo `#110c29` (stesso colore della sezione Features)
   - Sfuma verso il basso in trasparente/bianco usando un gradiente radiale ellittico
   - L'effetto radiale crea la forma arrotondata visibile nello screenshot, con il viola che si concentra in alto al centro e si dissolve lateralmente e verso il basso
3. Il contenuto testuale e l'immagine restano invariati, posizionati sopra questo sfondo sfumato

### Dettagli tecnici

- Verra' usato un `div` assoluto con `background: radial-gradient(ellipse at top center, #110c29 0%, transparent 70%)` per ottenere la curva arrotondata
- La sezione avra' padding superiore extra per dare spazio alla sfumatura
- Nessuna gap visibile tra Features e Dashboard grazie allo sfondo continuo
