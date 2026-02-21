import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const SocialProofTooltip = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="mb-2 animate-fade-in">
      <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md border border-slate-100">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-slate-700">
          215 people had questions answered in 2 mins
        </span>
      </div>
    </div>
  );
};

export default SocialProofTooltip;
