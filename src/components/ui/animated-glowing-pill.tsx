import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGlowingPillProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedGlowingPill = ({ children, className }: AnimatedGlowingPillProps) => {
  return (
    <div className={cn("relative inline-flex group", className)}>
      {/* SVG animated gradient border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(270, 80%, 60%)" stopOpacity="1">
              <animate attributeName="stop-color" values="hsl(270,80%,60%);hsl(310,70%,55%);hsl(25,95%,55%);hsl(210,100%,55%);hsl(150,100%,50%);hsl(270,80%,60%)" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="33%" stopColor="hsl(310, 70%, 55%)" stopOpacity="1">
              <animate attributeName="stop-color" values="hsl(310,70%,55%);hsl(25,95%,55%);hsl(210,100%,55%);hsl(150,100%,50%);hsl(270,80%,60%);hsl(310,70%,55%)" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="66%" stopColor="hsl(210, 100%, 55%)" stopOpacity="1">
              <animate attributeName="stop-color" values="hsl(210,100%,55%);hsl(150,100%,50%);hsl(270,80%,60%);hsl(310,70%,55%);hsl(25,95%,55%);hsl(210,100%,55%)" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="hsl(150, 100%, 50%)" stopOpacity="1">
              <animate attributeName="stop-color" values="hsl(150,100%,50%);hsl(270,80%,60%);hsl(310,70%,55%);hsl(25,95%,55%);hsl(210,100%,55%);hsl(150,100%,50%)" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="1"
          y="1"
          width="198"
          height="38"
          rx="19"
          ry="19"
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="1.5"
          filter="url(#glowFilter)"
          className="opacity-80"
        />
      </svg>

      {/* Outer glow */}
      <div className="absolute -inset-1 rounded-full opacity-30 blur-md bg-gradient-to-r from-[hsl(270,80%,60%)] via-[hsl(310,70%,55%)] to-[hsl(210,100%,55%)] animate-[gradient-rotate_4s_ease_infinite] bg-[length:200%_200%]" />

      {/* Inner content */}
      <div className="relative inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-background text-foreground font-medium text-[13px] border border-border/50">
        {children}
      </div>
    </div>
  );
};

export default AnimatedGlowingPill;
