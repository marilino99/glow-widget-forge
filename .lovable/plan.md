

## Piano: Allineare "All widgets" con le card senza spostarlo più in basso

Il problema attuale: spostando il titolo dentro il `div` con `px-36`, il titolo si è allineato orizzontalmente con le card ma si è anche spostato più in basso (sotto il pulsante Back, in un div separato).

### Soluzione

Rimettere il titolo sulla stessa riga del pulsante "Back" (come prima), ma applicare al titolo un `margin-left` che compensi la differenza di padding tra il container esterno (`px-12`) e quello interno (`px-36`), così il testo risulta visivamente allineato con l'inizio delle card.

**`src/components/builder/AllChannelsOverlay.tsx`**:
- Spostare l'`h1` fuori dal `div.px-36`, di nuovo accanto al pulsante Back nella stessa riga flex
- Aggiungere `ml-36` (o equivalente `9rem`) al titolo per allinearlo con il bordo sinistro delle card
- Struttura risultante:
```tsx
<div className="flex items-center mb-4">
  <button ...>Back</button>
  <h1 className="text-3xl font-bold text-[#1a1a2e] ml-36">All widgets</h1>
</div>
<div className="px-36">
  {/* cards */}
</div>
```

Questo mantiene il titolo alla stessa altezza del Back button e lo allinea orizzontalmente con le card.

