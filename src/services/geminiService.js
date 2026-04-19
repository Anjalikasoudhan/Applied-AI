import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProjectContext } from "./projectContextService";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// Initialize the Live API if we possess the key
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// The System Prompt instructs the AI precisely on how it should behave.
// Note the explicit demand for JSON without markdown wrappers to prevent parsing crashes.
const SYSTEM_PROMPT = `
You are an expert technical recruiter and senior engineering manager.
Given a Job Description (JD) and a Candidate's Project Context, your goal is to analyze the JD and match it against the candidate's existing projects.

Extract the information into the following STRICT JSON structure without markdown wrapping:
{
  "companyName": "string or null",
  "roleTitle": "string",
  "summary": "Short 2 sentence summary of the role",
  "mustHaveSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "matchedSkills": ["skill1 from JD that Candidate has"],
  "missingSkills": ["skill1 from JD that Candidate lacks"],
  "matchScore": number (0 to 100),
  "categoryScores": {
    "frontend": number (0-100),
    "backend": number (0-100),
    "tools": number (0-100),
    "projectRelevance": number (0-100)
  },
  "projectBridgeNotes": [
    {
      "jdRequirement": "React State Management",
      "projectFeatureMatch": "FoodSathi Cart System",
      "talkingPoint": "Explain how FoodSathi uses Context/Redux to handle complex state."
    }
  ],
  "interviewQuestions": [
    {
      "question": "How did you manage state in your cart system?",
      "reason": "JD asks for state management, FoodSathi uses it.",
      "projectExample": "FoodSathi Cart",
      "hint": "Mention action dispatching and reducers.",
      "confidence": "High"
    }
  ]
}
Ensure the output is strictly valid JSON, starting with { and ending with }. No \`\`\`json wrappers.
`;

export const analyzeJobDescription = async (jdText) => {
  // Graceful fallback to Day 3 mock if API key isn't provided!
  if (!genAI || apiKey === 'your_gemini_api_key_here') {
    console.warn("No active Gemini API key found. Falling back to Mock data.");
    return getMockAnalysis(jdText);
  }

  try {
    const candidateContext = getProjectContext();
    
    // The user payload combines their context with the Job Description
    const userPrompt = `
      CANDIDATE PROJECT CONTEXT: 
      \${JSON.stringify(candidateContext)}

      ====================
      JOB DESCRIPTION:
      \${jdText}
    `;

    // 1.5-pro is the flagship reasoning model capable of analyzing dense text blocks
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    
    try {
      // Defensive parsing to strip potential markdown wrappers the AI might randomly add
      const cleaned = responseText.replace(/^^```json/m, '').replace(/```$/m, '').trim();
      return JSON.parse(cleaned);
    } catch(e) {
      console.error("Failed to parse Gemini JSON:", e, responseText);
      throw new Error("AI returned malformed JSON");
    }

  } catch (error) {
    console.error("Gemini AI API Error:", error);
    throw error;
  }
};

// Kept from Day 3 as an emergency fallback
function getMockAnalysis(text) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
         companyName: "Tech Startup Inc.",
         roleTitle: "Full-Stack Developer Internship",
         summary: "A fast-paced internship focusing on building modern web applications using React and Node.js. Expect to work on user-facing features and API integrations.",
         mustHaveSkills: ["React", "JavaScript", "Tailwind CSS", "REST APIs"],
         niceToHaveSkills: ["TypeScript", "Node.js", "Docker"],
         matchedSkills: ["React", "JavaScript", "Tailwind CSS"],
         missingSkills: ["Docker", "TypeScript"],
         matchScore: 82,
         categoryScores: { frontend: 90, backend: 60, tools: 70, projectRelevance: 85 },
         projectBridgeNotes: [
           {
             jdRequirement: "React frontend experience",
             projectFeatureMatch: "FoodSathi UI",
             talkingPoint: "Discuss how you built responsive components using Tailwind and React for FoodSathi."
           }
         ],
         interviewQuestions: [
           {
             question: "How do you handle performance optimization in React?",
             reason: "Standard startup question for frontend roles.",
             projectExample: "FoodSathi rendering",
             hint: "Mention useMemo, lazy loading, and avoiding unnecessary re-renders.",
             confidence: "High"
           }
         ]
      });
    }, 2500); 
  });
}
