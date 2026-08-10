import Groq from 'groq-sdk';
import { getProjectContext } from './projectContextService';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey, dangerouslyAllowBrowser: true }) : null;

const SYSTEM_PROMPT = `
You are an expert technical recruiter. You are evaluating a candidate for a specific JD based on their portfolio.

CRITICAL TECHNICAL DICTIONARY (MANDATORY MATCHES):
- If the JD says "Redux" and the project has "Redux Toolkit" -> This is a 100% MATCH.
- If the JD says "State Management" and the project has "Redux", "Redux Toolkit", "Zustand", "Context API", or "Recoil" -> This is a 100% MATCH.
- If the JD says "REST APIs" or "API Integration" and the project has "Supabase", "Firebase", "Axios", "Fetch", or ANY item ending in "API" (e.g. Swiggy API) -> This is a 100% MATCH.
- If the JD says "Build Tools" or "Bundlers" and the project has "Vite", "Webpack", or "Parcel" -> This is a 100% MATCH.
- If the JD says "Git" or "Version Control", and the candidate has a "githubUrl" that is not "N/A" (or mentions Git/GitHub) -> This is a 100% MATCH.
- If the JD says "Component-based architecture" (or similar), and the candidate has any project built with React or React Native -> This is a 100% MATCH (inherent to React).
- If the JD says "Context API", and the candidate has any project with global state management (Zustand, Redux, Redux Toolkit) or React -> This is a 100% MATCH.

RULES:
- Scan ALL projects. If a technology is mentioned in any project's stack, use the dictionary above to find its parent category in the JD.
- NEVER mark "State Management" or "Context API" as missing if the user has Redux or Zustand.
- NEVER mark "Redux" as missing if the user has Redux Toolkit.
- NEVER mark "Component-based architecture" as missing if the user has React projects.
- NEVER mark "Git" as missing if the user has GitHub URLs for their projects.
- ALWAYS identify "React Native" or "Mobile Development" as a Must-Have skill if the JD mandates React Native. If the candidate's projects do not explicitly list React Native, you MUST list it under missingSkills (since the candidate does not have React Native on their resume).
- Be extremely thorough. Every word in the project tech stack is a clue.

INTERVIEW QUESTIONS:
- Scale to 5-6 questions per project (18 total for 3 projects).
- Ensure questions for the "Food Ordering" app specifically ask about the implementation of Redux Toolkit.

OUTPUT JSON STRUCTURE:
{
  "companyName": "string",
  "roleTitle": "string",
  "summary": "2 sentence summary",
  "mustHaveSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "matchedSkills": ["Skills found in portfolio using the dictionary"],
  "missingSkills": ["Skills NOT found in ANY property of ANY project after scanning dictionary"],
  "matchScore": number,
  "categoryScores": { "frontend": 0-100, "backend": 0-100, "tools": 0-100, "projectRelevance": 0-100 },
  "projectBridgeNotes": [{ "jdRequirement": "string", "projectFeatureMatch": "string", "talkingPoint": "string" }],
  "interviewQuestions": [{ "question": "string", "reason": "string", "projectExample": "string", "hint": "string", "confidence": "High" }]
}
`;





// Groq models — llama3 is fast and reliable
const MODELS_TO_TRY = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

