import React, { useState } from 'react';
import { motion } from 'framer-motion';
import JobDescriptionInput from '../components/dashboard/JobDescriptionInput';

const DashboardPage = () => {
  const [analysisStatus, setAnalysisStatus] = useState('idle');

  const handleAnalyze = (jdText) => {
    // For Day 2, we just capture the text and show a success state to prove the UI works.
    setAnalysisStatus('success');
    console.log("Captured JD for future analysis:", jdText.substring(0, 50) + "...");
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
      <JobDescriptionInput onAnalyze={handleAnalyze} />

      {/* Temporary state indicator for Day 2 */}
      {analysisStatus === 'success' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-6 bg-card border border-border rounded-xl shadow-lg flex flex-col items-center max-w-sm"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
             <span className="text-2xl">✅</span>
          </div>
          <h3 className="font-bold text-lg">Input Captured!</h3>
          <p className="text-center text-muted-foreground text-sm mt-2">
            The Job Description has been captured perfectly. In Day 3 & 4, we will send this data to the Gemini AI to render the results!
          </p>
        </motion.div>
      )}

    </div>
  );
};

export default DashboardPage;
