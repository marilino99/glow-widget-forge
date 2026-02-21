

# Effetto Glow Bianco sulla Bottom Bar

## Cosa cambia
Quando la bottom bar appare (dopo il click sul tondolino), viene aggiunto un effetto di **ombra bianca diffusa** attorno alla barra per metterla in risalto sullo sfondo della pagina. L'effetto e visibile solo quando la barra e espansa.

## Dettagli tecnici

### File modificato: `src/components/builder/WidgetPreviewPanel.tsx`

Aggiungere un `box-shadow` con glow bianco al contenitore interno della bottom bar (il `div` con classe `rounded-full bg-white`):

```css
box-shadow: 0 0 20px 8px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.08);
```

Questo combina:
- Un glow bianco diffuso (20px blur, 8px spread, 60% opacita)
- L'ombra sottile esistente per profondita

Viene applicato tramite l'attributo `style` inline sul div interno della barra, riga ~780.

