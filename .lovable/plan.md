

## Fix del Widget Loader - Errore di Sintassi

### Problema
La funzione `widget-loader` non si deploya correttamente. Il browser riceve una risposta non valida invece dello script JavaScript del widget, causando l'errore "Unexpected identifier 'https'" alla riga 357.

### Causa
La riga 1 del file `supabase/functions/widget-loader/index.ts` importa `createClient` da `https://esm.sh/@supabase/supabase-js@2.49.1`, ma questa dipendenza **non viene mai usata** nella funzione. La funzione usa solo `Deno.env.get("SUPABASE_URL")` per ottenere l'URL e poi genera uno script JavaScript puro. L'import inutilizzato potrebbe causare problemi di deploy.

### Soluzione

**File: `supabase/functions/widget-loader/index.ts`**
- Rimuovere completamente l'import inutilizzato `createClient` dalla riga 1
- Questo elimina la dipendenza esterna non necessaria e potenzialmente problematica
- La funzione continua a funzionare identicamente perche' non usa mai `createClient`

### Dettagli Tecnici

La funzione widget-loader:
- Legge `SUPABASE_URL` dalle variabili d'ambiente (non serve il client Supabase)
- Genera e restituisce uno script JavaScript puro come stringa
- Non fa nessuna query al database

Rimuovendo l'import, la funzione diventa autosufficiente e si deploya senza dipendenze esterne che possono fallire.

Dopo la modifica, verificheremo il deploy e testeremo che lo script venga servito correttamente.

