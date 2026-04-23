import { create } from 'zustand';

// This store manages the local state of projects.
// It is no longer persists to LocalStorage, but syncs with Supabase via the PortfolioPage.

export const useProjectStore = create((set) => ({
  projects: [],
  loading: false,

  setProjects: (projects) => set({ projects }),
  setLoading: (loading) => set({ loading }),

  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id)
  }))
}));



