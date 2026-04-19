import React, { useState } from 'react';
import { Sparkles, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

// Now receiving isAnalyzing directly from the parent (Dashboard -> Zustand store)
const JobDescriptionInput = ({ onAnalyze, isAnalyzing }) => {
  const [jdText, setJdText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jdText.trim() && !isAnalyzing) {
       // Hand it off to the parent, state is now controlled globally!
       onAnalyze(jdText);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto mt-12"
    >
      <div className="bg-card rounded-3xl border border-border/50 shadow-lg overflow-hidden backdrop-blur-xl relative">
        <form onSubmit={handleSubmit} className="p-8 relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Paste Job Description
            </h2>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full JD here... e.g. 'We are looking for a Senior React Developer...'"
              className="relative w-full h-64 p-6 bg-background rounded-2xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-base leading-relaxed transition-all"
              disabled={isAnalyzing}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={!jdText.trim() || isAnalyzing}
              className="relative inline-flex items-center justify-center px-8 py-4 font-semibold text-primary-foreground transition-all duration-200 bg-primary border rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full -ml-16 translate-x-full bg-white/20 blur-md group-hover:animate-shimmer filter transition-all duration-1000 ease-in-out"></div>
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-3 animate-spin text-primary-foreground/80" />
                  Analyzing JD...
                </>
              ) : (
                <>
                   Generate Intel
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default JobDescriptionInput;
