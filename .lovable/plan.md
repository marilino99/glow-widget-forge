
# Gradiente intenso + effetto glow stile Canva nella preview del Builder

## Cosa cambia

La sezione preview del builder avra un gradiente viola piu ricco e intenso, con un effetto glow radiale luminoso in alto (simile a Canva), che crea una sensazione di profondita e premium.

## Dettagli tecnici

### File: `src/pages/Builder.tsx` (linea 300)

Sostituire il semplice `bg-gradient-to-b` con un contenitore che include:

1. **Gradiente di base piu intenso**: colori viola piu saturi partendo dall'alto
2. **Blob glow radiale**: un elemento decorativo posizionato in alto al centro con un gradiente radiale viola/indigo sfumato, con blur elevato per creare l'effetto "luce diffusa" tipico di Canva
3. **Secondo blob opzionale**: leggermente spostato per dare profondita

Implementazione concreta:
- Il div contenitore avra `relative` e il gradiente di base piu intenso: `from-[hsl(270,60%,92%)] via-[hsl(260,40%,95%)] to-[hsl(0,0%,98%)]`
- Un div assoluto in alto con gradiente radiale viola (`bg-[radial-gradient(ellipse_at_top,hsl(270,70%,85%)_0%,transparent_70%)]`) con `opacity-60` e `blur-3xl` per l'effetto glow diffuso
- Un secondo blob piu piccolo spostato a destra con toni indigo per variazione cromatica

Il `WidgetPreviewPanel` rimane invariato, solo lo sfondo dietro cambia.
