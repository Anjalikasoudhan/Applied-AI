import { GoogleGenerativeAI } from "@google/generative-ai";
import { getProjectContext } from "./projectContextService";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `
You are an expert technical recruiter and senior engineering manager.
Given a Job Description (JD) and a Candidate's Project Context, your goal is to analyze the JD and match it against the candidate's existing projects.

IMPORTANT RULES:
- Generate AT LEAST 6 projectBridgeNotes (aim for 8-10)
- Generate AT LEAST 10 interviewQuestions (aim for 12-15)
- Each hint must be a DETAILED 3-4 sentence answer guide, not a one-liner
- Every skill in mustHaveSkills and niceToHaveSkills must appear in EITHER matchedSkills or missingSkills

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
      "talkingPoint": "Detailed 2-3 sentence explanation of how to discuss this in the interview."
    }
  ],
  "interviewQuestions": [
    {
      "question": "How did you manage state in your cart system?",
      "reason": "JD asks for state management, FoodSathi uses it.",
      "projectExample": "FoodSathi Cart",
      "hint": "Detailed 3-4 sentence answer guide with specific technical details.",
      "confidence": "High"
    }
  ]
}
Ensure the output is strictly valid JSON, starting with { and ending with }. No \`\`\`json wrappers.
`;

const MODELS_TO_TRY = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];

export const analyzeJobDescription = async (jdText) => {
  if (!genAI || apiKey === 'your_gemini_api_key_here') {
    console.warn("No active Gemini API key found. Falling back to Mock data.");
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
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: SYSTEM_PROMPT
      });

      const result = await model.generateContent(userPrompt);
      const responseText = result.response.text();
      
      try {
        const cleaned = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        return JSON.parse(cleaned);
      } catch(e) {
        console.error("Failed to parse Gemini JSON:", e, responseText);
        throw new Error("AI returned malformed JSON");
      }

    } catch (error) {
      if (modelName !== MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
        console.warn(`Model ${modelName} failed, trying next model...`);
        continue;
      }
      
      console.warn("All AI models failed. Using demo data. Try again in 30+ seconds for live AI.");
      return getMockAnalysis(jdText);
    }
  }
};

