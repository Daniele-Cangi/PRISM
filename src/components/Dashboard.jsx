import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle, Activity, Lock, Eye, BarChart3 } from 'lucide-react';

const Card = ({ children, className, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={clsx(
            "bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl relative overflow-hidden group hover:border-white/20 transition-colors",
            className
        )}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {children}
    </motion.div>
);

const Gauge = ({ value, label, subtext }) => {
    const rotation = (value / 100) * 180 - 90; // -90 to 90
    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <div className="w-48 h-24 overflow-hidden relative">
                <div className="w-48 h-48 rounded-full border-[12px] border-gray-800" />
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-48 h-48 rounded-full border-[12px] border-transparent border-t-neon-red absolute top-0 left-0"
                    style={{ transformOrigin: "50% 50%" }}
                />
            </div>
            <div className="text-4xl font-mono font-bold text-white mt-[-20px]">{value}%</div>
            <div className="text-xs text-neon-red uppercase tracking-widest mt-2">{label}</div>
            <div className="text-[10px] text-gray-500 mt-1">{subtext}</div>
        </div>
    );
};

export default function Dashboard() {
    return (
        <div className="w-full max-w-7xl mx-auto p-6 pb-24">

            {/* Dashboard Header */}
            <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-2xl text-white font-bold tracking-tight">ANALYSIS REPORT #882-X</h2>
                    <p className="text-gray-500 font-mono text-xs mt-1">SOURCE ORIGIN: UNVERIFIED // TIMESTAMP: {new Date().toISOString()}</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-900 border border-gray-700 text-xs text-gray-400 hover:text-white transition">EXPORT HTML</button>
                    <button className="px-3 py-1 bg-neon-red/10 border border-neon-red/50 text-xs text-neon-red hover:bg-neon-red hover:text-black transition">FLAGGED [3]</button>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 grid-rows-2 h-auto md:h-[600px]">

                {/* Card 1: Deception Meter (Large square) */}
                <Card className="col-span-1 md:col-span-1 row-span-1 flex flex-col items-center justify-center border-l-4 border-l-neon-red" delay={0.1}>
                    <h3 className="text-gray-400 text-xs font-mono uppercase absolute top-4 left-4">Deception Probability</h3>
                    <Gauge value={85} label="CRITICAL" subtext="Pattern mismatch detected" />
                </Card>

                {/* Card 2: Verdict (Top Center - Wide) */}
                <Card className="col-span-1 md:col-span-2 row-span-1 flex flex-col justify-center overflow-hidden" delay={0.2}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle className="w-32 h-32 text-neon-red" />
                    </div>
                    <h3 className="text-neon-red font-mono text-xs uppercase tracking-widest mb-2">FINAL VERDICT</h3>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        MANIPULATED
                    </h1>
                    <p className="text-gray-400 text-sm max-w-md">
                        The input text exhibits significant deviations from established factual baselines.
                        High-frequency emotional triggers detected. Recommendation: <span className="text-neon-red font-bold">DO NOT BROADCAST</span>.
                    </p>
                </Card>

                {/* Card 3: Key Stats (Top Right) */}
                <Card className="col-span-1 md:col-span-1 row-span-1 flex flex-col justify-between" delay={0.3}>
                    <h3 className="text-gray-400 text-xs font-mono uppercase">Scan Metrics</h3>
                    <div className="space-y-4 my-auto">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Sentiment Polarity</span>
                                <span className="text-red-400">-0.8 (Negative)</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full"><div className="h-full w-[80%] bg-red-500 rounded-full ml-auto"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Subjectivity</span>
                                <span className="text-yellow-400">92% (High)</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full"><div className="h-full w-[92%] bg-yellow-500 rounded-full"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Source Reliability</span>
                                <span className="text-green-400">12% (Low)</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full"><div className="h-full w-[12%] bg-green-500 rounded-full"></div></div>
                        </div>
                    </div>
                </Card>

                {/* Card 4: Forensic Breakdown (Bottom Full Width) */}
                <Card className="col-span-1 md:col-span-4 row-span-1 bg-gradient-to-b from-black to-gray-900/50" delay={0.4}>
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-cyber-green w-4 h-4" />
                        <h3 className="text-white font-mono text-sm uppercase">Forensic Breakdown</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Column 1 */}
                        <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-4 pb-2 border-b border-gray-800">
                                <CheckCircle className="w-3 h-3" /> Hard Facts (Verified)
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-cyber-green flex-shrink-0"></span> Event Timestamp: 2024-11-04 14:00 UTC</li>
                                <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-cyber-green flex-shrink-0"></span> Location: Sector 7, Grid 9</li>
                                <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-cyber-green flex-shrink-0"></span> Subject: Entity X-Ray</li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-4 pb-2 border-b border-gray-800">
                                <Lock className="w-3 h-3" /> Hidden Axioms (Inferred)
                            </h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0"></span> Implicit bias against Western interests</li>
                                <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0"></span> Presumption of guilt before trial</li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-4 pb-2 border-b border-gray-800">
                                <Eye className="w-3 h-3" /> Emotional Triggers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {['FEAR', 'URGENCY', 'BETRAYAL'].map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">#{tag}</span>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                                The text uses loaded language to evoke an immediate fear response, bypassing logical processing centers.
                            </p>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}
