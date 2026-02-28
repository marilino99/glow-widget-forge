

## Modifiche alla sezione "Works with your tools"

### Cosa cambia

1. **Offset della seconda riga**: Aggiungere un `padding-left` (circa `pl-12` o `ml-12`) alla seconda riga di tool pills, cosi le icone non sono allineate con la prima riga, come nel reference.

2. **Ultima icona tagliata a meta**: Aggiungere un effetto di fade/clip sul lato destro del container delle righe, usando un gradient mask (`mask-image`) o semplicemente assicurandosi che il container abbia `overflow-hidden` e che le pill vadano oltre il bordo visibile. Aggiungere anche un tool extra (HubSpot c'e gia come ultimo) per garantire che l'ultima pill venga tagliata.

### Dettagli tecnici

**File: `src/components/landing/AIControl.tsx`**

- Aggiungere `ml-12` alla seconda riga (`toolRow2`)
- Cambiare il container delle righe da `overflow-hidden` e aggiungere una mask CSS con gradiente trasparente sul lato destro per dare l'effetto di taglio dell'ultima icona
- Eventualmente aggiungere uno style inline con `maskImage: 'linear-gradient(to right, black 85%, transparent)'` al container di ogni riga

