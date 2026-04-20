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
        // Optional formatting, since we changed them to simple strings for easy inputs:
        stack: p.stack.split(',').map(s => s.trim()),
        keyFeatures: p.keyFeatures.split(',').map(s => s.trim()),
        challengesSolved: p.challengesSolved.split(',').map(s => s.trim())
      }))
    };
};
