

## Redesign tab bar con stile underline

Il reference mostra un design completamente diverso dalla tab bar attuale: le tab sono distribuite su tutta la larghezza, senza sfondo glassmorphic, e la tab attiva ha un **underline** (linea sotto) invece di un background colorato.

### Cambiamenti

**File: `src/components/landing/DashboardPreview.tsx`**

1. Rimuovere il contenitore glassmorphic esterno (border, bg-white/[0.07], backdrop-blur, rounded-2xl, p-1.5)
2. Cambiare il layout delle tab: usare `flex w-full justify-between` per distribuire le tab su tutta la larghezza
3. Stile tab attiva: testo bianco + underline (border-bottom o pseudo-elemento) al posto del background semi-trasparente
4. Stile tab inattiva: testo `text-white/50` senza sfondo
5. Rimuovere l'icona Check dalla tab attiva
6. Rimuovere lo style inline del gradient background

### Dettagli tecnici

- Contenitore tab: `flex w-full justify-between border-b border-white/10`
- Tab attiva: `text-white border-b-2 border-white pb-3`
- Tab inattiva: `text-white/50 hover:text-white/70 pb-3`
- Rimuovere import di `Check` da lucide-react
- Mantenere le icone a sinistra del label

