import { useState, useRef, useCallback, useEffect } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }

  return [h, s, v];
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [59, 130, 246]; // Default blue
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [rgb] = useState(() => hexToRgb(color));
  const [hsv, setHsv] = useState(() => rgbToHsv(...rgb));
  
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [isDraggingSatVal, setIsDraggingSatVal] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Update HSV when color prop changes
  useEffect(() => {
    const newRgb = hexToRgb(color);
    const newHsv = rgbToHsv(...newRgb);
    setHsv(newHsv);
  }, [color]);

  const updateColor = useCallback((h: number, s: number, v: number) => {
    setHsv([h, s, v]);
    const [r, g, b] = hsvToRgb(h, s, v);
    onChange(rgbToHex(r, g, b));
  }, [onChange]);

  const handleSatValMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor(hsv[0], x, 1 - y);
  }, [hsv, updateColor]);

  const handleHueMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor(x * 360, hsv[1], hsv[2]);
  }, [hsv, updateColor]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSatVal) handleSatValMove(e);
      if (isDraggingHue) handleHueMove(e);
    };
    const handleMouseUp = () => {
      setIsDraggingSatVal(false);
      setIsDraggingHue(false);
    };

    if (isDraggingSatVal || isDraggingHue) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSatVal, isDraggingHue, handleSatValMove, handleHueMove]);

  const currentRgb = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  const hueColor = rgbToHex(...hsvToRgb(hsv[0], 1, 1));
  const selectedColor = rgbToHex(...currentRgb);

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* Saturation/Value gradient square */}
      <div
        ref={satValRef}
        className="relative h-40 w-full cursor-crosshair rounded-lg"
        style={{
          background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${hueColor})`
        }}
        onMouseDown={(e) => {
          setIsDraggingSatVal(true);
          handleSatValMove(e);
        }}
      >
        {/* Picker indicator */}
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${hsv[1] * 100}%`,
            top: `${(1 - hsv[2]) * 100}%`,
            backgroundColor: selectedColor
          }}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="h-10 w-10 shrink-0 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Hue slider */}
        <div
          ref={hueRef}
          className="relative h-3 flex-1 cursor-pointer rounded-full"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}
          onMouseDown={(e) => {
            setIsDraggingHue(true);
            handleHueMove(e);
          }}
        >
          {/* Hue indicator */}
          <div
            className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
            style={{
              left: `${(hsv[0] / 360) * 100}%`,
              backgroundColor: hueColor
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
