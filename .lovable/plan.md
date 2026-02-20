
# Redesign del Survey Popup Onboarding

## Obiettivo
Ridisegnare il componente `OnboardingSurveyDialog` per replicare esattamente il design dello screenshot di riferimento: un popup grande con effetto glow arcobaleno in alto, card di opzioni con icone in griglia 2 colonne, indicatore di step "1/3" in basso a sinistra, pulsante "Next" in basso a destra, e pulsante "Skip" in alto a destra.

## Elementi di Design da Replicare

- **Effetto glow arcobaleno** in alto (gradiente pastel che sfuma verso il bianco)
- **Sfondo grigio chiaro** per tutto il popup (non bianco puro)
- **Titolo grande e bold** (la domanda)
- **Sottotitolo grigio** ("Aiutaci a personalizzare la tua esperienza")
- **"Seleziona 1"** come indicazione sotto il sottotitolo
- **Griglia 2 colonne** con card opzione grandi, sfondo bianco, bordo arrotondato, con icona + testo
- **Pulsante "Skip"** in alto a destra
- **Indicatore "1 / 3"** in basso a sinistra
- **Pulsante "Next >"** in basso a destra (grigio, si attiva quando si seleziona)
- **Nessun pulsante X** di chiusura

## Dettagli Tecnici

### File da modificare
**`src/components/builder/OnboardingSurveyDialog.tsx`** - Riscrittura completa del componente

### Struttura del nuovo componente
1. Il dialog usa `sm:max-w-2xl` per essere piu grande (come nello screenshot)
2. Rimuovere il close button dal DialogContent (nascondere la X)
3. Aggiungere in cima un div con gradiente arcobaleno (rosa/viola/azzurro/giallo) che sfuma verso trasparente
4. Titolo grande (`text-2xl font-bold`) centrato
5. Sottotitolo in grigio centrato
6. Testo "Seleziona 1" in grigio chiaro
7. Griglia `grid-cols-2` con card opzione: sfondo bianco, rounded-xl, padding generoso, con emoji/icona a sinistra e testo a destra
8. Footer con "1 / 3" a sinistra e pulsante "Next >" a destra
9. Pulsante "Skip" posizionato in alto a destra
10. Lo sfondo del dialog sara `bg-[#f5f5f7]` (grigio chiaro come nello screenshot)

### Icone per le opzioni
Usare emoji per le icone delle opzioni (come nello screenshot usa illustrazioni):
- **Domanda 1** (Tipo attivita): E-commerce (shopping bag), Servizi (briefcase), Ristorante (fork/knife), Blog (pen), Altro (dots)
- **Domanda 2** (Obiettivo): Vendite (chart up), Supporto (headset), Lead (users), Feedback (message)
- **Domanda 3** (Visitatori): icone diverse per range

Si useranno icone Lucide React gia installate nel progetto per mantenere uno stile coerente con illustrazioni stilizzate.

### Comportamento
- Click su opzione la seleziona (bordo evidenziato)
- Il pulsante "Next" avanza allo step successivo (non auto-avanza come adesso)
- All'ultimo step il pulsante diventa "Continua" e chiama `onComplete`
- "Skip" chiude il survey senza risposte (chiama `onComplete` con valori default o vuoti)

### Effetto glow arcobaleno
Un div posizionato absolute in alto con:
```css
background: linear-gradient(135deg, #fce4ec, #e8eaf6, #e0f7fa, #fff9c4);
height: 80px;
mask: linear-gradient(to bottom, black, transparent);
```
Questo replica l'effetto pastello sfumato visibile nello screenshot.
