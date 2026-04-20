import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Code2, Briefcase, X } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

const PortfolioPage = () => {
  const { projects, addProject, removeProject } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newProject, setNewProject] = useState({
    name: '', type: '', stack: '', keyFeatures: '', challengesSolved: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject(newProject);
    setNewProject({ name: '', type: '', stack: '', keyFeatures: '', challengesSolved: '' });
    setIsModalOpen(false);
  };

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
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={project.id}
              className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <button 
                onClick={() => removeProject(project.id)}
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
                    {project.stack.split(',').map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Project Name</label>
                <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} type="text" placeholder="e.g. FoodSathi" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Project Type</label>
                <input required value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} type="text" placeholder="e.g. Full-Stack E-commerce" className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
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
                <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                  Save Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
