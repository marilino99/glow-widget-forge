import React from "react";

interface CountryData {
  country: string;
  count: number;
}

interface WorldMapProps {
  countryData: CountryData[];
}

// Mapping from country names (as stored in DB via ipapi.co) to SVG path IDs
const COUNTRY_NAME_TO_ID: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  "Germany": "DE",
  "France": "FR",
  "Italy": "IT",
  "Spain": "ES",
  "Portugal": "PT",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Switzerland": "CH",
  "Austria": "AT",
  "Poland": "PL",
  "Sweden": "SE",
  "Norway": "NO",
  "Finland": "FI",
  "Denmark": "DK",
  "Ireland": "IE",
  "Czech Republic": "CZ",
  "Czechia": "CZ",
  "Romania": "RO",
  "Hungary": "HU",
  "Greece": "GR",
  "Turkey": "TR",
  "Ukraine": "UA",
  "Russia": "RU",
  "Canada": "CA",
  "Mexico": "MX",
  "Brazil": "BR",
  "Argentina": "AR",
  "Colombia": "CO",
  "Chile": "CL",
  "Peru": "PE",
  "Venezuela": "VE",
  "India": "IN",
  "China": "CN",
  "Japan": "JP",
  "South Korea": "KR",
  "Australia": "AU",
  "New Zealand": "NZ",
  "Indonesia": "ID",
  "Thailand": "TH",
  "Vietnam": "VN",
  "Philippines": "PH",
  "Malaysia": "MY",
  "Singapore": "SG",
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
  "Israel": "IL",
  "Egypt": "EG",
  "South Africa": "ZA",
  "Nigeria": "NG",
  "Kenya": "KE",
  "Morocco": "MA",
  "Pakistan": "PK",
  "Bangladesh": "BD",
  "Taiwan": "TW",
  "Iran": "IR",
  "Iraq": "IQ",
  "Algeria": "DZ",
  "Libya": "LY",
  "Sudan": "SD",
  "Ethiopia": "ET",
  "Tanzania": "TZ",
  "Congo": "CD",
  "Angola": "AO",
  "Mozambique": "MZ",
  "Madagascar": "MG",
  "Kazakhstan": "KZ",
  "Mongolia": "MN",
  "Myanmar": "MM",
};

