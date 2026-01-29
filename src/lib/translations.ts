export type SupportedLanguage = "en" | "it" | "es" | "fr" | "de" | "pt";

export interface WidgetTranslations {
  contactUs: string;
  quickAnswers: string;
  home: string;
  contact: string;
  show: string;
  writeMessage: string;
  welcomeMessage: string;
  deliveryTime: string;
  shipInternationally: string;
}

const translations: Record<SupportedLanguage, WidgetTranslations> = {
  en: {
    contactUs: "Contact us",
    quickAnswers: "Quick answers",
    home: "Home",
    contact: "Contact",
    show: "Show",
    writeMessage: "Write a message...",
    welcomeMessage: "Welcome! How can I help you?",
    deliveryTime: "What is the delivery time?",
    shipInternationally: "Do you ship internationally?",
  },
  it: {
    contactUs: "Contattaci",
    quickAnswers: "Risposte rapide",
    home: "Home",
    contact: "Contatto",
    show: "Mostra",
    writeMessage: "Scrivi un messaggio...",
    welcomeMessage: "Benvenuto/a! In che modo posso esserti utile?",
    deliveryTime: "Quali sono i tempi di consegna?",
    shipInternationally: "Spedite all'estero?",
  },
  es: {
    contactUs: "Contáctanos",
    quickAnswers: "Respuestas rápidas",
    home: "Inicio",
    contact: "Contacto",
    show: "Ver",
    writeMessage: "Escribe un mensaje...",
    welcomeMessage: "¡Bienvenido/a! ¿Cómo puedo ayudarte?",
    deliveryTime: "¿Cuál es el tiempo de entrega?",
    shipInternationally: "¿Hacen envíos internacionales?",
  },
  fr: {
    contactUs: "Contactez-nous",
    quickAnswers: "Réponses rapides",
    home: "Accueil",
    contact: "Contact",
    show: "Voir",
    writeMessage: "Écrivez un message...",
    welcomeMessage: "Bienvenue ! Comment puis-je vous aider ?",
    deliveryTime: "Quel est le délai de livraison ?",
    shipInternationally: "Livrez-vous à l'international ?",
  },
  de: {
    contactUs: "Kontaktieren Sie uns",
    quickAnswers: "Schnelle Antworten",
    home: "Startseite",
    contact: "Kontakt",
    show: "Anzeigen",
    writeMessage: "Nachricht schreiben...",
    welcomeMessage: "Willkommen! Wie kann ich Ihnen helfen?",
    deliveryTime: "Wie lange dauert die Lieferung?",
    shipInternationally: "Liefern Sie international?",
  },
  pt: {
    contactUs: "Entre em contato",
    quickAnswers: "Respostas rápidas",
    home: "Início",
    contact: "Contato",
    show: "Ver",
    writeMessage: "Escreva uma mensagem...",
    welcomeMessage: "Bem-vindo/a! Como posso ajudar?",
    deliveryTime: "Qual é o prazo de entrega?",
    shipInternationally: "Vocês fazem envio internacional?",
  },
};

export const getTranslations = (language: string): WidgetTranslations => {
  return translations[language as SupportedLanguage] || translations.en;
};
