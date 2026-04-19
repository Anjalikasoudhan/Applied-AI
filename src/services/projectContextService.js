/**
 * projectContextService.js
 * 
 * Mock implementation of an MCP (Model Context Protocol) ready ingestor.
 * In a real 2026 future, this would request local file context mapping from
 * cursor/VSCode or standard MCP hooks.
 * For now, this provides the "FoodSathi" demo baseline.
 */

export const getProjectContext = () => {
    return {
      projects: [
        {
          name: "FoodSathi",
          type: "Food Delivery Web App",
          stack: ["React", "JavaScript", "React Router", "Tailwind CSS", "Redux Toolkit/Zustand"],
          keyFeatures: [
            "Live fetching of restaurant data from public Swiggy API",
            "Complex cart state management and checkout flow",
            "Custom UI theming and dark mode context",
            "Responsive dashboard interface"
          ],
          challengesSolved: [
            "Handling CORS issues with live APIs",
            "Optimizing re-renders in a large list of items",
            "Modularizing CSS and styling architecture"
          ]
        },
        {
          name: "Budget Buddy",
          type: "Personal Finance Dashboard",
          stack: ["React", "Firebase", "Chart.js"],
          keyFeatures: [
            "User authentication via Firebase",
            "CRUD operations for expenses",
            "Visual data representation of spending habits"
          ],
          challengesSolved: [
            "Real-time database sync",
            "Complex data aggregations for charting"
          ]
        }
      ]
    };
  };
