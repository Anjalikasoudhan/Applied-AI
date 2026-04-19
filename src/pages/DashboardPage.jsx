import React from 'react';
import { motion } from 'framer-motion';
import JobDescriptionInput from '../components/dashboard/JobDescriptionInput';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';
import { useAnalyzeJob } from '../hooks/useAnalyzeJob';

const DashboardPage = () => {
  // Pull our global state tools from Zustand
  const { currentAnalysis, isAnalyzing, error } = useJobAnalysisStore();

  // Intialize our robust TanStack Query mutation hook
  const { mutate: executeAnalysis } = useAnalyzeJob();

  const handleAnalyze = (jdText) => {
    // Instead of raw try/catches, we just pass the text into the hook!
    // The hook naturally updates the Zustand store while executing.
    executeAnalysis(jdText);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center pt-10 pb-20">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium tracking-wide mb-4">
          <span className="flex w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          AI-Powered Career Intelligence
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
          Bridge the gap between <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
             Job Descriptions
          </span> and your skills.
        </h1>
        
        <p className="text-lg text-muted-foreground w-11/12 mx-auto">
          Paste any job description below. Applied.AI will instantly break down the exact technologies they want, score your project alignment, and generate highly targeted interview questions.
        </p>
      </motion.div>

      {/* Main Input Form */}
      <JobDescriptionInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {/* Safety Error Display */}
      {error && (
        <div className="mt-4 p-4 max-w-4xl w-full bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-center">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Day 4 Live AI Output Viewer */}
      {currentAnalysis && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-8 w-full max-w-4xl bg-card border border-border rounded-xl shadow-lg flex flex-col"
        >
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
             </div>
             <h3 className="font-bold text-xl">Live Gemini AI Analysis Completed!</h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
             This data came back natively from the Google Gemini 1.5 Pro API! 
             Tomorrow (Day 5), we will map this data into the visual Rechart dashboards.
          </p>

          <div className="bg-background rounded-lg p-4 border border-border overflow-auto max-h-[500px] text-xs text-blue-400 font-mono shadow-inner">
             <pre>{JSON.stringify(currentAnalysis, null, 2)}</pre>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default DashboardPage;
