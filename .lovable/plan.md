

# Template Gallery - Temi Pronti all'Uso

## Panoramica
Aggiungere una sezione "Templates" nella sidebar del builder che permette agli utenti di applicare con un click configurazioni predefinite (tema, colore, sfondo, messaggio di benvenuto, ecc.). Alcuni template saranno gratuiti, altri riservati al piano Pro.

## Come funziona per l'utente
1. Nella sidebar, sotto "Customize look", appare una nuova voce **"Templates"**
2. Cliccando si apre un pannello con una griglia di card preview
3. Ogni card mostra un'anteprima visiva del widget con quel tema applicato
4. Cliccando "Apply" il template sovrascrive le impostazioni di aspetto (tema, colore, sfondo, messaggio, ecc.)
5. I template Pro mostrano un badge "PRO" e richiedono l'upgrade

## Template inclusi (esempio)

| Nome | Tipo | Tema | Colore | Sfondo | Messaggio |
|------|------|------|--------|--------|-----------|
| Minimal Light | Free | light | gray | solid | "Hi there! How can we help?" |
| Ocean Blue | Free | dark | blue | gradient | "Welcome aboard!" |
| Sunset Vibes | Free | dark | orange | gradient | "Hey! What can we do for you?" |
| Black Friday | Pro | dark | red | image (dark) | "Don't miss our deals!" |
| Luxury Gold | Pro | dark | yellow | solid | "Welcome to our exclusive store" |
| Nature Green | Pro | light | green | gradient | "Hello! We're here to help" |
| Neon Purple | Pro | dark | purple | gradient | "Hey! Let's chat" |
| Coral Pink | Pro | dark | pink | gradient | "Hi! Ask us anything" |

## Dettagli tecnici

### Nuovi file
- **`src/components/builder/TemplatesPanel.tsx`** -- Pannello con griglia di template. Ogni template e un oggetto JS con le configurazioni preimpostate (nessun database necessario). Mostra card con anteprima miniatura, nome, e pulsante "Apply". I template Pro hanno un overlay con badge PRO e cliccando si attiva l'UpgradeOverlay.

### Modifiche ai file esistenti

**`src/components/builder/BuilderSidebar.tsx`**:
- Aggiungere stato `showTemplatesPanel`
- Aggiungere icona `LayoutTemplate` da lucide-react
- Aggiungere `SidebarItem` per "Templates" nella sezione "Customize look"
- Aggiungere il rendering condizionale del `TemplatesPanel`
- Al click su "Apply", chiamare le funzioni `onWidgetThemeChange`, `onWidgetColorChange`, `onBackgroundTypeChange`, `onSayHelloChange` ecc. con i valori del template, poi `onSaveConfig` per persistere

### Nessuna modifica al database
I template sono hardcoded come costanti nel frontend -- non servono nuove tabelle o migrazioni. In futuro si potranno spostare su database se necessario.

### Flusso "Apply Template"
1. Utente clicca "Apply" su un template
2. Si apre un dialog di conferma: "Applying this template will override your current theme settings. Continue?"
3. Se confermato, le impostazioni vengono aggiornate localmente e salvate nel database tramite `saveConfig`
4. L'anteprima del widget si aggiorna immediatamente

