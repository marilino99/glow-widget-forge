
# Effetto Typewriter sulla Bottom Bar

## Obiettivo
Aggiungere un effetto "typewriter" al testo della bottom bar, dove le lettere appaiono una alla volta come se venissero digitate.

## Implementazione

### 1. Creare un componente TypewriterText
Un nuovo componente React (`src/components/builder/TypewriterText.tsx`) che:
- Riceve il testo completo come prop
- Mostra le lettere una alla volta con un intervallo regolare (es. 30-40ms per lettera)
- Una volta completato il testo, fa una pausa e poi ricomincia da capo (loop)
- Usa `useState` e `useEffect` per gestire l'animazione
- Mantiene lo stesso stile (colore, dimensione) del testo attuale

### 2. Integrare nel WidgetPreviewPanel
Sostituire il tag `<span>` statico del testo nella bottom bar (riga ~787) con il nuovo componente `<TypewriterText>`, passando il messaggio `sayHello` come prop.

---

## Dettagli tecnici

### TypewriterText.tsx
- Props: `text` (string), `speed` (numero ms tra lettere, default ~35ms), `pauseDuration` (pausa prima di ricominciare, default ~2000ms), `className` e `style` per ereditare gli stili
- Usa `useEffect` con `setInterval` per incrementare un contatore di caratteri visibili
- Quando il contatore raggiunge la lunghezza del testo, pausa e poi resetta a 0
- Aggiunge un cursore lampeggiante opzionale (carattere `|`) alla fine durante la digitazione

### WidgetPreviewPanel.tsx (riga ~787)
- Importare `TypewriterText`
- Sostituire:
  ```
  <span className="flex-1 text-base text-slate-400 truncate">
    {sayHello || "Curious how we could help?..."}
  </span>
  ```
  Con:
  ```
  <TypewriterText
    text={sayHello || "Curious how we could help? — ask me anything!"}
    className="flex-1 text-base text-slate-400 truncate"
  />
  ```
