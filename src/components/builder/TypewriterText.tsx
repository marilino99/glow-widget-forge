import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  wordPause?: number;
  pauseDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TypewriterText = ({
  text,
  speed = 80,
  wordPause = 200,
  pauseDuration = 2000,
  className,
  style,
}: TypewriterTextProps) => {
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCharIndex(0);
    setIsPaused(false);
  }, [text]);

  useEffect(() => {
    if (isPaused) {
      timerRef.current = setTimeout(() => {
        setCharIndex(0);
        setIsPaused(false);
      }, pauseDuration);
    } else {
      if (charIndex < text.length) {
        const currentChar = text[charIndex];
        const delay = currentChar === ' ' ? wordPause : speed;
        timerRef.current = setTimeout(() => {
          setCharIndex((i) => i + 1);
        }, delay);
      } else {
        setIsPaused(true);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [charIndex, isPaused, text, speed, pauseDuration]);

  return (
    <span className={className} style={style}>
      {text.slice(0, charIndex)}
      {!isPaused && (
        <span className="animate-pulse opacity-80">|</span>
      )}
    </span>
  );
};

export default TypewriterText;
