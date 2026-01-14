import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Database, Radio } from 'lucide-react';
import ForensicScan from './ForensicScan';
import clsx from 'clsx';

export default function Hero({ onAnalyzeComplete }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const handleAnalyze = () => {
        if (!inputValue.trim()) return;
        setIsAnalyzing(true);
    };

    return (
        <div className="relative z-10 w-full max-w-4xl mx-auto pt-32 pb-12 flex flex-col items-center justify-center text-center">

            <AnimatePresence mode="wait">
                {!isAnalyzing ? (
                    <motion.div
                        key="input-stage"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        {/* Title / Hook */}
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2">
                            DECODE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-orange-600">NARRATIVE</span>
                        </h2>
                        <p className="text-gray-400 font-mono mb-12 max-w-lg mx-auto">
                            Advanced sentiment forensics and deception detection engine.
                            <br />Enter source intelligence below.
                        </p>

                        {/* Input Container */}
                        <div className="relative group w-full max-w-2xl mx-auto mb-8">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-red via-gray-500 to-cyber-green rounded-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                            <div className="relative flex bg-black rounded-lg border border-gray-800 p-2">
                                <div className="flex items-center justify-center pl-4 text-gray-500">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="INSERT SOURCE URL OR RAW INTELLIGENCE..."
                                    className="flex-1 bg-transparent text-white font-mono placeholder-gray-600 px-4 py-3 focus:outline-none uppercase"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                />
                                <button
                                    onClick={handleAnalyze}
                                    className={clsx(
                                        "px-6 py-2 rounded font-bold tracking-wider transition-all duration-300 transform",
                                        inputValue ? "bg-neon-red text-black hover:bg-red-500 hover:scale-105" : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    )}
                                    disabled={!inputValue}
                                >
                                    ANALYZE
                                </button>
                            </div>
                        </div>

                        {/* Quick Sources */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="text-xs font-mono text-gray-600 mr-2 mt-1">QUICK INJECT:</span>
                            {[
                                { label: 'REUTERS', icon: Globe },
                                { label: 'TWITTER / X', icon: Radio },
                                { label: 'DARK_WEB_DUMP', icon: Database },
                            ].map((source) => (
                                <button
                                    key={source.label}
                                    onClick={() => setInputValue(source.label === 'REUTERS' ? "https://reuters.com/article/example" : source.label === 'TWITTER / X' ? "https://x.com/user/status/123456789" : "MAGNET:?xt=urn:sha1:7f8a...")}
                                    className="flex items-center gap-1 px-3 py-1 rounded border border-gray-800 bg-gray-900/50 text-[10px] text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
                                >
                                    <source.icon className="w-3 h-3" />
                                    {source.label}
                                </button>
                            ))}
                        </div>

                    </motion.div>
                ) : (
                    <motion.div
                        key="scan-stage"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full"
                    >
                        <ForensicScan onComplete={onAnalyzeComplete} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
