import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X } from 'lucide-react';
import useAnalysisStore from '../store/analysisStore';
import { THEMES, getThemesByCategory } from '../themes';

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useAnalysisStore();

  const currentThemeData = THEMES[currentTheme];
  const themesByCategory = getThemesByCategory();

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button - Fixed Top Left */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl shadow-lg hover:border-slate-300 hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-5 h-5 text-slate-700" strokeWidth={2} />
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold text-slate-500">Theme</span>
          <span className="text-sm font-bold text-slate-900">{currentThemeData?.name}</span>
        </div>
      </motion.button>

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-20 left-4 right-4 sm:left-auto sm:right-auto sm:w-[600px] bg-white rounded-2xl shadow-2xl z-[70] max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Choose Theme</h2>
                  <p className="text-sm text-slate-600 mt-1">Select your preferred visual style</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Theme Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {Object.entries(themesByCategory).map(([category, themes]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {themes.map((theme) => (
                        <motion.button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            currentTheme === theme.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selected Indicator */}
                          {currentTheme === theme.id && (
                            <motion.div
                              layoutId="selectedTheme"
                              className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 rounded-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}

                          {/* Preview Icon */}
                          <div className="text-3xl mb-2">{theme.preview}</div>

                          {/* Theme Info */}
                          <h4 className="font-bold text-slate-900 mb-1">{theme.name}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed mb-2">
                            {theme.description}
                          </p>

                          {/* Color Indicator */}
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <span className="text-xs font-mono text-slate-500">
                              {theme.primaryColor}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSwitcher;
