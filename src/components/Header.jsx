import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-void-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 group cursor-pointer">
                    <ShieldAlert className="w-5 h-5 text-neon-red group-hover:rotate-12 transition-transform duration-300" />
                    <h1 className="font-mono font-bold text-lg tracking-widest text-gray-100 group-hover:text-neon-red transition-colors duration-300">
                        SHADOW<span className="text-neon-red">//</span>ANALYZER
                    </h1>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-mono tracking-widest">NETWORK STATUS</span>
                        <span className="text-xs font-bold text-cyber-green tracking-wider">SYSTEM: ARMED</span>
                    </div>
                    <div className="relative w-3 h-3 bg-cyber-green rounded-full shadow-[0_0_10px_#00ff41] animate-pulse">
                        <div className="absolute inset-0 bg-cyber-green rounded-full animate-ping opacity-75"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
