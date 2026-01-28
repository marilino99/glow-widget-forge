import { useState } from "react";
import { ChevronLeft, Paperclip, Monitor, Star, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactCardPanelProps {
  onBack: () => void;
}

const avatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f0d9b5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jade&backgroundColor=c1f0c1",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=d5f0f0",
];

const ContactCardPanel = ({ onBack }: ContactCardPanelProps) => {
  const [reportBugsEnabled, setReportBugsEnabled] = useState(false);
  const [shareFeedbackEnabled, setShareFeedbackEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarTab, setAvatarTab] = useState("gallery");

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <h2 className="text-xl font-bold">Contact card</h2>
        </button>
      </div>

      <div className="p-6">
        {/* Let customers section */}
        <p className="mb-4 text-sm text-muted-foreground">Let customers</p>

        {/* Report bugs card */}
        <div className="mb-4 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Report bugs</h3>
            <Switch
              checked={reportBugsEnabled}
              onCheckedChange={setReportBugsEnabled}
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
              onCheckedChange={setShareFeedbackEnabled}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted/50"
          />
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
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="flex flex-wrap gap-3">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative h-16 w-16 overflow-hidden rounded-full transition-all ${
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
      </div>
    </div>
  );
};

export default ContactCardPanel;
