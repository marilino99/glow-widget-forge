import React, { useMemo } from "react";
import SvgWorldMap, { type CountryContext } from "react-svg-worldmap";

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

  const styleFunction = ({ countryValue, minValue, maxValue, color }: CountryContext): React.CSSProperties => {
    const hasValue = typeof countryValue === "number" && countryValue > 0;

    if (!hasValue) {
      return {
        fill: "hsl(var(--muted) / 0.35)",
        stroke: "hsl(var(--border))",
        strokeWidth: 0.6,
        cursor: "default",
      };
    }

    const safeRange = Math.max(1, (maxValue ?? 0) - (minValue ?? 0));
    const normalized = ((countryValue ?? 0) - (minValue ?? 0)) / safeRange;
    const opacity = 0.28 + normalized * 0.72;

    return {
      fill: color,
      fillOpacity: opacity,
      stroke: "hsl(var(--border))",
      strokeWidth: 0.6,
      cursor: "default",
    };
  };

  return (
    <div className="w-full" style={{ maxHeight: 260 }}>
      <SvgWorldMap
        data={mapData}
        size="responsive"
        color="hsl(var(--primary))"
        styleFunction={styleFunction}
        tooltipBgColor="hsl(var(--popover))"
        tooltipTextColor="hsl(var(--popover-foreground))"
        tooltipTextFunction={({ countryName, countryValue }) =>
          countryValue && countryValue > 0 ? `${countryName}: ${countryValue} chat` : countryName
        }
      />
    </div>
  );
};

export default WorldMap;
