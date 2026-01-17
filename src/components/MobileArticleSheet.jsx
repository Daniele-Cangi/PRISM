import React, { useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { X, Target, Clock, ExternalLink, ChevronUp, Loader, GripHorizontal } from "lucide-react";

/**
 * Mobile Bottom Sheet for Article Selection
 * Slides up when a country is selected on mobile
 */
const MobileArticleSheet = ({
    isOpen,
    onClose,
    data,
    sectorName,
    onAnalyze,
    analyzingId,
    isLoading
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const dragControls = useDragControls();

    const sheetVariants = {
        hidden: { y: "100%" },
        collapsed: { y: "calc(100% - 180px)" },
        expanded: { y: 0 }
    };

    const currentVariant = !isOpen ? "hidden" : (isExpanded ? "expanded" : "collapsed");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsExpanded(false)}
                            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                        />
                    )}

                    {/* Bottom Sheet */}
                    <motion.div
                        initial="hidden"
                        animate={currentVariant}
                        exit="hidden"
                        variants={sheetVariants}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) {
                                if (isExpanded) {
                                    setIsExpanded(false);
                                } else {
                                    onClose();
                                }
                            } else if (info.offset.y < -50) {
                                setIsExpanded(true);
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 lg:hidden overflow-hidden"
                        style={{
                            height: isExpanded ? "85vh" : "auto",
                            maxHeight: "85vh",
                            touchAction: "none"
                        }}
                    >
                        {/* Drag Handle */}
                        <div
                            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-5 pb-4 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#DC2626]/10 rounded-xl">
                                        <Target className="w-5 h-5 text-[#DC2626]" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1A1A1A] font-serif">
                                            {sectorName || "Select Country"}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {data?.length || 0} articles available
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
                                    >
                                        <ChevronUp className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors touch-manipulation"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div
                            className="overflow-y-auto overscroll-contain"
                            style={{
                                height: isExpanded ? "calc(85vh - 100px)" : "auto",
                                maxHeight: isExpanded ? "calc(85vh - 100px)" : "300px"
                            }}
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader className="w-10 h-10 text-[#DC2626] animate-spin mb-3" />
                                    <p className="text-sm text-slate-500">Loading articles...</p>
                                </div>
                            ) : !data || data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                                        <Target className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-base font-semibold text-slate-600 mb-1">
                                        No articles found
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Try selecting a different country
                                    </p>
                                </div>
                            ) : (
                                <div className="px-4 py-3 space-y-3">
                                    {data.map((item, index) => (
                                        <motion.div
                                            key={item.id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-slate-50 rounded-2xl p-4 active:bg-slate-100 transition-colors"
                                        >
                                            {/* Source & Time */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
                                                    {item.source}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {item.published?.split(',')[0] || 'Recent'}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h4 className="text-base font-serif font-medium text-[#1A1A1A] leading-snug mb-4">
                                                {item.title}
                                            </h4>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => onAnalyze(item)}
                                                    disabled={analyzingId === item.id}
                                                    className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all touch-manipulation ${
                                                        analyzingId === item.id
                                                            ? 'bg-slate-200 text-slate-400'
                                                            : 'bg-[#DC2626] text-white active:bg-[#b91c1c]'
                                                    }`}
                                                >
                                                    {analyzingId === item.id ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                            Analyzing...
                                                        </span>
                                                    ) : (
                                                        'Analyze Bias'
                                                    )}
                                                </button>
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3.5 bg-slate-200 rounded-xl text-slate-600 active:bg-slate-300 transition-colors touch-manipulation"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileArticleSheet;
