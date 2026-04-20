import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

// This component renders the AI-generated interview questions.
// Each question includes: the question itself, why it might be asked,
// which project to mention, a hint, and a confidence tag.

const InterviewCheatSheet = ({ questions }) => {

  if (!questions || questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-2">No Interview Questions</h3>
        <p className="text-sm text-muted-foreground">
          The AI could not generate questions for this job description.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-3xl p-8 shadow-sm"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl">
            <BookOpen className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Interview Cheat Sheet</h3>
            <p className="text-sm text-muted-foreground">{questions.length} likely questions based on JD analysis</p>
          </div>
        </div>

        <CopyAllButton questions={questions} />
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuestionCard key={index} question={q} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

// Individual expandable question card
const QuestionCard = ({ question, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color logic for confidence badges
  const getConfidenceStyle = (confidence) => {
    const level = confidence?.toLowerCase();
    if (level === 'high') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (level === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.08 * index }}
      className="border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors bg-background/50"
    >
      {/* Question Header (always visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="w-7 h-7 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            Q{index + 1}
          </span>
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {question.question}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getConfidenceStyle(question.confidence)}`}>
            {question.confidence}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 space-y-3 border-t border-border ml-10">
              
              <div className="pt-3 space-y-3">
                {/* Why this might be asked */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Why they ask this</p>
                  <p className="text-sm text-foreground/80">{question.reason}</p>
                </div>

                {/* Which project to mention */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Mention this project</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {question.projectExample}
                  </span>
                </div>

                {/* Answer hint */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Answer hint</p>
                  <p className="text-sm text-foreground/80 bg-muted/50 rounded-lg p-3 border border-border italic">
                    💡 {question.hint}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Copy all questions to clipboard button
const CopyAllButton = ({ questions }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = questions.map((q, i) => 
      `Q${i + 1}: ${q.question}\nWhy: ${q.reason}\nProject: ${q.projectExample}\nHint: ${q.hint}\nConfidence: ${q.confidence}\n`
    ).join('\n---\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors border border-border"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy All
        </>
      )}
    </button>
  );
};

export default InterviewCheatSheet;
