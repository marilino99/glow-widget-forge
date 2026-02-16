
# Miglioramento sezione Dashboard con glow e gradiente

## Obiettivo
Rendere la sezione Dashboard visivamente piu impattante aggiungendo effetti di glow e gradiente attorno all'immagine, in linea con lo stile gia presente nella sezione Features (sfondo scuro + glow viola).

## Modifiche previste

### `src/components/landing/DashboardPreview.tsx`

1. **Sfondo scuro** - Cambiare lo sfondo della sezione da chiaro/muted a un colore scuro (`#110c29`) come nella sezione Features, con testo bianco per coerenza visiva.

2. **Glow diffuso dietro l'immagine** - Aggiungere un blob di gradiente viola/indaco sfocato posizionato dietro l'immagine per creare un effetto luminoso che attiri l'attenzione.

3. **Bordo animato con gradiente** - Applicare all'immagine lo stesso stile `hero-image-border` gia definito in `index.css` (gradiente conico rotante viola con box-shadow glow), creando un wrapper con padding che funge da cornice luminosa animata.

4. **Ombra glow viola** - Sostituire l'attuale `shadow-primary/5` con un box-shadow viola piu intenso per rafforzare l'effetto.

## Dettagli tecnici

- Riutilizzo della classe CSS `hero-image-border` gia esistente in `index.css` (gradiente conico animato + box-shadow viola)
- Struttura: wrapper div con `hero-image-border` + padding 2px + immagine con `rounded-2xl` interno
- Blob glow di sfondo con `blur-[100px]` e gradiente viola/indaco dietro l'immagine
- Nessun nuovo file CSS necessario, tutto basato su classi esistenti e Tailwind
