import React, { useState, memo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { motion } from "framer-motion";

// TopoJSON World Atlas (Natural Earth 110m)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Manual ISO mapping (Supports Alpha-3 and Numeric codes from world-atlas)
const ISO_MAP = {
    // Alpha-3 (Just in case)
    "ITA": "IT", "USA": "US", "GBR": "GB", "DEU": "DE", "FRA": "FR",
    "RUS": "RU", "UKR": "UA", "CHN": "CN", "JPN": "JP", "IND": "IN",
    "BRA": "BR", "ISR": "IL", "IRN": "IR", "SAU": "SA", "AUS": "AU", "KOR": "KR",
    // Numeric (Standard world-atlas)
    "380": "IT", "840": "US", "826": "GB", "276": "DE", "250": "FR",
    "643": "RU", "804": "UA", "156": "CN", "392": "JP", "356": "IN",
    "076": "BR", "376": "IL", "364": "IR", "682": "SA", "036": "AU", "410": "KR"
};

const MapHUD = ({ onSelectCountry, isLoading }) => {
    const [hovered, setHovered] = useState(null);

    const handleClick = (geo) => {
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
            className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm"
        >
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(79, 70, 229, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 70, 229, 0.5) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Loading Overlay - Premium */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/95 z-20 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-primary">Scanning sector...</span>
                    </div>
                </div>
            )}

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 140, center: [10, 30] }}
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
                                        onClick={() => handleClick(geo)}
                                        style={{
                                            default: {
                                                fill: isSupported ? "#e2e8f0" : "#f8fafc",
                                                stroke: "#cbd5e1",
                                                strokeWidth: 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default"
                                            },
                                            hover: {
                                                fill: isSupported ? "#6366f1" : "#e2e8f0",
                                                stroke: isSupported ? "#818cf8" : "#cbd5e1",
                                                strokeWidth: isSupported ? 1.5 : 0.5,
                                                outline: "none",
                                                cursor: isSupported ? "pointer" : "default"
                                            },
                                            pressed: {
                                                fill: "#4f46e5",
                                                outline: "none",
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
