import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

// This component displays the JD skill requirements as colorful pills/badges.
// Green = you have this skill (matched)
// Red = you're missing this skill
// Gray = neutral (not matched or missing explicitly)

const SkillsBreakdownCard = ({ mustHave, niceToHave, matched, missing }) => {

  // Determine color and icon for each skill pill
  const renderPill = (skill) => {
    const isMatched = matched?.includes(skill);
    const isMissing = missing?.includes(skill);

    let icon, colorClasses;

    if (isMatched) {
      icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />;
      colorClasses = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (isMissing) {
      icon = <XCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />;
      colorClasses = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    } else {
      icon = <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />;
      colorClasses = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }

    return (
      <span
        key={skill}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses} transition-all hover:scale-105 cursor-default`}
      >
        {icon}
        {skill}
      </span>
    );
  };

  return (
    <motion.div
      className="bg-card border border-border rounded-3xl p-8 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold">Requirements Intelligence</h3>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Matched
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Missing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Unconfirmed
        </span>
      </div>

      {/* Two-column layout: Must Haves + Nice to Haves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Must Have Skills */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 flex items-center border-b border-border pb-3">
            <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
            Must Haves
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {mustHave?.length > 0
              ? mustHave.map((s) => renderPill(s))
              : <span className="text-sm text-muted-foreground italic">None identified</span>
            }
          </div>
        </div>

        {/* Nice to Have Skills */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 flex items-center border-b border-border pb-3">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 mr-2"></span>
            Nice to Have
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {niceToHave?.length > 0
              ? niceToHave.map((s) => renderPill(s))
              : <span className="text-sm text-muted-foreground italic">None identified</span>
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillsBreakdownCard;
