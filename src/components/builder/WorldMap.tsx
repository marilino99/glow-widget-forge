import React, { useMemo, useState, useRef, useCallback } from "react";
import SvgWorldMap, { type CountryContext } from "react-svg-worldmap";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapProps {
  countryData: CountryData[];
}

const COUNTRY_NAME_TO_ID: Record<string, string> = {
  "United States": "us",
  "United States of America": "us",
  "United Kingdom": "gb",
  Germany: "de",
  France: "fr",
  Italy: "it",
  Spain: "es",
  Portugal: "pt",
  Netherlands: "nl",
  Belgium: "be",
  Switzerland: "ch",
  Austria: "at",
  Poland: "pl",
  Sweden: "se",
  Norway: "no",
  Finland: "fi",
  Denmark: "dk",
  Ireland: "ie",
  "Czech Republic": "cz",
  Czechia: "cz",
  Romania: "ro",
  Hungary: "hu",
  Greece: "gr",
  Turkey: "tr",
  Ukraine: "ua",
  Russia: "ru",
  Canada: "ca",
  Mexico: "mx",
  Brazil: "br",
  Argentina: "ar",
  Colombia: "co",
  Chile: "cl",
  Peru: "pe",
  Venezuela: "ve",
  India: "in",
  China: "cn",
  Japan: "jp",
  "South Korea": "kr",
  Australia: "au",
  "New Zealand": "nz",
  Indonesia: "id",
  Thailand: "th",
  Vietnam: "vn",
  Philippines: "ph",
  Malaysia: "my",
  Singapore: "sg",
  "Saudi Arabia": "sa",
  "United Arab Emirates": "ae",
  Israel: "il",
  Egypt: "eg",
  "South Africa": "za",
  Nigeria: "ng",
  Kenya: "ke",
  Morocco: "ma",
  Pakistan: "pk",
  Bangladesh: "bd",
  Taiwan: "tw",
  Iran: "ir",
  Iraq: "iq",
  Algeria: "dz",
  Libya: "ly",
  Sudan: "sd",
  Ethiopia: "et",
  Tanzania: "tz",
  Congo: "cd",
  Angola: "ao",
  Mozambique: "mz",
  Madagascar: "mg",
  Kazakhstan: "kz",
  Mongolia: "mn",
  Myanmar: "mm",
};

const WorldMap: React.FC<WorldMapProps> = ({ countryData }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });

  const mapData = useMemo(() => {
    const totalsByCountry = new Map<string, number>();
    for (const { country, count } of countryData) {
      const code = COUNTRY_NAME_TO_ID[country.trim()];
      if (!code || count <= 0) continue;
      totalsByCountry.set(code, (totalsByCountry.get(code) ?? 0) + count);
    }
    return Array.from(totalsByCountry.entries()).map(([country, value]) => ({
      country,
      value,
    }));
  }, [countryData]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.4, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s / 1.4, 1);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((s) => Math.min(s * 1.15, 5));
    } else {
      setScale((s) => {
        const next = Math.max(s / 1.15, 1);
        if (next === 1) setTranslate({ x: 0, y: 0 });
        return next;
      });
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return;
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [scale, translate]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    setTranslate({
      x: translateStart.current.x + (e.clientX - panStart.current.x),
      y: translateStart.current.y + (e.clientY - panStart.current.y),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const styleFunction = ({
    countryValue,
    minValue,
    maxValue,
    color,
  }: CountryContext): React.CSSProperties => {
    const hasValue = typeof countryValue === "number" && countryValue > 0;
    if (!hasValue) {
      return { fill: "#d1d5db", stroke: "#e5e7eb", strokeWidth: 0.5, cursor: scale > 1 ? "grab" : "default" };
    }
    const safeRange = Math.max(1, (maxValue ?? 0) - (minValue ?? 0));
    const normalized = ((countryValue ?? 0) - (minValue ?? 0)) / safeRange;
    const opacity = 0.28 + normalized * 0.72;
    return {
      fill: color,
      fillOpacity: opacity,
      stroke: "hsl(var(--border))",
      strokeWidth: 0.6,
      cursor: scale > 1 ? "grab" : "default",
    };
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-1 right-1 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
          onClick={zoomIn}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
          onClick={zoomOut}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        {scale > 1 && (
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md bg-background/80 backdrop-blur-sm"
            onClick={reset}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div
        className="w-full overflow-hidden [&_figure]:!m-0 [&_figure]:!p-0 [&_svg]:!block"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: scale > 1 ? "grab" : "default" }}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanning.current ? "none" : "transform 0.2s ease-out",
          }}
        >
          <SvgWorldMap
            data={mapData}
            size="responsive"
            color="#818cf8"
            backgroundColor="transparent"
            borderColor="#e5e7eb"
            strokeOpacity={0.6}
            frame={false}
            styleFunction={styleFunction}
            tooltipBgColor="#1f2937"
            tooltipTextColor="#f9fafb"
            tooltipTextFunction={({ countryName, countryValue, countryCode }) => {
              if (!countryValue || countryValue <= 0) return countryName;
              const flag = countryCode
                ? String.fromCodePoint(...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)))
                : "";
              return `${flag} ${countryName} — ${countryValue} chat${countryValue > 1 ? "s" : ""}`;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
