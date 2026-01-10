import React from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const TrendingTicker = () => {
    const headlines = [
        "GLOBAL MONITOR ACTIVE: Scanning 142 sources across 12 sectors...",
        "DETECTED: High variance in North Atlantic narrative patterns...",
        "SYSTEM ALERT: Propaganda levels in Eastern Europe exceeded threshold 75%...",
        "ANALYSIS COMPLETE: Washington Post editorial flagged for specific framing...",
        "LIVE FEED: Ingesting real-time signals from Reuters, AP, and AFP..."
    ];

    return (
        <div className="bg-[#1A1A1A] text-white py-2 overflow-hidden flex items-center border-b border-[#DC2626]">
            <div className="px-4 flex items-center gap-2 z-10 bg-[#1A1A1A] shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-[#DC2626]">Live Intelligence</span>
            </div>

            <div className="flex overflow-hidden relative w-full mask-linear-fade">
                <motion.div
                    className="flex gap-16 whitespace-nowrap px-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {[...headlines, ...headlines].map((text, i) => ( // Duplicate for infinite loop
                        <div key={i} className="text-xs font-mono text-gray-400 flex items-center gap-2">
                            <Radio className="w-3 h-3 text-gray-600" />
                            {text}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TrendingTicker;
