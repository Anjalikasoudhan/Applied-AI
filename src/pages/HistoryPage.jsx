import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Clock, Building2, Briefcase, ArrowRight, FileText, RefreshCw } from 'lucide-react';
import { fetchHistory, deleteAnalysis } from '../services/historyService';
import { useJobAnalysisStore } from '../store/useJobAnalysisStore';
import { useAuthStore } from '../store/useAuthStore';

const HistoryPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAnalysis } = useJobAnalysisStore();
  const { user } = useAuthStore();

  // useQuery auto-fetches on mount and caches the result
  // Only run query if user is logged in
  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['analysisHistory', user?.id],
    queryFn: fetchHistory,
    enabled: !!user
  });

  // Delete mutation with cache invalidation
  const deleteMutation = useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      // After deleting, tell React Query to refetch the history list
      queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
    }
  });

  // Load a past analysis into the Zustand store and navigate to results
  const handleView = (item) => {
    setAnalysis(item.analysis_data);
    navigate('/analysis');
  };

  // Format date to readable string
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Auth state
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 pt-12">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Sign in to view History</h2>
        <p className="text-muted-foreground max-w-md">
          Your saved analyses are tied to your account. Sign in to view and manage them.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Sign In
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your analysis history...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Failed to Load History</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'Could not connect to database.'}
        </p>
        <p className="text-sm text-muted-foreground">
          Make sure you have run the SQL schema in your Supabase dashboard.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!history || history.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 pt-12">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No History Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Every time you analyze a Job Description, it gets saved here automatically. Go paste your first JD!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pt-10 pb-20 px-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-3 md:space-y-0"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Analysis History
          </h1>
          <p className="text-muted-foreground mt-2">
            {history.length} past {history.length === 1 ? 'analysis' : 'analyses'} saved
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors border border-border"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* History Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left — Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.company_name && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        <Building2 className="w-3 h-3" />
                        {item.company_name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                      <Briefcase className="w-3 h-3" />
                      {item.role_title}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.summary || 'No summary available.'}
                  </p>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.created_at)}
                  </p>
                </div>

                {/* Right — Score + Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className={`text-3xl font-black ${getScoreColor(item.match_score)}`}>
                      {item.match_score}%
                    </span>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Match</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryPage;
