import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Target, Clock } from "lucide-react";

const IntelFeed = ({ data, sectorName, onAnalyze, analyzingId }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                    <div className="p-4 bg-slate-100 rounded-full inline-flex mx-auto">
                        <Target className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Select a sector</p>
                    <p className="text-xs text-slate-400">Click on a country to view available targets</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-[45vh] md:max-h-[55vh] lg:max-h-[65vh] overflow-y-auto pr-2 editorial-theme">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-[#E5E5E5] z-10">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Target className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-[#1A1A1A] font-serif uppercase tracking-wider">{sectorName}</span>
                    <span className="text-xs text-[#666666] font-semibold ml-auto bg-gray-100 px-2 py-1 rounded-md font-sans">{data.length}</span>
                </div>
            </div>

            {data.map((item, index) => (
                <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white border border-[#E5E5E5] p-6 hover:border-[#DC2626] transition-all duration-300"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest font-sans">
                                    {item.source}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-[#666666] font-medium uppercase tracking-wider font-sans">
                                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                                    {item.published?.split(',')[0] || 'Recent'}
                                </span>
                            </div>
                            <h4 className="text-lg font-serif font-medium text-[#1A1A1A] leading-snug group-hover:text-[#DC2626] transition-colors">
                                {item.title}
                            </h4>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] mt-2">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#666666] hover:text-[#DC2626] active:text-[#DC2626] uppercase tracking-wider font-sans flex items-center gap-1 transition-colors touch-manipulation"
                            >
                                Read Source <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                            </a>
                            <button
                                onClick={() => onAnalyze(item)}
                                disabled={analyzingId === item.id}
                                className={`editorial-button text-xs py-2.5 md:py-2 px-5 md:px-4 touch-manipulation ${analyzingId === item.id ? 'opacity-50 cursor-not-allowed' : 'editorial-button-accent'}`}
                            >
                                {analyzingId === item.id ? 'Analyzing...' : 'Analyze Bias'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default IntelFeed;
