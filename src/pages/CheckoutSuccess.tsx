import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const CheckoutSuccess = () => {
  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => window.close(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
        <p className="text-muted-foreground">
          You can close this tab and return to the builder.
        </p>
        <p className="text-xs text-muted-foreground">This tab will close automatically...</p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
