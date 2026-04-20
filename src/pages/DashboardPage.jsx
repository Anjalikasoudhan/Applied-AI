import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JobDescriptionInput from '../components/dashboard/JobDescriptionInput';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';
import { useAnalyzeJob } from '../hooks/useAnalyzeJob';

const DashboardPage = () => {
  const { isAnalyzing, error } = useJobAnalysisStore();
  const { mutate: executeAnalysis } = useAnalyzeJob();
  const navigate = useNavigate();

  const handleAnalyze = (jdText) => {
    // Fire the mutation. On success, navigate to the results page.
    executeAnalysis(jdText, {
      onSuccess: () => {
        navigate('/analysis');
      }
    });
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

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 max-w-4xl w-full bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-center"
        >
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;
