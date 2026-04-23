import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code2, Briefcase, X, Sparkles, Loader2, Github, PencilLine, Wand2 } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { fetchProjects, saveProject, deleteProject } from '../services/portfolioService';
import { useAuthStore } from '../store/useAuthStore';
import { fetchRepoData } from '../services/githubService';
import { analyzeRepoContent } from '../services/geminiService';

const PortfolioPage = () => {
  const { projects, addProject, removeProject, setProjects, loading, setLoading } = useProjectStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('github'); // 'github' or 'manual'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form state
  const [newProject, setNewProject] = useState({
    name: '', type: '', stack: '', githubUrl: '', keyFeatures: '', challengesSolved: ''
  });

  // Fetch projects from Supabase on mount
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await fetchProjects();
        const mappedData = data.map(p => ({
          ...p,
          githubUrl: p.github_url,
          keyFeatures: p.key_features,
          challengesSolved: p.challenges_solved
        }));
        setProjects(mappedData);
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, [user, setProjects, setLoading]);

  const handleGithubImport = async () => {
    if (!newProject.githubUrl) return;
    setIsAnalyzing(true);
    try {
      const repoData = await fetchRepoData(newProject.githubUrl);
      const analysis = await analyzeRepoContent(repoData);
      if (analysis) {
        setNewProject({
          ...newProject,
          name: analysis.name || repoData.name,
          type: analysis.type,
          stack: analysis.stack,
          keyFeatures: analysis.keyFeatures,
          challengesSolved: analysis.challengesSolved
        });
        setModalTab('manual'); // Switch to manual to let user review
      }
    } catch (err) {
      alert("GitHub import failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveProject(newProject);
      if (saved) {
        addProject({
          ...saved,
          githubUrl: saved.github_url,
          keyFeatures: saved.key_features,
          challengesSolved: saved.challenges_solved
        });
      }
      setNewProject({ name: '', type: '', stack: '', githubUrl: '', keyFeatures: '', challengesSolved: '' });
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save project: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      removeProject(id);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <Briefcase className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold">Sign in to manage your portfolio</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">We store your projects in your profile so you can access them anywhere.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-10 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            My Portfolio Context
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Add the projects you want the AI to analyze against job descriptions.
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalTab('github');
          }}
          className="flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Syncing your portfolio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.length > 0 ? (
              projects.map((project) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={project.id}
                  className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between"
                >
                  <div>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-1">{project.name}</h3>
                    <p className="text-sm font-medium text-primary mb-4">{project.type}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          <Code2 className="w-3 h-3 mr-1" /> Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {project.stack?.split(',').map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.githubUrl && (
                    <div className="mt-6 pt-4 border-t border-border/50">
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex justify-center items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium bg-secondary/30 py-2 rounded-xl"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Repository
                      </a>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
                <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">No projects yet</h3>
                <p className="text-muted-foreground mt-2">Add your first project to start matching against job descriptions.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold text-foreground">Add New Project</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setNewProject({ name: '', type: '', stack: '', githubUrl: '', keyFeatures: '', challengesSolved: '' });
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex p-1 bg-secondary/50 mx-6 mt-6 rounded-xl">
              <button 
                onClick={() => setModalTab('github')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${modalTab === 'github' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Github className="w-4 h-4" />
                GitHub Import
              </button>
              <button 
                onClick={() => setModalTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${modalTab === 'manual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <PencilLine className="w-4 h-4" />
                Manual Entry
              </button>
            </div>
            
            <div className="p-6">
              {modalTab === 'github' ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Repository URL</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="url" 
                          value={newProject.githubUrl}
                          onChange={e => setNewProject({...newProject, githubUrl: e.target.value})}
                          placeholder="https://github.com/username/repo" 
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleGithubImport}
                        disabled={!newProject.githubUrl || isAnalyzing}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        Analyze
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Our AI will read your README and automatically extract the tech stack and features.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-sm text-primary font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Why use GitHub Import?
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1.5 list-disc pl-4">
                      <li>Automatically detects 15+ tech stack items</li>
                      <li>Extracts performance optimizations from README</li>
                      <li>Ensures consistent project formatting</li>
                      <li>Saves 5-10 minutes of manual data entry</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Project Name</label>
                      <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} type="text" placeholder="e.g. FoodSathi" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Project Type</label>
                      <input required value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} type="text" placeholder="e.g. Full-Stack App" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tech Stack (comma separated)</label>
                    <input required value={newProject.stack} onChange={e => setNewProject({...newProject, stack: e.target.value})} type="text" placeholder="React, Node.js, MongoDB" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Key Features (comma separated)</label>
                    <textarea required value={newProject.keyFeatures} onChange={e => setNewProject({...newProject, keyFeatures: e.target.value})} rows="2" placeholder="User Auth, Payment Gateway" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Challenges Solved (comma separated)</label>
                    <textarea required value={newProject.challengesSolved} onChange={e => setNewProject({...newProject, challengesSolved: e.target.value})} rows="2" placeholder="Optimized load times, secured API" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-none" />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-foreground hover:bg-secondary rounded-xl font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;

