import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FeedbackPopover = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await supabase.functions.invoke("send-bug-report", {
        body: { message: message.trim(), type: "feedback" },
      });
      toast.success("Feedback sent! Thank you.");
      setMessage("");
      setOpen(false);
    } catch {
      toast.error("Failed to send feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <MessageSquareText className="h-5 w-5" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4" sideOffset={8}>
        <Textarea
          placeholder="Ideas to improve this page..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] resize-none bg-muted/50"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a href="mailto:support@jetwidget.com" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FeedbackPopover;
