import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackPopoverProps {
  userEmail?: string;
}

const FeedbackPopover = ({ userEmail }: FeedbackPopoverProps) => {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-feedback", {
        body: { feedback: feedback.trim(), userEmail },
      });
      if (error) throw error;
      toast.success("Thanks for your feedback!");
      setFeedback("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          Feedback
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-4" sideOffset={12}>
        <textarea
          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={4}
          placeholder="Type your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <div className="flex items-end justify-between mt-3">
          <p className="text-xs text-muted-foreground leading-snug max-w-[200px]">
            We don't respond to submissions,<br />but we read all of them carefully
          </p>
          <Button
            size="sm"
            className="rounded-lg px-5"
            onClick={handleSubmit}
            disabled={sending || !feedback.trim()}
          >
            {sending ? "Sending..." : "Submit"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FeedbackPopover;
