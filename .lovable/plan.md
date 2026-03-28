

## Piano: Fix diagnostica Shopify post-installazione

### Problema
L'installazione del widget su Shopify **funziona correttamente** (confermato dai log del server: theme.liquid aggiornato + ScriptTag creato). Il problema è nella UI del builder:

1. Quando si apre il tab Shopify, `checkShopifyInstallation` (checkOnly) parte insieme all'installazione, creando una race condition
2. Dopo l'installazione, i diagnostici non vengono ricalcolati — `tagInstalled` resta `false` perché nessuno rilancia il check
3. Risultato: "Tag status: Not found" accanto a "Widget installed!" — confusivo

### Modifiche

**File: `src/components/builder/AddToWebsiteDialog.tsx`**

1. **In `handleShopifyOneClick`** (riga ~224): dopo `setShopifyInstalled(true)`, aggiornare anche `diagnostics.tagInstalled = true` con il metodo restituito dalla response:
   ```
   setDiagnostics(prev => ({
     ...prev,
     tagInstalled: true,
     method: result.method || "theme_liquid",
     recentImpressions: prev?.recentImpressions ?? 0,
     launcherVisible: prev?.launcherVisible ?? null,
     launcherChecked: prev?.launcherChecked ?? false,
   }));
   ```

2. **In `handleShopifyReinstall`** (riga ~263): stessa cosa dopo reinstallazione riuscita

3. **In `handleShopifyOneClick`**: dopo l'installazione, chiamare `fetchDiagnostics()` con un piccolo delay (1-2 secondi) per aggiornare le impressioni

4. **Nel response del server** (`shopify-install-widget/index.ts`): il risultato di `installViaThemeLiquid` include già `method: "theme_liquid"` — assicurarsi che il frontend lo legga dalla response (aggiungere `method` al tipo `result`)

### Risultato
Dopo l'installazione, la diagnostica mostra immediatamente "Tag status: ✓ Installed (theme_liquid)" coerente con "Widget installed!", eliminando la confusione.

