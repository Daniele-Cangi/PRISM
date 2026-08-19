import { memo, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3";
import { motion } from "framer-motion";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";


const ISO_MAP = {
  "840": "US", "124": "CA", "484": "MX",
  "826": "GB", "276": "DE", "250": "FR",
  "380": "IT", "724": "ES", "528": "NL",
  "056": "BE", "752": "SE", "578": "NO",
  "616": "PL", "804": "UA", "643": "RU",
  "792": "TR", "208": "DK", "756": "CH",
  "233": "EE", "428": "LV", "440": "LT",
  "156": "CN", "392": "JP", "356": "IN",
  "410": "KR", "158": "TW", "036": "AU",
  "554": "NZ", "360": "ID", "376": "IL",
  "682": "SA", "784": "AE", "818": "EG",
  "076": "BR", "032": "AR", "170": "CO",
  "862": "VE", "710": "ZA", "566": "NG",
};

const WIDTH = 960;
const HEIGHT = 520;

function numericCountryId(value) {
  return String(value).padStart(3, "0");
}

const MapHUD = ({ onSelectCountry, isLoading }) => {
  const [hovered, setHovered] = useState(null);
  const paths = useMemo(() => {
    const countries = feature(
      world,
      world.objects.countries,
    ).features;
    const projection = geoMercator()
      .scale(145)
      .center([0, 20])
      .translate([WIDTH / 2, HEIGHT / 2]);
    const createPath = geoPath(projection);
    return countries.map((country) => {
      const id = numericCountryId(country.id);
      return {
        id,
        iso2: ISO_MAP[id],
        path: createPath(country),
      };
    });
  }, []);

  const selectCountry = (country) => {
    if (country.iso2) {
      onSelectCountry(country.iso2);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E5E5E5] bg-[#F5F5F5] shadow-sm touch-manipulation"
    >
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#DC2626] rounded-full animate-spin" />
            <span className="text-sm font-bold tracking-widest uppercase text-[#1A1A1A]">
              Acquiring Target...
            </span>
          </div>
        </div>
      )}

      <svg
        viewBox={["0 0", WIDTH, HEIGHT].join(" ")}
        className="relative w-full h-full"
        role="img"
        aria-label="Select a supported country to load its news feed"
      >
        {paths.map((country) => {
          const supported = Boolean(country.iso2);
          const active = hovered === country.id;
          return (
            <path
              key={country.id}
              d={country.path || ""}
              fill={
                supported
                  ? active
                    ? "#FEE2E2"
                    : "#D4D4D8"
                  : "#FFFFFF"
              }
              stroke={
                supported && active
                  ? "#DC2626"
                  : supported
                    ? "#737373"
                    : "#E5E5E5"
              }
              strokeWidth={
                supported && active ? 1.5 : 0.6
              }
              className={
                supported
                  ? "cursor-pointer transition-colors"
                  : ""
              }
              tabIndex={supported ? 0 : -1}
              aria-label={
                supported
                  ? "Load news for " + country.iso2
                  : undefined
              }
              onMouseEnter={() => {
                if (supported) setHovered(country.id);
              }}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => {
                if (supported) setHovered(country.id);
              }}
              onBlur={() => setHovered(null)}
              onClick={() => selectCountry(country)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                  || event.key === " "
                ) {
                  event.preventDefault();
                  selectCountry(country);
                }
              }}
            />
          );
        })}
      </svg>

      {hovered && (
        <div className="absolute bottom-4 left-4 px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl backdrop-blur-sm shadow-lg">
          <span className="text-xs font-semibold text-slate-500">
            Sector:{" "}
          </span>
          <span className="text-xs font-bold text-primary">
            {ISO_MAP[hovered]}
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/50" />
          Intel Available
        </div>
      </div>
    </motion.div>
  );
};

export default memo(MapHUD);
