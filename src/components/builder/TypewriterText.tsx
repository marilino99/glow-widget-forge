import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  wordPause?: number;
  pauseDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TypewriterText = ({
  texts,
  speed = 80,
  wordPause = 200,
  pauseDuration = 2000,
  className,
  style,
}: TypewriterTextProps) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentText = texts[textIndex] || "";

  useEffect(() => {
    setTextIndex(0);
    setCharIndex(0);
    setIsPaused(false);
  }, [texts.join("||")]);

  useEffect(() => {
    if (isPaused) {
      timerRef.current = setTimeout(() => {
        setTextIndex((i) => (i + 1) % texts.length);
        setCharIndex(0);
        setIsPaused(false);
      }, pauseDuration);
    } else {
      if (charIndex < currentText.length) {
        const char = currentText[charIndex];
        const delay = char === " " ? wordPause : speed;
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
  }, [charIndex, isPaused, currentText, texts.length, speed, wordPause, pauseDuration]);

  return (
    <span className={className} style={style}>
      {currentText.slice(0, charIndex)}
      {!isPaused && (
        <span className="animate-pulse opacity-80">|</span>
      )}
    </span>
  );
};

export default TypewriterText;
