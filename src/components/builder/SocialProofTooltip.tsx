import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const SocialProofTooltip = () => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 3500);
    const hideTimer = setTimeout(() => setFadingOut(true), 6500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`mb-2 transition-all duration-500 ease-in-out ${fadingOut ? 'opacity-0 translate-y-3' : 'animate-fade-in'}`}
      onTransitionEnd={() => fadingOut && setVisible(false)}
    >
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
