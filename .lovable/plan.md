
## Piano: Aggiungere immagini prodotto e box bianca

### Cosa faremo
1. **Copiare le immagini** della t-shirt blu e della hoodie nera dal upload dell'utente nel progetto (in `src/assets/`)
2. **Aggiornare il mockup della conversazione** nella card "You set the rules":
   - Sostituire i placeholder colorati con le immagini reali dei prodotti
   - Avvolgere le product card e il pulsante "Buy now" in un contenitore bianco arrotondato (come nella foto di riferimento)
   - Aggiungere "Cartsy" come brand sotto il prezzo, come mostrato nello screenshot

### Dettagli tecnici

**File modificati:** `src/components/landing/AIControl.tsx`

- Le immagini verranno salvate come `src/assets/product-tshirt-blue.png` e `src/assets/product-hoodie-navy.png` (ritagliate dallo screenshot)
- Tuttavia, dato che l'immagine caricata e' uno screenshot completo e non immagini singole dei prodotti, useremo delle immagini placeholder SVG stilizzate che rappresentano una t-shirt blu e una hoodie navy, mantenendo l'estetica pulita
- Il blocco prodotti + "Buy now" verra' avvolto in un `div` con `bg-white rounded-2xl p-4 shadow-sm` per replicare la box bianca della foto
- Le card prodotto avranno sfondo grigio chiaro `bg-[#ecedf2]` per l'area immagine, con sotto nome, variante, prezzo e brand "Cartsy"
