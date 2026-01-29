import { ArrowLeft, ImagePlus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef } from "react";

interface TypographyPanelProps {
  onBack: () => void;
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  sayHello: string;
  onSayHelloChange: (text: string) => void;
  onSaveConfig: (config: Record<string, unknown>) => void;
  hasUnsavedChanges: boolean;
  onCancel: () => void;
}

const TypographyPanel = ({
  onBack,
  logo,
  onLogoChange,
  language,
  onLanguageChange,
  sayHello,
  onSayHelloChange,
  onSaveConfig,
  hasUnsavedChanges,
  onCancel,
}: TypographyPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">Typography</h2>
        </div>

        <div className="space-y-8">
          {/* Logo Section */}
          <div>
            <Label className="text-sm font-medium text-foreground">Logo</Label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUploadClick}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Choose Language Section */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Choose language
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the language for your widget text</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="mt-2 w-full bg-muted border-0">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Say Hello Section */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Say hello <span className="text-red-500">*</span>
            </Label>
            <Input
              value={sayHello}
              onChange={(e) => onSayHelloChange(e.target.value)}
              placeholder="Hello, nice to see you here 👋"
              className="mt-2 bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Fixed Footer with Save/Cancel Buttons */}
      {hasUnsavedChanges && (
        <div className="shrink-0 border-t border-border bg-background p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => onSaveConfig({ logo, language, sayHello })}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypographyPanel;
