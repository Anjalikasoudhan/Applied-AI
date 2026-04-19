import { useMutation } from '@tanstack/react-query';
import { analyzeJobDescription } from '../services/geminiService';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';

export const useAnalyzeJob = () => {
  // Grab our setters from the global Zustand store
  const { setAnalysis, setAnalyzing, setError } = useJobAnalysisStore();

  // useMutation from TanStack query manages the loading/error/success lifecycle flawlessly
  return useMutation({
    mutationFn: async (jdText) => {
      // 1. Alert the UI that we have started
      setAnalyzing(true);
      setError(null);
      
      // 2. Call our Gemini Service (which grabs FoodSathi MCP mock data too!)
      const analysisData = await analyzeJobDescription(jdText);
      return analysisData;
    },
    onSuccess: (data) => {
      // 3. Save the result to the global store for the Dashboard UI to read
      setAnalysis(data);
    },
    onError: (error) => {
      // 4. Handle any crashes securely
      setError(error.message || "An error occurred during analysis");
      setAnalyzing(false);
    }
  });
};
