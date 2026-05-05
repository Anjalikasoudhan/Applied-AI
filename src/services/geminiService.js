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

RULES:
- Scan ALL projects. If a technology is mentioned in any project's stack, use the dictionary above to find its parent category in the JD.
- NEVER mark "State Management" as missing if the user has Redux or Zustland.
- NEVER mark "Redux" as missing if the user has Redux Toolkit.
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
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
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
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        companyName: extractCompanyName(text),
        roleTitle: extractRoleTitle(text),
        summary: "A role focused on building modern web applications with React and frontend technologies. You'll develop responsive UIs, integrate APIs, and collaborate with cross-functional teams.",

        mustHaveSkills: ["JavaScript", "React.js", "HTML5", "CSS3", "REST APIs", "Component-based architecture", "State management", "Responsive design"],
        niceToHaveSkills: ["Redux", "Context API", "Git", "Webpack/Vite", "TypeScript"],

        matchedSkills: ["JavaScript", "React.js", "HTML5", "CSS3", "Component-based architecture", "Responsive design", "Git", "Webpack/Vite"],
        missingSkills: ["REST APIs", "State management", "Redux", "Context API", "TypeScript"],

        matchScore: 72,
        categoryScores: {
          frontend: 88,
          backend: 35,
          tools: 65,
          projectRelevance: 78
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


