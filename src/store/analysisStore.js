import { create } from 'zustand';

const useAnalysisStore = create((set) => ({
  // Theme state
  currentTheme: 'editorial', // default theme

  // Analysis state
  targetUrl: '',
  analysisData: null,
  scrapingStatus: 'idle', // 'idle' | 'scanning' | 'results'

  // GEO mode state
  geoIntel: [],
  selectedSector: null,
  sectorName: '',
  isLoadingFeed: false,
  analyzingId: null,

  // Actions
  setTheme: (theme) => set({ currentTheme: theme }),

  setTargetUrl: (url) => set({ targetUrl: url }),

  setAnalysisData: (data) => set({
    analysisData: data,
    scrapingStatus: 'results'
  }),

  updateStatus: (status) => set({ scrapingStatus: status }),

  setGeoIntel: (data) => set({ geoIntel: data }),

  setSelectedSector: (sector) => set({ selectedSector: sector }),

  setSectorName: (name) => set({ sectorName: name }),

  setIsLoadingFeed: (loading) => set({ isLoadingFeed: loading }),

  setAnalyzingId: (id) => set({ analyzingId: id }),

  resetAnalysis: () => set({
    targetUrl: '',
    analysisData: null,
    scrapingStatus: 'idle',
    analyzingId: null
  })
}));

export default useAnalysisStore;