// Rich demo fallback data
function getMockAnalysis(text) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        companyName: "Deccan AI Experts",
        roleTitle: "Frontend Developer – HTML/CSS",
        summary: "A remote, high-impact role focused on evaluating and annotating AI-generated frontend code. You'll review HTML/CSS outputs for correctness, accessibility, and responsiveness while collaborating with cutting-edge AI teams.",

        mustHaveSkills: ["HTML5", "CSS3", "Semantic markup", "Flexbox", "CSS Grid", "Responsive design", "Accessibility standards (WCAG)", "Cross-browser compatibility"],
        niceToHaveSkills: ["ARIA basics", "Frontend workflows", "Design-to-code translation", "Mobile-first development"],

        matchedSkills: ["HTML5", "CSS3", "Responsive design", "Semantic markup", "Flexbox", "CSS Grid", "Mobile-first development", "Frontend workflows"],
        missingSkills: ["Accessibility standards (WCAG)", "Cross-browser compatibility", "ARIA basics", "Design-to-code translation"],

        matchScore: 70,
        categoryScores: {
          frontend: 85,
          backend: 30,
          tools: 55,
          projectRelevance: 72
        },

        projectBridgeNotes: [
          {
            jdRequirement: "Responsive design & mobile-first development",
            projectFeatureMatch: "FoodSathi Responsive UI",
            talkingPoint: "Explain how FoodSathi was built mobile-first using Tailwind's responsive breakpoints (sm:, md:, lg:). Mention media queries and how the restaurant listing grid adapts from 1 column on mobile to 3 columns on desktop. Show how you tested on multiple screen sizes."
          },
          {
            jdRequirement: "Semantic HTML5 markup",
            projectFeatureMatch: "FoodSathi Component Structure",
            talkingPoint: "Discuss how you structured FoodSathi's layout using semantic elements like <header>, <nav>, <main>, <section>, and <footer> instead of generic <div> wrappers. Relate this to better SEO and screen reader support."
          },
          {
            jdRequirement: "Modern CSS layout techniques (Flexbox, Grid)",
            projectFeatureMatch: "FoodSathi Menu Grid & Cart Layout",
            talkingPoint: "Walk through how the restaurant menu uses CSS Grid for the item cards and Flexbox for the cart sidebar alignment. Explain the difference: Grid = 2D layouts, Flexbox = 1D alignment."
          },
          {
            jdRequirement: "Review AI-generated frontend code for quality",
            projectFeatureMatch: "Applied.AI Dashboard (This Project!)",
            talkingPoint: "Mention that you literally built an AI-powered tool (Applied.AI) that generates and processes frontend code analysis. You understand how AI outputs HTML/CSS and have hands-on experience evaluating structured AI responses."
          },
          {
            jdRequirement: "Evaluate styling for consistency, spacing, typography",
            projectFeatureMatch: "FoodSathi Design System",
            talkingPoint: "Explain how FoodSathi uses CSS custom properties (--primary, --background, etc.) for consistent theming, and how you established a spacing and typography scale using Tailwind's design tokens."
          },
          {
            jdRequirement: "Provide detailed feedback on improper semantics & inefficient CSS",
            projectFeatureMatch: "Applied.AI Prompt Engineering",
            talkingPoint: "In Applied.AI, you engineered prompts that force AI to return structured, clean outputs. Discuss how you identify bad patterns like div-soup, inline styles, and redundant CSS rules, and how you provide constructive feedback to fix them."
          },
          {
            jdRequirement: "Assess layouts for accessibility and WCAG compliance",
            projectFeatureMatch: "FoodSathi Accessible Navigation",
            talkingPoint: "Talk about how FoodSathi's navigation uses proper focus states, keyboard navigation with tab/enter keys, and contrast-compliant color pairs. Acknowledge WCAG is a growth area and show eagerness to deepen that knowledge."
          },
          {
            jdRequirement: "Help train AI models by reviewing frontend prompts",
            projectFeatureMatch: "Applied.AI Gemini Integration",
            talkingPoint: "You have first-hand experience writing system prompts for Google Gemini that generate frontend analysis. You understand how prompt quality directly affects AI output quality — exactly the skill Deccan AI needs."
          }
        ],

        interviewQuestions: [
          {
            question: "What is semantic HTML and why does it matter?",
            reason: "The JD explicitly requires 'semantic markup evaluation'. This is foundational to the role.",
            projectExample: "FoodSathi Component Structure",
            hint: "Semantic HTML uses meaningful tags like <article>, <nav>, <section>, <header> instead of generic <div>s. Benefits: (1) Better for SEO because search engines understand your page structure, (2) Better for accessibility because screen readers can navigate by sections and landmarks, (3) Better for code readability and maintainability. In FoodSathi, you used <nav> for navigation, <main> for content, and <section> for menu categories.",
            confidence: "High"
          },
          {
            question: "Explain the difference between Flexbox and CSS Grid. When would you use each?",
            reason: "JD requires 'modern layout techniques (Flexbox, Grid)'. They will test if you understand both.",
            projectExample: "FoodSathi Menu & Cart Layout",
            hint: "Flexbox is one-dimensional — it arranges items in a row OR column. Use it for navbars, aligning buttons, centering content vertically or horizontally. CSS Grid is two-dimensional — it controls rows AND columns simultaneously. Use it for full page layouts, card grids, and dashboards. In FoodSathi, the restaurant card grid uses CSS Grid (auto-fit with 3 columns on desktop), while the cart items inside use Flexbox to stack vertically.",
            confidence: "High"
          },
          {
            question: "How do you ensure a website is accessible to users with disabilities?",
            reason: "JD specifically lists WCAG and ARIA as required qualifications. This is a core responsibility of the role.",
            projectExample: "FoodSathi & Applied.AI",
            hint: "Key practices: (1) Use semantic HTML so screen readers understand structure, (2) Add alt text to all images, (3) Ensure sufficient color contrast (WCAG AA requires 4.5:1 ratio for normal text), (4) Make all interactive elements keyboard navigable using tab, enter, and escape keys, (5) Use ARIA labels when HTML semantics aren't enough (e.g., aria-label on icon-only buttons, aria-expanded on accordions). Mention that you're actively learning WCAG 2.1 AA guidelines.",
            confidence: "High"
          },
          {
            question: "How would you make a layout responsive without using a CSS framework?",
            reason: "Tests deep CSS knowledge beyond framework dependence — critical for evaluating AI-generated vanilla CSS.",
            projectExample: "FoodSathi Responsive UI",
            hint: "Use media queries: @media (max-width: 768px) { ... } to adjust layouts at breakpoints. Use relative units (rem, em, %, vw/vh) instead of fixed px values. Use max-width on containers instead of fixed width. Use CSS Grid's auto-fit/auto-fill with minmax() for responsive card grids without any media queries. Always include the viewport meta tag: <meta name='viewport' content='width=device-width, initial-scale=1'>. Test on Chrome DevTools device toolbar.",
            confidence: "Medium"
          },
          {
            question: "What common mistakes do you see in AI-generated HTML/CSS code?",
            reason: "This IS the job. They want to know you can identify and fix AI code quality issues.",
            projectExample: "Applied.AI (This Project)",
            hint: "Common AI mistakes: (1) Overuse of <div> instead of semantic tags like <section>, <article>, <nav>, (2) Inline styles everywhere instead of class-based modular CSS, (3) Missing alt attributes on <img> tags, (4) Non-responsive fixed-width layouts using px everywhere, (5) Redundant/duplicate CSS rules, (6) Incorrect heading hierarchy — skipping from h1 to h4, (7) Poor color contrast ratios that fail WCAG. You can confidently discuss this because you built Applied.AI to analyze and improve AI outputs.",
            confidence: "High"
          },
          {
            question: "What is the CSS box model? Explain each layer.",
            reason: "Fundamental CSS concept. Every frontend role tests this as a baseline knowledge check.",
            projectExample: "FoodSathi Card Components",
            hint: "The box model has 4 layers from inside out: (1) Content — the actual text/image, (2) Padding — space between content and border, (3) Border — the visible edge of the element, (4) Margin — space between this element and neighboring elements. By default, width/height only affect the content area. Use box-sizing: border-box to make width/height include padding and border, which is industry standard. In FoodSathi, every card uses border-box sizing with consistent padding.",
            confidence: "High"
          },
          {
            question: "What is the difference between display: none and visibility: hidden?",
            reason: "Common CSS gotcha question that tests attention to detail — exactly the skill needed for code review.",
            projectExample: "FoodSathi Mobile Menu",
            hint: "display: none completely removes the element from the document flow — it takes up zero space and screen readers skip it. visibility: hidden makes the element invisible but it still occupies space in the layout. A third option is opacity: 0, which also keeps the space but the element can still be clicked/interacted with. For accessible hiding, use a .sr-only class with position: absolute and clip instead.",
            confidence: "High"
          },
          {
            question: "How do you approach cross-browser compatibility testing?",
            reason: "JD lists 'cross-browser compatibility' as a must-have skill.",
            projectExample: "FoodSathi UI Testing",
            hint: "Test on Chrome, Firefox, Safari, and Edge at minimum. Use Can I Use (caniuse.com) to check CSS property support before using new features. Add vendor prefixes (-webkit-, -moz-) where needed, or use autoprefixer in build tools. Avoid relying on very new CSS features without fallbacks. Use CSS reset/normalize to ensure consistent base styles across browsers. Test on both Mac and Windows since Safari rendering differs.",
            confidence: "Medium"
          },
          {
            question: "Explain CSS specificity and how conflicts are resolved.",
            reason: "Essential for reviewing and debugging CSS — directly relevant to evaluating AI-generated stylesheets.",
            projectExample: "FoodSathi Styling Architecture",
            hint: "CSS specificity determines which rule wins when multiple rules target the same element. Specificity ranking (lowest to highest): (1) Element selectors like div, p = 0,0,1, (2) Class selectors like .card = 0,1,0, (3) ID selectors like #header = 1,0,0, (4) Inline styles = highest, (5) !important overrides everything. When two rules have equal specificity, the last one in the stylesheet wins. Best practice: avoid IDs and !important, use class-based BEM methodology for predictable specificity.",
            confidence: "High"
          },
          {
            question: "What are ARIA attributes and when should you use them?",
            reason: "JD lists 'ARIA basics' as a nice-to-have. Showing knowledge here will set you apart from other candidates.",
            projectExample: "Applied.AI Interactive Components",
            hint: "ARIA (Accessible Rich Internet Applications) attributes add meaning to HTML elements for assistive technologies. Common examples: aria-label provides a text label for icon-only buttons, aria-expanded tells screen readers if an accordion is open/closed, aria-hidden='true' hides decorative elements from screen readers, role='button' on non-button elements that act as buttons. The first rule of ARIA: don't use ARIA if a native HTML element already provides the semantics (use <button> instead of <div role='button'>).",
            confidence: "Medium"
          }
        ]
      });
    }, 2500);
  });
}
