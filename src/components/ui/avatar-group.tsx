"use client"

import * as React from "react"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface AvatarGroupProps {
  avatars: { src: string; alt?: string; label?: string }[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
}

const AvatarGroup = ({
  avatars,
  maxVisible = 5,
  size = 40,
  overlap = 14,
}: AvatarGroupProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const visibleAvatars = avatars.slice(0, maxVisible);
  const extraCount = avatars.length - maxVisible;

  return (
    <div className="flex items-center">
      <div className="flex items-center" style={{ direction: "ltr" }}>
        {visibleAvatars.map((avatar, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <motion.div
              key={idx}
              className="relative"
              style={{
                width: size,
                height: size,
                marginLeft: idx === 0 ? 0 : -overlap,
                zIndex: isHovered ? 50 : visibleAvatars.length - idx,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <motion.img
                src={avatar.src}
                alt={avatar.alt || avatar.label || ""}
                className="rounded-full border-2 border-background bg-card object-contain p-2 shadow-sm"
                style={{ width: size, height: size }}
                animate={{ scale: isHovered ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <AnimatePresence>
                {isHovered && avatar.label && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-0.5 text-xs font-medium text-popover-foreground shadow-md border border-border"
                  >
                    {avatar.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {extraCount > 0 && (
          <div
            className="flex items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold text-muted-foreground"
            style={{
              width: size,
              height: size,
              marginLeft: -overlap,
              zIndex: 0,
            }}
          >
            +{extraCount}
          </div>
        )}
      </div>
    </div>
  );
};

export { AvatarGroup };
