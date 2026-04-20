import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, Target, MessageSquare } from 'lucide-react';

// This component shows HOW the user's existing projects match the JD requirements.
// Each row maps a JD requirement → a project feature → a talking point for the interview.

const ProjectBridgeCard = ({ bridgeNotes }) => {

  if (!bridgeNotes || bridgeNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-2">No Bridge Data</h3>
        <p className="text-sm text-muted-foreground">
          The AI could not map your projects to the JD requirements. Try adding more project details.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-3xl p-8 shadow-sm"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl">
          <GitBranch className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Project Bridge</h3>
          <p className="text-sm text-muted-foreground">How your projects match the JD requirements</p>
        </div>
      </div>

      {/* Bridge Items */}
      <div className="space-y-4">
        {bridgeNotes.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="relative border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors bg-background/50"
          >
            {/* Step Number */}
            <div className="absolute -left-3 -top-3 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
              {index + 1}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* JD Requirement */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">JD Requires</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                  {item.jdRequirement}
                </p>
              </div>

              {/* Your Project Feature */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your Project</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item.projectFeatureMatch}
                </p>
              </div>

              {/* Talking Point */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interview Talking Point</p>
                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  {item.talkingPoint}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectBridgeCard;
