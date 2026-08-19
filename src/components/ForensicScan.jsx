import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const scanLines = [
    "INITIALIZING FORENSIC PROTOCOLS...",
    "BYPASSING PROXY LAYERS... [SUCCESS]",
    "DECRYPTING TLS HANDSHAKE...",
    "ANALYZING SEMANTIC PATTERNS...",
    "CROSS-REFERENCING STATE AGENDAS...",
    "DETECTING EMOTIONAL MANIPULATION VECTORS...",
    "COMPILNG THREAT INDEX..."
];

export default function ForensicScan({ onComplete }) {
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Progress Bar Animation
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                // Random jumps for "hacking" feel
                return prev + Math.random() * 5;
            });
        }, 100);

        // Log Scrolling
        let logIndex = 0;
        const logTimer = setInterval(() => {
            if (logIndex < scanLines.length) {
                setLogs((prev) => [...prev, scanLines[logIndex]]);
                logIndex++;
            } else {
                clearInterval(logTimer);
            }
        }, 450); // Matches scan duration roughly

        // Completion trigger
        const finishTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearInterval(timer);
            clearInterval(logTimer);
            clearTimeout(finishTimer);
        };
    }, [onComplete]);

    return (
        <div className="w-full max-w-3xl mx-auto font-mono text-xs">
            {/* Progress Bar Top */}
            <div className="mb-4">
                <div className="flex justify-between text-cyber-green mb-1 uppercase tracking-widest">
                    <span>Decryption Progress</span>
                    <span>{Math.min(100, Math.floor(progress))}%</span>
                </div>
                <div className="h-1 w-full bg-gray-900 overflow-hidden relative">
                    <motion.div
                        className="h-full bg-cyber-green shadow-[0_0_10px_#00ff41]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Terminal Output */}
            <div className="h-48 overflow-hidden border border-cyber-green/30 bg-black/50 p-4 relative">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0.7px,transparent_0.7px)] bg-[length:4px_4px] opacity-10"></div>
                <div className="space-y-1">
                    {logs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-cyber-green/80 border-l-2 border-cyber-green pl-2"
                        >
                            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                            {log}
                        </motion.div>
                    ))}
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-cyber-green w-2 h-4 bg-cyber-green inline-block align-middle ml-1"
                    />
                </div>
            </div>

            {/* Grid Decryption Effect Overlay */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-[8px] text-gray-700 opacity-30 select-none">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="columns-2">
                        {Array.from({ length: 5 }).map((_, j) => (
                            <div key={j}>{Math.random().toString(36).substring(2)}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
