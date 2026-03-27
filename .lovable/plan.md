

## Piano: Eliminare la sezione "AI & Automation" dal builder

### Cosa viene rimosso

La sezione "AI & Automation" (accessibile dalla sidebar con label "AI Chatbot" e dalla bottom bar mobile con label "AI") con il pannello `ChatbotPanel` che contiene: selezione modello, temperatura, tone of voice, istruzioni aggiuntive.

### Modifiche

**File: `src/pages/Builder.tsx`**
1. Rimuovere il blocco `builderView === "ai"` (righe 938-955) che rende il pannello AI & Automation
2. Rimuovere `"ai"` dal tipo union di `builderView` in tutte le occorrenze (stato, setter, sessionStorage)
3. Rimuovere l'import di `ChatbotPanel`
4. Rimuovere le props relative al chatbot passate alla sidebar (`chatbotInstructions`, `aiProvider`, `aiApiKey`, `aiTemperature`, `aiTone`, `onSaveChatbotConfig`, `aiResponsesThisMonth`, `aiResponseLimit`, `isApproachingLimit`, `isAtLimit`)
5. Rimuovere la voce "AI" dalla bottom bar mobile (riga ~1144)

**File: `src/components/builder/BuilderSidebar.tsx`**
1. Rimuovere il `SidebarItem` "AI Chatbot" (righe 723-729)
2. Rimuovere le props relative al chatbot dall'interfaccia e dalla destrutturazione
3. Rimuovere `"ai"` dal tipo union di `builderView`
4. Rimuovere import di `ChatbotPanel` e `Bot`

**File: `src/components/builder/ChatbotPanel.tsx`**
- Eliminare il file

**Nota**: Le colonne database (`chatbot_enabled`, `chatbot_instructions`, `ai_provider`, ecc.) e le proprietà in `useWidgetConfiguration` restano invariate — i valori continueranno a funzionare nel widget di produzione. Viene rimossa solo l'interfaccia builder.

