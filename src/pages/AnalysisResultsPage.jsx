import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Briefcase, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';
import MatchScoreChart from '../components/analysis/MatchScoreChart';
import SkillsBreakdownCard from '../components/analysis/SkillsBreakdownCard';
import ProjectBridgeCard from '../components/analysis/ProjectBridgeCard';
import InterviewCheatSheet from '../components/analysis/InterviewCheatSheet';

const AnalysisResultsPage = () => {
  const { currentAnalysis } = useJobAnalysisStore();

  // If someone navigates here directly without running an analysis first
  if (!currentAnalysis) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No Analysis Found</h2>
        <p className="text-muted-foreground max-w-md">
          You need to analyze a Job Description first before viewing results.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const {
    companyName,
    roleTitle,
    summary,
    mustHaveSkills,
    niceToHaveSkills,
    matchedSkills,
    missingSkills,
    matchScore,
    categoryScores,
    projectBridgeNotes,
    interviewQuestions
  } = currentAnalysis;

  return (
    <div className="pb-20 pt-6 space-y-8">

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      {/* Page Header — Role & Company Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {companyName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Building2 className="w-3.5 h-3.5" />
              {companyName}
            </span>
          )}
          {roleTitle && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-border">
              <Briefcase className="w-3.5 h-3.5" />
              {roleTitle}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          Analysis Results
        </h1>

        {summary && (
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {summary}
          </p>
        )}
      </motion.div>

      {/* ====== SECTION 1: Match Score Charts ====== */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Match Score Overview
        </h2>
        <MatchScoreChart score={matchScore} categoryScores={categoryScores} />
      </section>

      {/* ====== SECTION 2: Skills Breakdown ====== */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Skills Breakdown
        </h2>
        <SkillsBreakdownCard
          mustHave={mustHaveSkills}
          niceToHave={niceToHaveSkills}
          matched={matchedSkills}
          missing={missingSkills}
        />
      </section>

      {/* ====== SECTION 3: Quick Stats (Summary Cards) ====== */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Skills Required"
            value={(mustHaveSkills?.length || 0) + (niceToHaveSkills?.length || 0)}
            color="text-primary"
            delay={0}
          />
          <StatCard
            label="Skills Matched"
            value={matchedSkills?.length || 0}
            color="text-emerald-500"
            delay={0.1}
          />
          <StatCard
            label="Skills Missing"
            value={missingSkills?.length || 0}
            color="text-rose-500"
            delay={0.2}
          />
          <StatCard
            label="Match Score"
            value={`${matchScore}%`}
            color={matchScore >= 80 ? "text-emerald-500" : matchScore >= 60 ? "text-amber-500" : "text-rose-500"}
            delay={0.3}
          />
        </div>
      </section>

      {/* ====== SECTION 4: Project Bridge ====== */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Project Bridge
        </h2>
        <ProjectBridgeCard bridgeNotes={projectBridgeNotes} />
      </section>

      {/* ====== SECTION 5: Interview Cheat Sheet ====== */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Interview Preparation
        </h2>
        <InterviewCheatSheet questions={interviewQuestions} />
      </section>
    </div>
  );
};

// A small reusable stat card component used inside this page
const StatCard = ({ label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm"
  >
    <span className={`text-3xl font-black ${color}`}>{value}</span>
    <span className="text-xs font-medium text-muted-foreground mt-2 uppercase tracking-wide">{label}</span>
  </motion.div>
);

export default AnalysisResultsPage;
