

## Nuova sezione "AI you control" dopo Solutions

Creare una nuova sezione che replica esattamente la struttura del reference, posizionata dopo la sezione "Solutions" e prima di "Features".

### Struttura dalla reference image

1. **Headline**: "AI you *control*. Completely." -- "control" in corsivo con colore accent (arancione/brand)
2. **Card grande (full-width)**: sfondo grigio chiaro con testo "Supervise your AI agent in real time..." + pulsante CTA nero "Build your first AI agent" in alto a destra + mockup lista chat sotto
3. **Due card affiancate (grid 2 colonne)**:
   - Sinistra: "You set the rules. AI plays by them." con descrizione e mockup knowledge sources
   - Destra: "Live insights into your team and AI." con descrizione e mockup analytics
4. **Card grande (full-width)**: "On-brand in every reply." con metà sinistra bianca (testo) e metà destra color corallo/arancione con mockup tone selector

### Cambiamenti

**Nuovo file: `src/components/landing/AIControl.tsx`**

- Sezione con `px-6 py-16 md:py-24` e `max-w-7xl mx-auto` per allineamento con le altre sezioni
- Headline con `font-bold text-4xl md:text-6xl`, parola "control" in `<em>` con colore arancione (#c75a2a)
- Card 1: `rounded-3xl` con sfondo `bg-[#e8e5df]` (grigio caldo), padding generoso, griglia interna per header (testo + CTA) e sotto il mockup della lista chat (costruito con div/componenti HTML puri, non immagini)
- Mockup lista chat: righe con badge "Chatting now"/"Closed deal", avatar doppi, nome "AI agent and [Nome]", pulsante "Supervise chat"
- Grid 2 colonne (`md:grid-cols-2 gap-6`):
  - Card sinistra: sfondo `bg-[#e8e5df]`, testo bold a sinistra, mockup knowledge sources a destra (browser bar + icone file)
  - Card destra: sfondo `bg-[#9a9a8a]` (grigio-verde), mockup analytics (Total value, Total orders, Avg time) a sinistra, testo a destra
- Card 3 full-width: `rounded-3xl overflow-hidden`, layout grid 2 col, metà sinistra bianca con testo, metà destra `bg-[#c4785a]` (corallo) con mockup tone selector (pill "Formal", "Friendly", "Direct", "Polite") e bolla chat
- Animazioni con `framer-motion` (fadeUp) come nelle altre sezioni
- Traduzioni EN/IT integrate nel componente (stesso pattern di Solutions.tsx con oggetto locale)

**File: `src/pages/Index.tsx`**

- Import del nuovo componente `AIControl`
- Inserirlo tra `<Solutions />` e `<Features />`

### Dettagli tecnici

- I mockup sono costruiti interamente in HTML/CSS (non immagini), replicando fedelmente la struttura visiva del reference
- Colori estratti dal reference: sfondo card `#e8e5df`, corallo `#c4785a`, grigio-verde `#9a9a8a`
- Responsive: su mobile le grid 2 colonne diventano stack verticale
- Il componente usa `useLandingLang()` per le traduzioni

