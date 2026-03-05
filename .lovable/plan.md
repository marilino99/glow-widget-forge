

## Piano: Sostituire la card "Supervise" con i badge di sicurezza/compliance

### Cosa cambia

Sostituire la **Card 1 (Supervise your AI agent)** nella sezione AIControl con una card moderna che mostra 4 badge di compliance, simili allo screenshot di riferimento. Il layout sarà una griglia 2x2 (o 4 colonne su desktop) di box con icone, titoli e descrizioni brevi.

### Design

La card mantiene lo stesso contenitore `rounded-3xl bg-white p-8 md:p-10`. Al suo interno:

- **Titolo**: "Enterprise-grade security" (o equivalente italiano)
- **Sottotitolo**: "Built on Google Cloud certified infrastructure"
- **4 box** in griglia responsive (2 colonne mobile, 4 colonne desktop), ciascuno con:
  - Icona Lucide su sfondo colorato leggero (emerald per sicurezza)
  - Nome della certificazione in grassetto
  - Breve descrizione in grigio
  - Bordo sottile e angoli arrotondati

I 4 elementi:
1. **ISO/IEC 27001** — "Certified information security management via Google Cloud"
2. **SOC 2 Type II** — "Independently audited security controls and data protection"
3. **GDPR Ready** — "Full compliance with European data privacy regulations"
4. **Zero-Training Guarantee** — "Your data is never used to train AI models. Inference-only."

### File modificato

**`src/components/landing/AIControl.tsx`**

- Rimuovere la Card 1 "Supervise" (righe 189-200)
- Sostituire con la nuova card contenente la griglia dei 4 badge
- Aggiornare le traduzioni i18n (en/it) per i nuovi testi
- Rimuovere `ChatListMockup` (non più usato)
- Importare icone aggiuntive: `Shield`, `CloudOff`, `Scale`

### Risultato

Una sezione sicurezza professionale e moderna con badge reali che comunicano affidabilità, al posto della card "Supervise" che era più generica.

