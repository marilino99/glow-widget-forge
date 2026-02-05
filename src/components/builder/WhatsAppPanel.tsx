import { useState } from "react";
import { ChevronLeft, MessageCircle, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UnsavedChangesDialog from "./UnsavedChangesDialog";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppPanelProps {
  onBack: () => void;
  whatsappEnabled: boolean;
  onWhatsappToggle: (enabled: boolean) => void;
  whatsappCountryCode: string;
  onWhatsappCountryCodeChange: (code: string) => void;
  whatsappNumber: string;
  onWhatsappNumberChange: (number: string) => void;
  onSaveConfig: (config: Record<string, unknown>) => void;
}

const countryCodes = [
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+351", country: "PT", flag: "🇵🇹" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+43", country: "AT", flag: "🇦🇹" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+32", country: "BE", flag: "🇧🇪" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+54", country: "AR", flag: "🇦🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
];

const WhatsAppPanel = ({
  onBack,
  whatsappEnabled,
  onWhatsappToggle,
  whatsappCountryCode,
  onWhatsappCountryCodeChange,
  whatsappNumber,
  onWhatsappNumberChange,
  onSaveConfig,
}: WhatsAppPanelProps) => {
  const { toast } = useToast();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  
  // Store original values to detect changes
  const [originalEnabled] = useState(whatsappEnabled);
  const [originalCountryCode] = useState(whatsappCountryCode);
  const [originalNumber] = useState(whatsappNumber);

  const hasChanges =
    whatsappEnabled !== originalEnabled ||
    whatsappCountryCode !== originalCountryCode ||
    whatsappNumber !== originalNumber;

  const handleSave = () => {
    // Validate: if WhatsApp is enabled, phone number is required
    if (whatsappEnabled && !whatsappNumber.trim()) {
      setShowPhoneError(true);
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to enable WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    
    setShowPhoneError(false);
    onSaveConfig({
      whatsappEnabled,
      whatsappCountryCode,
      whatsappNumber,
    });
    onBack();
  };

  const handleCancel = () => {
    onWhatsappToggle(originalEnabled);
    onWhatsappCountryCodeChange(originalCountryCode);
    onWhatsappNumberChange(originalNumber);
    onBack();
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  };

  const selectedCountry = countryCodes.find(c => c.code === whatsappCountryCode) || countryCodes[0];

  return (
    <div className="flex h-full flex-col bg-background">
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onStayHere={() => setShowUnsavedDialog(false)}
        onDiscardChanges={handleCancel}
        sectionName="WhatsApp"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            <h2 className="text-xl font-bold">WhatsApp</h2>
          </button>
          <Switch
            checked={whatsappEnabled}
            onCheckedChange={onWhatsappToggle}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Description */}
        <p className="mb-6 text-sm text-muted-foreground">
          Handle customers' queries through WhatsApp application. Customers will be able to write to you using their desktop and mobile apps.
        </p>

        {/* Features list */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <span>Invites to chat when the widget is minimized</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <span>Opens up a WhatsApp application</span>
          </div>
        </div>

        {/* Phone number input */}
        <div>
          <Label className="mb-3 block text-base font-semibold text-foreground">
            Phone number
          </Label>
          <div className="flex gap-2">
            <Select
              value={whatsappCountryCode}
              onValueChange={onWhatsappCountryCodeChange}
            >
              <SelectTrigger className="w-[130px] bg-muted/50">
                <SelectValue>
                  {selectedCountry.country} ({selectedCountry.code})
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {countryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.country} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="tel"
              placeholder="3472176893"
              value={whatsappNumber}
              onChange={(e) => {
                onWhatsappNumberChange(e.target.value.replace(/\D/g, ''));
                if (showPhoneError) setShowPhoneError(false);
              }}
              className={`flex-1 bg-muted/50 ${showPhoneError ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          {showPhoneError && (
            <p className="mt-2 text-sm text-destructive">Phone number is required</p>
          )}
        </div>
      </div>

      {/* Cancel / Save buttons */}
      {hasChanges && (
        <div className="sticky bottom-0 border-t border-border bg-background p-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPanel;
