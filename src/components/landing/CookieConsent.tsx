import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-lg animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-border bg-background p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">🍪 Cookie</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizziamo cookie tecnici e di analisi per migliorare la tua esperienza. 
              Leggi la nostra{" "}
              <a href="/privacy" className="underline text-primary hover:text-primary/80">
                Privacy Policy
              </a>.
            </p>
          </div>
          <button onClick={decline} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={decline} className="flex-1 text-xs">
            Rifiuta
          </Button>
          <Button size="sm" onClick={accept} className="flex-1 text-xs">
            Accetta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
