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
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-100 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                        <Target className="w-4 h-4 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{sectorName}</span>
                    <span className="text-xs text-slate-500 font-semibold ml-auto bg-slate-100 px-2 py-1 rounded-md">{data.length}</span>
                </div>
            </div>

            {data.map((item, index) => (
                <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-slate-50 border border-slate-100 p-4 rounded-xl hover:border-indigo-200 hover:bg-white transition-all duration-200"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-2.5">
                                <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-0.5 rounded">
                                    {item.source}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                                    {item.published?.split(',')[0] || 'Recent'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => onAnalyze(item)}
                                disabled={analyzingId === item.id}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
                  ${analyzingId === item.id
                                        ? 'bg-indigo-100 text-primary cursor-wait'
                                        : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-md hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                                    }`}
                            >
                                {analyzingId === item.id ? 'Analyzing...' : 'Analyze'}
                            </button>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100"
                            >
                                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default IntelFeed;