export const analyzeJobDescription = async (jdText) => {
  if (!groq) {
    console.warn("No Groq API key found. Falling back to demo data.");
    return getMockAnalysis(jdText);
  }

  const candidateContext = getProjectContext();

  const userPrompt = `
    CANDIDATE PROJECT CONTEXT: 
    ${JSON.stringify(candidateContext)}

    ====================
    JOB DESCRIPTION:
    ${jdText}
  `;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Trying Groq model: ${modelName}...`);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        model: modelName,
        temperature: 0.3,
        max_tokens: 4096
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '';

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No valid JSON found in AI response");
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse Groq JSON:", e, responseText);
        throw new Error("AI returned malformed JSON");
      }

    } catch (error) {
      if (modelName !== MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
        console.warn(`Model ${modelName} failed, trying next...`);
        continue;
      }
      console.warn("All Groq models failed. Using demo data.");
      return getMockAnalysis(jdText);
    }
  }
};

// Rich demo fallback data
function getMockAnalysis(text) {
  const candidateContext = getProjectContext();
  
  const mustHaveSkills = ["JavaScript", "React.js", "HTML5", "CSS3", "REST APIs", "Component-based architecture", "State management", "Responsive design", "React Native"];
  const niceToHaveSkills = ["Redux", "Context API", "Git", "Webpack/Vite", "TypeScript", "Docker", "Linux", "CI/CD"];

  // Gather all words and phrases from candidate's projects to match against
  const userKeywords = new Set();
  if (candidateContext && candidateContext.projects) {
    candidateContext.projects.forEach(p => {
      // Add stack items
      if (Array.isArray(p.stack)) {
        p.stack.forEach(s => userKeywords.add(s.toLowerCase().trim()));
      }
      // Add key features and challenges solved
      if (Array.isArray(p.keyFeatures)) {
        p.keyFeatures.forEach(f => userKeywords.add(f.toLowerCase().trim()));
      }
      if (Array.isArray(p.challengesSolved)) {
        p.challengesSolved.forEach(c => userKeywords.add(c.toLowerCase().trim()));
      }
      // Add name, type
      if (p.name) {
        userKeywords.add(p.name.toLowerCase().trim());
        p.name.toLowerCase().split(/\s+/).forEach(w => userKeywords.add(w));
      }
      if (p.type) {
        userKeywords.add(p.type.toLowerCase().trim());
        p.type.toLowerCase().split(/\s+/).forEach(w => userKeywords.add(w));
      }
      // Scan githubUrl for version control match
      if (p.githubUrl && p.githubUrl !== 'N/A') {
        userKeywords.add("git");
        userKeywords.add("github");
      }
    });
  }

  // Helper check function
  const isSkillMatched = (skill) => {
    const sLower = skill.toLowerCase().trim();
    
    // Check direct matching or sub-word matching
    if (userKeywords.has(sLower)) return true;
    for (const kw of userKeywords) {
      if (kw.includes(sLower) || sLower.includes(kw)) return true;
    }

    // Custom dictionary rules:
    if (sLower === 'redux') {
      return Array.from(userKeywords).some(kw => 
        kw.includes('redux') || kw.includes('rtk') || kw.includes('toolkit')
      );
    }
    
    if (sLower === 'state management') {
      return Array.from(userKeywords).some(kw => 
        kw.includes('state') || kw.includes('redux') || kw.includes('zustand') || 
        kw.includes('context') || kw.includes('recoil') || kw.includes('store')
      );
    }

    if (sLower === 'component-based architecture') {
      // Inherently true if using React/React Native or component-based UI libraries
      return Array.from(userKeywords).some(kw => 
        kw.includes('react') || kw.includes('component') || kw.includes('zustand') || kw.includes('redux')
      );
    }

    if (sLower === 'context api') {
      // Inherently true if they have global state management like Zustand or Redux, or general React
      return Array.from(userKeywords).some(kw => 
        kw.includes('context') || kw.includes('redux') || kw.includes('zustand') || kw.includes('state')
      );
    }
    
    if (sLower === 'rest apis' || sLower === 'api integration') {
      return Array.from(userKeywords).some(kw => 
        kw.includes('api') || kw.includes('apis') || kw.includes('supabase') || 
        kw.includes('firebase') || kw.includes('axios') || kw.includes('fetch') || 
        kw.includes('rest') || kw.includes('http')
      );
    }
    
    if (sLower === 'webpack/vite' || sLower === 'build tools') {
      return Array.from(userKeywords).some(kw => 
        kw.includes('vite') || kw.includes('webpack') || kw.includes('parcel') || kw.includes('bundler')
      );
    }

    if (sLower === 'javascript') {
      return Array.from(userKeywords).some(kw => kw === 'javascript' || kw === 'js' || kw.includes('react'));
    }

    if (sLower === 'html5') {
      return Array.from(userKeywords).some(kw => kw.includes('html'));
    }

    if (sLower === 'css3') {
      return Array.from(userKeywords).some(kw => kw.includes('css') || kw.includes('tailwind') || kw.includes('sass'));
    }

    if (sLower === 'typescript') {
      return Array.from(userKeywords).some(kw => kw.includes('typescript') || kw === 'ts');
    }

    if (sLower === 'git') {
      return Array.from(userKeywords).some(kw => kw.includes('git') || kw.includes('github'));
    }

    if (sLower === 'react native') {
      return Array.from(userKeywords).some(kw => kw.includes('react native') || kw === 'native');
    }

    if (sLower === 'docker') {
      return Array.from(userKeywords).some(kw => kw.includes('docker') || kw.includes('container'));
    }

    if (sLower === 'linux') {
      return Array.from(userKeywords).some(kw => kw.includes('linux'));
    }

    if (sLower === 'ci/cd') {
      return Array.from(userKeywords).some(kw => kw.includes('ci/cd') || kw.includes('github actions') || kw.includes('pipeline'));
    }

    return false;
  };

  const matchedSkills = [];
  const missingSkills = [];

  mustHaveSkills.forEach(s => {
    if (isSkillMatched(s)) matchedSkills.push(s);
    else missingSkills.push(s);
  });

  niceToHaveSkills.forEach(s => {
    if (isSkillMatched(s)) matchedSkills.push(s);
    else missingSkills.push(s);
  });

  // Calculate dynamic match score
  const totalWeight = (mustHaveSkills.length * 1.5) + (niceToHaveSkills.length * 0.7);
  const matchedMustHaves = matchedSkills.filter(s => mustHaveSkills.includes(s)).length;
  const matchedNiceToHaves = matchedSkills.filter(s => niceToHaveSkills.includes(s)).length;
  const matchScore = Math.min(100, Math.round(((matchedMustHaves * 1.5 + matchedNiceToHaves * 0.7) / totalWeight) * 100));

  // Category scores
  const frontendMatched = matchedSkills.filter(s => ["JavaScript", "React.js", "HTML5", "CSS3", "Component-based architecture", "Responsive design", "React Native"].includes(s)).length;
  const frontendScore = Math.round((frontendMatched / 7) * 100);
  
  const toolsMatched = matchedSkills.filter(s => ["Git", "Webpack/Vite", "Docker", "Linux", "CI/CD"].includes(s)).length;
  const toolsScore = Math.round((toolsMatched / 5) * 100);

  let backendScore = 35;
  const hasBackend = candidateContext?.projects?.some(p => {
    const stackStr = (Array.isArray(p.stack) ? p.stack.join(' ') : (p.stack || '')).toLowerCase();
    return stackStr.includes('supabase') || stackStr.includes('firebase') || stackStr.includes('node') || stackStr.includes('express') || stackStr.includes('database') || stackStr.includes('mongodb') || stackStr.includes('api');
  });
  if (hasBackend) backendScore = 80;

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        companyName: extractCompanyName(text),
        roleTitle: extractRoleTitle(text),
        summary: "A role focused on building modern web applications with React and frontend technologies. You'll develop responsive UIs, integrate APIs, and collaborate with cross-functional teams.",
        mustHaveSkills,
        niceToHaveSkills,
        matchedSkills,
        missingSkills,
        matchScore,
        categoryScores: {
          frontend: frontendScore,
          backend: backendScore,
          tools: toolsScore,
          projectRelevance: Math.min(100, Math.round(matchScore * 1.1))
        },

        projectBridgeNotes: [
          {
            jdRequirement: "Develop and maintain user interfaces using React.js",
            projectFeatureMatch: "FoodSathi Complete UI",
            talkingPoint: "Explain how FoodSathi is a full React SPA with multiple pages — restaurant listing, menu detail, cart — all built with reusable React components and React Router for navigation."
          },
          {
            jdRequirement: "Build reusable components and frontend libraries",
            projectFeatureMatch: "FoodSathi Component Library",
            talkingPoint: "Walk through your reusable components: RestaurantCard, MenuCategory, CartItem. Explain how you designed them as pure components that accept props and can be used anywhere."
          },
          {
            jdRequirement: "Integrate APIs and backend services",
            projectFeatureMatch: "FoodSathi Live Swiggy API Integration",
            talkingPoint: "Discuss how FoodSathi fetches live restaurant data from the Swiggy API using fetch/axios, handles loading states, and gracefully manages API errors with try/catch."
          },
          {
            jdRequirement: "Optimize applications for speed and performance",
            projectFeatureMatch: "FoodSathi Performance Optimization",
            talkingPoint: "Mention React.lazy() for code splitting, useMemo for expensive computations, and how you avoided unnecessary re-renders by structuring state properly."
          },
          {
            jdRequirement: "Debug and resolve frontend issues",
            projectFeatureMatch: "Applied.AI Error Handling System",
            talkingPoint: "In Applied.AI, you built a robust error boundary with graceful fallbacks. When AI models fail (429/503 errors), the app automatically retries alternative models instead of crashing."
          },
          {
            jdRequirement: "Follow coding standards and best practices",
            projectFeatureMatch: "Applied.AI Modular Architecture",
            talkingPoint: "Discuss your folder structure: components/, pages/, services/, store/, hooks/ — each with a single responsibility. Explain how you separate UI from business logic."
          },
          {
            jdRequirement: "State management (Redux or Context API)",
            projectFeatureMatch: "Applied.AI Zustand Global Store",
            talkingPoint: "Explain how Applied.AI uses Zustand for global state (analysis results, loading flags). Compare Zustand vs Redux vs Context API — Zustand is lighter with less boilerplate but same concept."
          },
          {
            jdRequirement: "Familiarity with modern frontend tools (Webpack, Vite)",
            projectFeatureMatch: "Applied.AI Vite Setup",
            talkingPoint: "Both FoodSathi (Parcel) and Applied.AI (Vite) use modern bundlers. Explain why Vite is faster than Webpack — it uses native ES modules in dev and Rollup for production builds."
          }
        ],

        interviewQuestions: [
          {
            question: "What is React and why do we use it?",
            reason: "Basic React understanding is the core requirement of this role.",
            projectExample: "FoodSathi & Applied.AI",
            hint: "React is a JavaScript library for building user interfaces using a component-based architecture. It uses a Virtual DOM to efficiently update only the parts of the page that changed, instead of re-rendering the entire page. We use it because it makes building complex, interactive UIs manageable through reusable components. In FoodSathi, each restaurant card is a component that gets reused for every restaurant.",
            confidence: "High"
          },
          {
            question: "Explain the difference between state and props in React.",
            reason: "Fundamental React concept — every intern interview asks this.",
            projectExample: "FoodSathi RestaurantCard",
            hint: "Props are read-only data passed FROM a parent TO a child component — like function arguments. State is mutable data managed INSIDE a component using useState. When state changes, the component re-renders. In FoodSathi, the RestaurantCard receives restaurant data as props, while the search input manages its search text as local state.",
            confidence: "High"
          },
          {
            question: "What are React hooks? Name the ones you've used.",
            reason: "Hooks are essential for modern React — the JD requires component-based architecture knowledge.",
            projectExample: "Applied.AI Dashboard",
            hint: "Hooks let you use React features (state, lifecycle, context) in functional components without classes. Common hooks: useState (local state), useEffect (side effects like API calls), useRef (DOM references), useMemo (memoize expensive calculations), useCallback (memoize functions). In Applied.AI, you used useState for form inputs, useMutation from TanStack Query for API calls, and custom hooks like useAnalyzeJob.",
            confidence: "High"
          },
          {
            question: "How does useEffect work? Give an example.",
            reason: "useEffect is used constantly for API calls and side effects — critical for this role.",
            projectExample: "FoodSathi API Fetching",
            hint: "useEffect runs side effects after render. It takes a callback function and a dependency array. With an empty array [], it runs once on mount (like componentDidMount). With dependencies [searchText], it re-runs whenever searchText changes. Always return a cleanup function for subscriptions/timers. In FoodSathi, useEffect fetches restaurant data on component mount.",
            confidence: "High"
          },
          {
            question: "What is the Virtual DOM and how does it improve performance?",
            reason: "Shows deep understanding of why React is fast — differentiator question.",
            projectExample: "FoodSathi Rendering",
            hint: "The Virtual DOM is a lightweight JavaScript copy of the real DOM. When state changes, React creates a new Virtual DOM, diffs it against the previous one (reconciliation), and updates ONLY the changed nodes in the real DOM. This is much faster than manipulating the real DOM directly because DOM operations are expensive. React batches multiple updates together for efficiency.",
            confidence: "High"
          },
          {
            question: "How do you fetch data from an API in React?",
            reason: "JD requires API integration — they need to know you can connect frontend to backend.",
            projectExample: "FoodSathi Swiggy API",
            hint: "Use fetch() or axios inside useEffect with an async function. Always handle loading, success, and error states. Pattern: set loading=true, call await fetch(url), parse JSON, set data, catch errors, set loading=false in finally. In Applied.AI, you use TanStack React Query's useMutation which handles all these states automatically.",
            confidence: "High"
          },
          {
            question: "What is component-based architecture?",
            reason: "JD explicitly mentions this as a required qualification.",
            projectExample: "FoodSathi Structure",
            hint: "Component-based architecture means breaking the UI into small, self-contained, reusable pieces. Each component handles its own rendering, state, and logic. Components can be composed together like building blocks. Benefits: reusability (use the same Card component everywhere), maintainability (change one component without affecting others), testability (test each piece independently). FoodSathi has 15+ components organized in folders.",
            confidence: "High"
          },
          {
            question: "Explain the concept of state management. When would you use Redux vs Context API?",
            reason: "JD lists Redux and Context API as plus skills.",
            projectExample: "Applied.AI Zustand Store",
            hint: "State management handles data that needs to be shared across multiple components. Context API is built into React — good for simple global state like themes or auth. Redux is for complex apps with lots of state changes — it uses actions, reducers, and a single store. Zustand (used in Applied.AI) is a modern alternative that's simpler than Redux but more powerful than Context. Use Context for small apps, Redux/Zustand for complex ones.",
            confidence: "Medium"
          },
          {
            question: "How do you make a React app responsive?",
            reason: "JD requires building responsive web applications.",
            projectExample: "FoodSathi Responsive UI",
            hint: "Use CSS media queries, Flexbox, and CSS Grid for responsive layouts. Use relative units (rem, %, vw) instead of fixed px. FoodSathi uses Tailwind's responsive breakpoints (sm:, md:, lg:) which generate media queries under the hood. Test on Chrome DevTools device toolbar. Use CSS Grid's auto-fit with minmax() for card grids that automatically adjust columns based on screen width.",
            confidence: "High"
          },
          {
            question: "What is Git and how do you use it in your projects?",
            reason: "JD lists Git as a preferred skill.",
            projectExample: "Applied.AI GitHub Repo",
            hint: "Git is a version control system that tracks code changes. Key commands: git init (start repo), git add . (stage changes), git commit -m 'message' (save changes), git push origin main (upload to GitHub), git pull (download latest). Branching lets you work on features without breaking main code. Both FoodSathi and Applied.AI are pushed to GitHub with meaningful commit messages for each development day.",
            confidence: "High"
          }
        ]
      });
    }, 2500);
  });
}

// Simple text parser to extract company name from JD
function extractCompanyName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/company\s*:\s*(.+)/i);
    if (match) return match[1].trim();
  }
  for (const line of lines) {
    const match = line.match(/about\s+(.+?)[\s:]/i);
    if (match && match[1].length < 40) return match[1].trim();
  }
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 50 && !line.includes(':') && !line.toLowerCase().includes('role')) {
      return line;
    }
  }
  return "Unknown Company";
}

// Simple text parser to extract role title from JD
function extractRoleTitle(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines[0] && lines[0].length < 60) return lines[0];
  for (const line of lines) {
    const match = line.match(/(role|position|title)\s*:\s*(.+)/i);
    if (match) return match[2].trim();
  }
  return "Frontend Developer";
}

export const analyzeRepoContent = async (repoData) => {
  if (!groq) return null;

  const prompt = `
    You are a technical project analyst. I am providing you with info about a GitHub repository.
    Your goal is to extract technical details and structure them for my professional portfolio.

    REPO INFO:
    Name: ${repoData.name}
    Description: ${repoData.description}
    Main Language: ${repoData.language}
    Topics: ${repoData.topics?.join(', ')}

    PACKAGE.JSON (Dependency list):
    ${repoData.packageJson || 'N/A'}

    README CONTENT:
    ${repoData.readme}

    STRICT JSON OUTPUT ONLY (No conversational text):
    - Scan the PACKAGE.JSON list above to find libraries (Tailwind, Supabase, etc).
    {
      "name": "${repoData.name}",
      "type": "Short description of the app type (e.g. Full-Stack E-commerce, AI SaaS)",
      "stack": "Comma separated list of core technologies used (React, Tailwind, Node, etc)",
      "keyFeatures": "Comma separated list of 3-4 top technical features",
      "challengesSolved": "Comma separated list of 2-3 technical challenges this project likely solved or addressed"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODELS_TO_TRY[0],
      temperature: 0.2,
    });

    const content = chatCompletion.choices[0]?.message?.content || '';
    
    // Improved extraction: Find the first { and the last }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in AI response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Repo Analysis Error:", error);
    return null;
  }
};


