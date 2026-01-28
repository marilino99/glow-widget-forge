import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Home, MessageCircle, HelpCircle, ChevronDown } from "lucide-react";

interface WidgetPreviewPanelProps {
  selectedAvatar?: string | null;
}

const WidgetPreviewPanel = ({ selectedAvatar }: WidgetPreviewPanelProps) => {
  const [previewUrl, setPreviewUrl] = useState("");

  return (
    <div className="flex h-full flex-col bg-muted/50 p-6">
      {/* Browser mockup */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Browser header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
            <div className="h-3 w-3 rounded-full bg-green-400/60" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Previewing</span>
            <Input
              placeholder="Your website URL"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="h-8 w-64 bg-background text-sm"
            />
            <Button size="icon" className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-20" />
        </div>

        {/* Preview content area */}
        <div className="relative flex-1 bg-muted/30 p-8">
          {/* Skeleton placeholder for website */}
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-full max-w-md rounded bg-muted" />
            <div className="h-4 w-3/4 max-w-sm rounded bg-muted" />
            <div className="mt-8 h-32 w-full max-w-lg rounded bg-muted" />
            <div className="h-4 w-full max-w-md rounded bg-muted" />
            <div className="h-4 w-2/3 max-w-sm rounded bg-muted" />
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl">
              <div className="h-24 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>

          {/* Widget preview in bottom-right */}
          <div className="absolute bottom-6 right-6 w-80">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl">
              {/* Widget header with gradient */}
              <div className="relative overflow-hidden px-6 py-5">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 blur-2xl" />
                <button className="absolute right-4 top-4 text-white/60 hover:text-white">
                  <Minus className="h-4 w-4" />
                </button>
                <h3 className="relative text-2xl font-bold">
                  Hello, nice to
                  <br />
                  see you here 👋
                </h3>
              </div>

              {/* Contact section */}
              <div className="mx-4 mb-4 rounded-xl bg-slate-700/50 p-4">
                <div className="flex items-center gap-3">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-900">
                      C
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-white/60">ciao</p>
                    <p className="text-sm">Write to us</p>
                  </div>
                </div>
                <Button className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600">
                  Contact us
                </Button>
              </div>

              {/* Quick answers section */}
              <div className="border-t border-white/10 px-4 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-white/60" />
                  <span className="text-sm font-medium">Quick answers</span>
                </div>
                <div className="space-y-1">
                  <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                    <span>What is the delivery time?</span>
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                    <span>Do you ship internationally?</span>
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </button>
                </div>
              </div>

              {/* Footer nav */}
              <div className="flex border-t border-white/10">
                <button className="flex flex-1 flex-col items-center gap-1 py-3 text-white">
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Home</span>
                </button>
                <button className="flex flex-1 flex-col items-center gap-1 py-3 text-white/60 hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs">Contact</span>
                </button>
              </div>

              {/* Powered by */}
              <div className="border-t border-white/10 py-2 text-center">
                <span className="text-xs text-white/40">
                  Powered by <span className="font-medium">WidgetPop</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPreviewPanel;
