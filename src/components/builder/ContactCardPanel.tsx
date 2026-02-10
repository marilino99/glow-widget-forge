import { useState } from "react";
import { ChevronLeft, Paperclip, Monitor, Star, MessageSquare, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

interface ContactCardPanelProps {
  onBack: () => void;
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
  contactName: string;
  onContactNameChange: (name: string) => void;
  offerHelp: string;
  onOfferHelpChange: (help: string) => void;
  onSaveConfig: (config: Record<string, unknown>) => void;
  reportBugsEnabled: boolean;
  onReportBugsChange: (enabled: boolean) => void;
  shareFeedbackEnabled: boolean;
  onShareFeedbackChange: (enabled: boolean) => void;
  forwardEmail: string;
  onForwardEmailChange: (email: string) => void;
}

const avatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f0d9b5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jade&backgroundColor=c1f0c1",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=d5f0f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=ffe4b5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=e8d5e3",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Max&backgroundColor=b5e8d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=f9e2d0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=d0e7f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=f5d5e0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ethan&backgroundColor=d5f5e0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Isla&backgroundColor=e0d5f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Liam&backgroundColor=f5edd5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=d5f0e8",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=f0e0d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=dde0f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ryan&backgroundColor=e8f0d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Lily&backgroundColor=f5d5d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Oscar&backgroundColor=d5e8f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ruby&backgroundColor=f0d5f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Finn&backgroundColor=d5f5f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nora&backgroundColor=f5e8d5",
];

const ContactCardPanel = ({ 
  onBack, 
  selectedAvatar, 
  onSelectAvatar,
  contactName,
  onContactNameChange,
  offerHelp,
  onOfferHelpChange,
  onSaveConfig,
  reportBugsEnabled,
  onReportBugsChange,
  shareFeedbackEnabled,
  onShareFeedbackChange,
  forwardEmail,
  onForwardEmailChange,
}: ContactCardPanelProps) => {
  const [avatarTab, setAvatarTab] = useState("gallery");
  const [responseTimeEnabled, setResponseTimeEnabled] = useState(true);
  const [responseTime, setResponseTime] = useState("minutes");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Store original values to detect changes and allow cancel
  const [originalName, setOriginalName] = useState(contactName);
  const [originalOfferHelp, setOriginalOfferHelp] = useState(offerHelp);
  const [originalAvatar, setOriginalAvatar] = useState(selectedAvatar);
  const [originalForwardEmail, setOriginalForwardEmail] = useState(forwardEmail);

  // Check if any changes have been made from original values
  const hasChanges = 
    contactName !== originalName || 
    offerHelp !== originalOfferHelp || 
    selectedAvatar !== originalAvatar ||
    forwardEmail !== originalForwardEmail;

  const handleSave = () => {
    if (!forwardEmail.trim()) {
      setEmailError(true);
      return;
    }
    onSaveConfig({
      selectedAvatar,
      contactName,
      offerHelp,
      forwardEmail,
    });
    // Update originals so hasChanges becomes false
    setOriginalName(contactName);
    setOriginalOfferHelp(offerHelp);
    setOriginalAvatar(selectedAvatar);
    setOriginalForwardEmail(forwardEmail);
  };

  const handleCancel = () => {
    onContactNameChange(originalName);
    onOfferHelpChange(originalOfferHelp);
    onSelectAvatar(originalAvatar);
    onForwardEmailChange(originalForwardEmail);
  };

  const handleBackClick = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onStayHere={() => setShowUnsavedDialog(false)}
        onDiscardChanges={handleCancel}
        sectionName="Contact card"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <h2 className="text-xl font-bold">Contact card</h2>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Let customers section */}
        <p className="mb-4 text-sm text-muted-foreground">Let customers</p>

        {/* Report bugs card */}
        <div className="mb-4 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Report bugs</h3>
            <Switch
              checked={reportBugsEnabled}
              onCheckedChange={onReportBugsChange}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>Up to 3 attachments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span>Automatic system and browser detection</span>
            </div>
          </div>
        </div>

        {/* Share feedback card */}
        <div className="mb-8 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Share feedback</h3>
            <Switch
              checked={shareFeedbackEnabled}
              onCheckedChange={onShareFeedbackChange}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Rating on a 1-5 scale</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Optional comment on the rate</span>
            </div>
          </div>
        </div>

        {/* Forward form inquiries */}
        <div className="mb-8">
          <Label htmlFor="forward-email" className="mb-2 block text-base font-semibold text-foreground">
            Forward form inquires to <span className="text-destructive">*</span>
          </Label>
          <Input
            id="forward-email"
            type="email"
            placeholder="your@email.com"
            value={forwardEmail}
            onChange={(e) => { onForwardEmailChange(e.target.value); setEmailError(false); }}
            className={`bg-muted/50 ${emailError ? "border-destructive" : ""}`}
          />
          {emailError && (
            <p className="mt-1 text-sm text-destructive">Email is required.</p>
          )}
        </div>

        {/* Pick avatar */}
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Label className="text-base font-semibold text-foreground">Pick avatar</Label>
            <Tabs value={avatarTab} onValueChange={setAvatarTab}>
              <TabsList className="h-9 bg-muted">
                <TabsTrigger value="gallery" className="text-sm">
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-sm">
                  Image upload
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {avatarTab === "gallery" && (
            <div className="rounded-xl bg-muted/30 p-2">
              <div className="max-h-[160px] overflow-y-auto flex flex-wrap gap-3 p-2">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectAvatar(avatar)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full transition-all ${
                      selectedAvatar === avatar
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-2"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {avatarTab === "upload" && (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Drag & drop an image or click to upload
              </p>
            </div>
          )}
        </div>

        {/* Add your name */}
        <div className="mt-8">
          <Label htmlFor="contact-name" className="mb-2 block text-base font-semibold text-foreground">
            Add your name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact-name"
            type="text"
            placeholder="Your name"
            value={contactName}
            onChange={(e) => onContactNameChange(e.target.value)}
            className="bg-muted/50"
          />
        </div>

        {/* Offer help */}
        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="offer-help" className="text-base font-semibold text-foreground">
              Offer help <span className="text-destructive">*</span>
            </Label>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted">
              <Sparkles className="h-4 w-4 text-foreground" />
            </button>
          </div>
          <Textarea
            id="offer-help"
            placeholder="Write to us"
            value={offerHelp}
            onChange={(e) => onOfferHelpChange(e.target.value)}
            className="min-h-[120px] resize-none bg-muted/50"
          />
        </div>

        {/* Response time */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <Checkbox
              id="response-time"
              checked={responseTimeEnabled}
              onCheckedChange={(checked) => setResponseTimeEnabled(checked as boolean)}
            />
            <Label htmlFor="response-time" className="text-base font-semibold text-foreground">
              Response time
            </Label>
          </div>
          
          {responseTimeEnabled && (
            <div className="mt-4">
              <p className="mb-3 text-sm text-muted-foreground">We typically respond within a few...</p>
              <RadioGroup value={responseTime} onValueChange={setResponseTime} className="space-y-2">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="minutes" id="minutes" />
                  <Label htmlFor="minutes" className="text-sm font-normal text-foreground">minutes</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="hours" id="hours" />
                  <Label htmlFor="hours" className="text-sm font-normal text-foreground">hours</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="days" id="days" />
                  <Label htmlFor="days" className="text-sm font-normal text-foreground">days</Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      </div>

      {/* Cancel / Save buttons - only show when changes are made */}
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

export default ContactCardPanel;
