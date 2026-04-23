import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeJobDescription } from '../services/geminiService';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';
import { saveAnalysis } from '../services/historyService';

export const useAnalyzeJob = () => {
  const { setAnalysis, setAnalyzing, setError } = useJobAnalysisStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jdText) => {
      setAnalyzing(true);
      setError(null);
      
      const analysisData = await analyzeJobDescription(jdText);
      return analysisData;
    },
    onSuccess: async (data) => {
      // 1. Save to global store for immediate UI rendering
      setAnalysis(data);
      
      // 2. Also persist to Supabase database (non-blocking)
      try {
        await saveAnalysis(data);
        // Invalidate the history cache so the History page auto-refreshes
        queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
      } catch (e) {
        // Database save failure shouldn't crash the main flow
        console.warn("Failed to save to database:", e.message);
      }
    },
    onError: (error) => {
      setError(error.message || "An error occurred during analysis");
      setAnalyzing(false);
    }
  });
};
