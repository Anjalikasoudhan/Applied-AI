/**
 * projectContextService.js
 * 
 * Day 6 Implemented: Dynamically pulls user portfolio projects 
 * from our persistent Zustand store.
 */
import { useProjectStore } from '../store/useProjectStore';

export const getProjectContext = () => {
    // Dynamically retrieve the latest projects from LocalStorage/Zustand!
    const userProjects = useProjectStore.getState().projects;

    return {
      projects: userProjects.map(p => ({
        name: p.name,
        type: p.type,
        githubUrl: p.githubUrl || 'N/A',
        // Safe formatting in case any fields are missing or already arrays
        stack: p.stack ? (typeof p.stack === 'string' ? p.stack.split(',').map(s => s.trim()) : p.stack) : [],
        keyFeatures: p.keyFeatures ? (typeof p.keyFeatures === 'string' ? p.keyFeatures.split(',').map(s => s.trim()) : p.keyFeatures) : [],
        challengesSolved: p.challengesSolved ? (typeof p.challengesSolved === 'string' ? p.challengesSolved.split(',').map(s => s.trim()) : p.challengesSolved) : []
      }))
    };

};
