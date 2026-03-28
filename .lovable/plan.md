

## Piano: Spostare "Powered by WidJet" sotto la barra Home/Contact

### Situazione attuale
Nel `widget-loader/index.ts` (righe 1830-1844), l'ordine di assemblaggio è:
1. `scroll` (contenuto scrollabile)
2. `powered` (branding "Powered by WidJet")
3. `footer` (barra navigazione Home/Contact)

Questo fa apparire il branding tra il contenuto e la nav bar, come si vede nello screenshot di BCP AI.

### Modifica proposta

**File: `supabase/functions/widget-loader/index.ts`**

Invertire l'ordine di `powered` e `footer` nell'assemblaggio DOM:

```
homeView.appendChild(scroll);
homeView.appendChild(footer);    // nav bar PRIMA
if (showBranding) {
  homeView.appendChild(powered); // branding DOPO
}
```

In questo modo il "Powered by WidJet" apparirà **sotto** la barra Home/Contact, oppure in alternativa possiamo integrarlo come riga piccola dentro il footer stesso.

### Risultato
Il branding sarà posizionato sotto la navigazione, risultando meno intrusivo e più coerente col layout.

