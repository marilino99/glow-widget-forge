

## Piano: Pagina Preview fullscreen per template

### Cosa si vuole
Quando l'utente clicca "Preview" su una card template, invece del dialog attuale, si apre una pagina fullscreen con:
- **Header** in alto: nome template a sinistra, icona cuore + toggle device (desktop/mobile) + bottone "CHOOSE" a destra (come nello screenshot di riferimento)
- **Body**: sfondo grigio chiaro (`#f5f5f5`) con un sito mockup al centro e il widget del template sovrapposto in basso a destra

### Modifiche in `src/components/builder/AllChannelsOverlay.tsx`

1. **Sostituire il Dialog di preview** con una vista fullscreen condizionale (simile alla overlay stessa)
2. Quando `previewTemplate` è settato, renderizzare un `div fixed inset-0 z-[60]` che copre tutto:
   - **Header**: bordo inferiore, contiene:
     - Bottone back (freccia + nome template)
     - A destra: icona Heart (toggle favorite), toggle Desktop/Mobile, bottone "CHOOSE" nero
   - **Body**: sfondo `bg-[#f5f5f5]`, al centro un mockup browser (rettangolo bianco con barra indirizzi finta) che simula un sito web generico
   - **Widget preview**: in basso a destra del mockup, un widget stilizzato con i colori/tema del template selezionato (bolla chat con il `sayHello` del template e il colore corrispondente)

3. **Device toggle**: stato `previewDevice` ("desktop" | "mobile") che cambia la larghezza del mockup (desktop: largo, mobile: ~375px centrato)

4. **Bottone CHOOSE**: chiama `handleChoose(previewTemplate)` esistente

### Struttura UI del preview

```text
┌─────────────────────────────────────────────────┐
│  < Template Name        ♡  📱 💻  OPEN ↗  CHOOSE│
├─────────────────────────────────────────────────┤
│                                                 │
│         ┌──────────────────────────┐            │
│         │  ● ● ●   example.com    │            │
│         │                         │            │
│         │   (mockup website)      │            │
│         │                         │            │
│         │                    [💬] │            │
│         └──────────────────────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

### File coinvolto
- `src/components/builder/AllChannelsOverlay.tsx` — rimuovere il Dialog preview, aggiungere la vista fullscreen con mockup

