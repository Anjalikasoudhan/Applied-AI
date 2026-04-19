import { create } from 'zustand';

// Zustand is a tiny, powerful state management library.
// We use this so that when the Dashboard captures a job description,
// we can instantly access the resulting data on the Analysis page 
// without passing props down complex component trees.

export const useJobAnalysisStore = create((set) => ({
  // The actual JSON output from our AI analysis
  currentAnalysis: null,
  
  // App-wide loading indicator for any analysis operations
  isAnalyzing: false,
  
  // Global error string if something crashes
  error: null,
  
  // Clean, singular actions to modify the state
  setAnalysis: (data) => set({ currentAnalysis: data, isAnalyzing: false, error: null }),
  setAnalyzing: (status) => set({ isAnalyzing: status }),
  setError: (err) => set({ error: err, isAnalyzing: false }),
  clearAnalysis: () => set({ currentAnalysis: null, isAnalyzing: false, error: null })
}));