// Simplified world map paths — major countries as individual paths
const COUNTRY_PATHS: Record<string, string> = {
  US: "M 30 135 L 35 130 L 55 128 L 70 130 L 80 135 L 85 140 L 80 148 L 70 150 L 55 152 L 40 150 L 30 145 Z M 12 120 L 20 115 L 28 118 L 30 125 L 25 130 L 15 128 Z",
  CA: "M 25 95 L 35 85 L 55 80 L 75 82 L 90 88 L 95 100 L 85 115 L 70 120 L 50 122 L 35 118 L 25 110 Z",
  MX: "M 35 155 L 45 150 L 55 155 L 60 165 L 55 175 L 45 178 L 38 170 Z",
  BR: "M 115 200 L 130 185 L 145 190 L 150 205 L 145 225 L 135 240 L 120 238 L 110 225 L 108 210 Z",
  AR: "M 110 245 L 120 240 L 128 250 L 125 270 L 118 285 L 110 280 L 108 260 Z",
  CO: "M 95 180 L 105 175 L 115 180 L 112 192 L 100 195 Z",
  CL: "M 105 250 L 110 245 L 112 260 L 110 280 L 105 290 L 102 275 Z",
  PE: "M 90 195 L 100 190 L 108 200 L 105 215 L 95 218 Z",
  VE: "M 100 172 L 112 168 L 118 175 L 112 182 L 102 180 Z",
  GB: "M 190 100 L 193 95 L 197 97 L 196 105 L 192 107 Z",
  IE: "M 185 100 L 189 97 L 191 102 L 188 105 Z",
  FR: "M 192 115 L 200 110 L 207 115 L 205 125 L 195 125 Z",
  ES: "M 185 125 L 195 122 L 200 128 L 195 135 L 185 133 Z",
  PT: "M 182 126 L 185 124 L 186 132 L 183 134 Z",
  DE: "M 200 105 L 210 100 L 215 108 L 210 115 L 202 112 Z",
  IT: "M 205 120 L 210 118 L 215 125 L 212 135 L 207 138 L 205 130 Z",
  NL: "M 198 102 L 203 100 L 205 105 L 200 106 Z",
  BE: "M 196 108 L 201 106 L 203 110 L 198 111 Z",
  CH: "M 202 114 L 207 112 L 208 116 L 203 117 Z",
  AT: "M 208 112 L 215 110 L 217 114 L 210 116 Z",
  PL: "M 212 100 L 222 98 L 225 105 L 218 108 L 212 106 Z",
  SE: "M 208 80 L 212 72 L 216 78 L 214 90 L 210 92 Z",
  NO: "M 202 78 L 208 70 L 212 75 L 210 88 L 205 90 Z",
  FI: "M 215 72 L 222 68 L 225 78 L 220 85 L 216 80 Z",
  DK: "M 204 96 L 208 94 L 210 98 L 206 99 Z",
  CZ: "M 210 107 L 216 105 L 218 109 L 212 110 Z",
  RO: "M 220 112 L 228 110 L 230 116 L 223 118 Z",
  HU: "M 215 112 L 222 110 L 224 115 L 217 116 Z",
  GR: "M 220 125 L 226 122 L 228 130 L 222 132 Z",
  UA: "M 225 100 L 240 98 L 242 108 L 230 110 L 225 106 Z",
  RU: "M 240 60 L 300 50 L 340 65 L 350 85 L 330 95 L 290 100 L 260 98 L 245 90 L 240 75 Z",
  TR: "M 230 120 L 248 118 L 252 124 L 238 128 L 230 125 Z",
  SA: "M 245 145 L 255 140 L 262 148 L 258 158 L 248 160 L 242 152 Z",
  AE: "M 260 152 L 265 150 L 267 155 L 262 157 Z",
  IL: "M 238 135 L 240 132 L 242 138 L 239 140 Z",
  IR: "M 255 125 L 268 122 L 272 132 L 265 140 L 255 138 Z",
  IQ: "M 248 125 L 256 122 L 258 132 L 252 136 L 246 132 Z",
  EG: "M 225 140 L 235 138 L 238 148 L 232 155 L 225 150 Z",
  MA: "M 182 138 L 192 135 L 195 142 L 188 148 L 182 145 Z",
  DZ: "M 192 135 L 205 132 L 210 142 L 205 152 L 192 148 Z",
  LY: "M 208 138 L 220 135 L 225 145 L 220 155 L 208 152 Z",
  SD: "M 225 155 L 238 152 L 240 165 L 232 170 L 225 165 Z",
  ET: "M 240 165 L 250 162 L 252 172 L 245 178 L 238 172 Z",
  NG: "M 200 170 L 210 168 L 212 178 L 205 182 L 198 178 Z",
  KE: "M 245 178 L 252 175 L 255 185 L 248 190 L 243 185 Z",
  TZ: "M 242 190 L 250 188 L 253 198 L 246 202 L 240 196 Z",
  ZA: "M 222 230 L 235 225 L 240 235 L 235 245 L 222 242 Z",
  AO: "M 210 205 L 220 202 L 222 215 L 215 218 L 208 212 Z",
  MZ: "M 238 215 L 245 212 L 248 225 L 242 230 L 236 222 Z",
  CD: "M 218 190 L 230 188 L 235 200 L 228 208 L 218 205 Z",
  MG: "M 250 215 L 255 210 L 258 225 L 253 230 L 248 222 Z",
  IN: "M 275 135 L 288 128 L 295 140 L 290 160 L 280 168 L 272 155 Z",
  PK: "M 268 125 L 278 120 L 282 130 L 276 138 L 268 135 Z",
  BD: "M 290 148 L 295 145 L 298 152 L 293 155 Z",
  CN: "M 295 95 L 325 88 L 340 100 L 335 120 L 315 128 L 298 125 L 290 112 Z",
  JP: "M 340 110 L 345 105 L 348 112 L 345 122 L 340 118 Z",
  KR: "M 332 115 L 336 112 L 338 118 L 334 120 Z",
  TW: "M 330 135 L 333 132 L 335 138 L 332 140 Z",
  MN: "M 300 88 L 320 85 L 325 92 L 310 95 L 300 93 Z",
  KZ: "M 255 88 L 280 82 L 290 90 L 278 98 L 260 96 Z",
  TH: "M 305 155 L 310 150 L 314 158 L 310 168 L 305 165 Z",
  VN: "M 312 148 L 318 142 L 322 152 L 318 165 L 312 160 Z",
  MY: "M 310 175 L 318 172 L 322 178 L 315 180 Z",
  ID: "M 310 185 L 325 182 L 340 188 L 335 195 L 318 196 L 308 192 Z",
  PH: "M 328 155 L 332 150 L 336 158 L 332 165 L 328 162 Z",
  MM: "M 298 145 L 304 140 L 308 150 L 304 160 L 298 155 Z",
  SG: "M 315 180 L 317 179 L 318 182 L 316 183 Z",
  AU: "M 310 220 L 340 210 L 358 218 L 360 238 L 345 250 L 320 248 L 308 235 Z",
  NZ: "M 365 248 L 370 245 L 372 255 L 368 260 L 365 255 Z",
};

const WorldMap: React.FC<WorldMapProps> = ({ countryData }) => {
  const maxCount = countryData.length > 0 ? countryData[0].count : 0;

  // Build a map from path ID to opacity
  const countryOpacity: Record<string, number> = {};
  countryData.forEach(({ country, count }) => {
    const id = COUNTRY_NAME_TO_ID[country];
    if (id && maxCount > 0) {
      countryOpacity[id] = 0.2 + (count / maxCount) * 0.8;
    }
  });

  return (
    <svg
      viewBox="0 30 380 270"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxHeight: 220 }}
    >
      {/* Background land mass hint */}
      <rect x="0" y="30" width="380" height="270" fill="transparent" />

      {Object.entries(COUNTRY_PATHS).map(([id, d]) => {
        const opacity = countryOpacity[id];
        return (
          <path
            key={id}
            d={d}
            fill={opacity ? `rgba(129,140,248,${opacity})` : "#f0f0f3"}
            stroke="#e0e0e5"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
};

export default WorldMap;
