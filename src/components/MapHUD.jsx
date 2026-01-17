import React, { useState, memo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { motion } from "framer-motion";

// TopoJSON World Atlas (Natural Earth 110m)
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Manual ISO mapping (Supports Alpha-3 and Numeric codes from world-atlas)
// Manual ISO mapping (Supports Alpha-3 and Numeric codes from world-atlas)
const ISO_MAP = {
    // NORTH AMERICA
    "USA": "US", "CAN": "CA", "MEX": "MX",
    "840": "US", "124": "CA", "484": "MX",

    // EUROPE
    "GBR": "GB", "DEU": "DE", "FRA": "FR", "ITA": "IT", "ESP": "ES", "NLD": "NL",
    "BEL": "BE", "SWE": "SE", "NOR": "NO", "POL": "PL", "UKR": "UA", "RUS": "RU", "TUR": "TR",
    "DNK": "DK", "CHE": "CH", "EST": "EE", "LVA": "LV", "LTU": "LT",
    "826": "GB", "276": "DE", "250": "FR", "380": "IT", "724": "ES", "528": "NL",
    "056": "BE", "752": "SE", "578": "NO", "616": "PL", "804": "UA", "643": "RU", "792": "TR",
    "208": "DK", "756": "CH", "233": "EE", "428": "LV", "440": "LT",

    // ASIA / PACIFIC
    "CHN": "CN", "JPN": "JP", "IND": "IN", "KOR": "KR", "TWN": "TW", "AUS": "AU", "NZL": "NZ", "IDN": "ID",
    "156": "CN", "392": "JP", "356": "IN", "410": "KR", "158": "TW", "036": "AU", "554": "NZ", "360": "ID",

    // MIDDLE EAST
    "ISR": "IL", "SAU": "SA", "ARE": "AE", "EGY": "EG",
    "376": "IL", "682": "SA", "784": "AE", "818": "EG",

    // LATIN AMERICA
    "BRA": "BR", "ARG": "AR", "COL": "CO", "VEN": "VE",
    "076": "BR", "032": "AR", "170": "CO", "862": "VE",

    // AFRICA
    "ZAF": "ZA", "NGA": "NG",
    "710": "ZA", "566": "NG"
};

const MapHUD = ({ onSelectCountry, isLoading }) => {
    const [hovered, setHovered] = useState(null);

    const handleClick = (geo, event) => {
        // Prevent default touch behavior
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Debug: Log what we clicked
        console.log("Geo Clicked:", geo.id, geo.properties);

        const isoKey = geo.id || geo.properties.ISO_A3;
        const iso2 = ISO_MAP[isoKey];

        if (iso2) {
            console.log("Mapped to Sector:", iso2);
            onSelectCountry(iso2);
        } else {
            console.warn("Sector Unmapped:", isoKey);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E5E5E5] bg-[#F5F5F5] shadow-sm touch-manipulation"
        >
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Loading Overlay - Editorial */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#DC2626] rounded-full animate-spin"></div>
                        <span className="text-sm font-bold tracking-widest uppercase text-[#1A1A1A]">Acquiring Target...</span>
                    </div>
                </div>
            )}

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 140, center: [0, 20] }}
                className="w-full h-full"
            >
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Determine ID (Numeric or Alpha-3)
                                const geoId = geo.id || geo.properties?.ISO_A3;
                                const isSupported = ISO_MAP[geoId];
                                const isHovered = hovered === geo.rsmKey;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => setHovered(geo.rsmKey)}
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={(event) => handleClick(geo, event)}
                                        tabIndex={isSupported ? 0 : -1}
                                        style={{
                                            default: {
                                                fill: isSupported ? "#D4D4D8" : "#FFFFFF",
                                                stroke: isSupported ? "#737373" : "#E5E5E5",
                                                strokeWidth: isSupported ? 0.75 : 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default",
                                                touchAction: "manipulation"
                                            },
                                            hover: {
                                                fill: isSupported ? "#FEE2E2" : "#FFFFFF",
                                                stroke: isSupported ? "#DC2626" : "#E5E5E5",
                                                strokeWidth: isSupported ? 1.5 : 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default",
                                                touchAction: "manipulation"
                                            },
                                            pressed: {
                                                fill: "#FCA5A5",
                                                stroke: "#DC2626",
                                                outline: "none",
                                                touchAction: "manipulation"
                                            },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Dynamic Label - Premium */}
            {hovered && (
                <div className="absolute bottom-4 left-4 px-4 py-2.5 bg-white/95 border border-slate-200 rounded-xl backdrop-blur-sm shadow-lg">
                    <span className="text-xs font-semibold text-slate-500">Hovering: </span>
                    <span className="text-xs font-bold text-primary">
                        Active
                    </span>
                </div>
            )}

            {/* Legend - Premium */}
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
