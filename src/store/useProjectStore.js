import { create } from 'zustand';

// This store persists user-added portfolio projects.
// Projects are stored as simple objects with comma-separated strings
// for easy input from the form (PortfolioPage).

const DEFAULT_PROJECTS = [
  {
    id: '1',
    name: 'FoodSathi',
    type: 'Food Delivery Web App',
    stack: 'React, JavaScript, React Router, Tailwind CSS, Redux Toolkit',
    keyFeatures: 'Live fetching from Swiggy API, Cart state management, Dark mode theming, Responsive UI',
    challengesSolved: 'Handling CORS issues, Optimizing re-renders, Modularizing CSS architecture'
  },
  {
    id: '2',
    name: 'Budget Buddy',
    type: 'Personal Finance Dashboard',
    stack: 'React, Firebase, Chart.js',
    keyFeatures: 'User authentication, CRUD expenses, Visual spending charts',
    challengesSolved: 'Real-time database sync, Complex data aggregations'
  }
];

export const useProjectStore = create((set) => ({
  projects: DEFAULT_PROJECTS,

  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now().toString() }]
  })),

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id)
  }))
}));
