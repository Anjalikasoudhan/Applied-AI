# Applied.AI — Complete Project Explanation & Interview Q&A

---

## PART 1: What is this project?

**Applied.AI** is an AI-powered career intelligence dashboard. Think of it as a smart assistant that helps job seekers understand exactly what a company wants and how well they match.

### The Problem It Solves:
When you read a job description on LinkedIn, it's a wall of text. You don't know:
- Which skills are absolutely required vs just "nice to have"?
- How many of those skills do you already have?
- Which of your projects prove those skills?
- What questions will they ask in the interview?

### How Applied.AI Solves It:
1. You **paste** a job description
2. AI **analyzes** it and extracts all requirements
3. It **compares** those requirements against your existing projects (like FoodSathi)
4. It gives you a **match score** (e.g., 82%)
5. It generates **interview questions** you're likely to face
6. It **saves** everything so you can revisit later

---

## PART 2: The Tech Stack (What We're Using & Why)

### React (The UI Framework)
- **What:** A JavaScript library for building user interfaces using reusable components
- **Why we chose it:** Industry standard, component-based architecture makes code organized, massive ecosystem
- **In our project:** Every `.jsx` file is a React component (Navbar, DashboardPage, JobDescriptionInput, etc.)

### Vite (The Build Tool)
- **What:** A super-fast development server and bundler
- **Why we chose it:** 10x faster than Create React App. Hot Module Replacement (HMR) means when you save a file, the browser updates instantly without full page reload
- **In our project:** `vite.config.js` configures it. When you run `npm run dev`, Vite starts the server

### Tailwind CSS (The Styling System)
- **What:** A utility-first CSS framework. Instead of writing `.my-button { padding: 8px; color: blue; }`, you write `className="p-2 text-blue-500"` directly in JSX
- **Why we chose it:** Faster development, consistent design, easy responsive design, no messy CSS files
- **In our project:** `src/index.css` defines our color variables. Every component uses Tailwind classes

### Zustand (Global State Management)
- **What:** A tiny library that creates a "global backpack" of data accessible from any component
- **Why we chose it:** Simpler than Redux (no boilerplate), better than Context API (no unnecessary re-renders)
- **In our project:** `src/store/useJobAnalysisStore.js` — stores the analysis result, loading state, and errors

### TanStack React Query (API State Management) 
- **What:** A library that manages the lifecycle of API calls — loading, success, error, retry, caching
- **Why we chose it:** Writing `fetch()` + `useState` + `try/catch` + loading flags manually in every component is messy and error-prone. React Query handles ALL of that automatically
- **In our project:** `src/hooks/useAnalyzeJob.js` — wraps our Gemini API call in `useMutation`

### Framer Motion (Animations)
- **What:** A React animation library. You wrap elements in `<motion.div>` and declare where they start and end
- **Why we chose it:** Makes the UI feel premium and alive. Recruiters notice polished apps
- **In our project:** Hero text slides down, input card fades up, results animate in

### Google Gemini API (The AI Brain)
- **What:** Google's large language model (LLM) that can understand and analyze text
- **Why we chose it:** Free tier available, excellent at structured JSON output, industry-relevant skill (AI integration)
- **In our project:** `src/services/geminiService.js` — sends the JD + your projects to Gemini, gets back structured analysis

### Supabase (Database — coming Day 7)
- **What:** An open-source Firebase alternative. Gives you a PostgreSQL database + auth + APIs instantly
- **Why we chose it:** Free tier, real SQL database (not NoSQL), easy JavaScript SDK

### Recharts (Charts — coming Day 5)
- **What:** A React charting library built on D3.js
- **Why we chose it:** Easiest chart library for React, responsive, customizable

---

## PART 3: How Every File Works

### The Flow (Step by Step)

```
User opens app
    → main.jsx bootstraps React + Providers
        → App.jsx sets up routing
            → DashboardPage.jsx renders the hero + input form
                → User pastes JD and clicks "Generate Intel"
                    → useAnalyzeJob hook fires useMutation
                        → geminiService.js sends data to Google Gemini AI
                            → projectContextService.js provides your project data
                        → Gemini returns JSON analysis
                    → Zustand store saves the result
                → DashboardPage re-renders with the analysis data
```

### File-by-File Breakdown:

---

#### `main.jsx` — The Entry Point
```
What it does: Boots up the entire application
```
- Creates the React root element
- Wraps everything in 3 providers:
  - `<React.StrictMode>` — Catches bugs during development
  - `<QueryClientProvider>` — Makes TanStack React Query available everywhere
  - `<BrowserRouter>` — Enables URL-based page navigation

**Interview tip:** "main.jsx is purely configuration. It doesn't render any UI itself."

---

#### `App.jsx` — The Router Shell
```
What it does: Decides which page to show based on the URL
```
- `/` → Shows `DashboardPage`
- `/history` → Shows History placeholder (Day 7)
- Also renders the `Navbar` (always visible on every page)
- Contains the gradient background effects (the subtle blue glow)

**Interview tip:** "App.jsx is the layout container. The Navbar stays fixed while the page content swaps based on the route."

---

#### `Navbar.jsx` — The Navigation Bar
```
What it does: Top navigation with logo, links, and user badge
```
- Uses `react-router-dom`'s `<Link>` for client-side navigation (no full page reload)
- `backdrop-blur` creates frosted glass effect
- `sticky top-0 z-50` keeps it pinned at the top while scrolling
- Icons come from `lucide-react` (modern, lightweight icon library)

---

#### `DashboardPage.jsx` — The Main Page
```
What it does: The homepage that orchestrates everything
```
- Renders the Hero section (big title + description)
- Renders the `JobDescriptionInput` form
- When form submits → calls `useAnalyzeJob` hook
- Displays error banner if API fails
- Displays raw JSON result when analysis completes

**Key code pattern — Zustand consumption:**
```js
const { currentAnalysis, isAnalyzing, error } = useJobAnalysisStore();
```
This line "subscribes" to the global store. Whenever `currentAnalysis` changes, this component automatically re-renders.

---

#### `JobDescriptionInput.jsx` — The Input Form
```
What it does: Beautiful textarea where users paste Job Descriptions
```
- **Controlled input:** React owns the textarea value via `useState`
- **Props pattern:** Receives `onAnalyze` (callback) and `isAnalyzing` (boolean) from parent
- **Disabled state:** When analyzing, the textarea and button become unclickable
- **Visual effects:** Glowing border on hover using absolute positioned gradient div with blur

**Key concept — Lifting State Up:**
The input doesn't call the API itself. It just calls `onAnalyze(text)` which the parent handles. This keeps the component "dumb" and reusable.

---

#### `useJobAnalysisStore.js` — The Zustand Store
```
What it does: Global data container accessible from any component
```
- `currentAnalysis` — The JSON result from Gemini (null initially)
- `isAnalyzing` — Boolean loading flag
- `error` — Error message string (null if no error)
- `setAnalysis(data)` — Saves result AND sets loading to false
- `setAnalyzing(true/false)` — Toggles loading state
- `setError(msg)` — Saves error AND sets loading to false
- `clearAnalysis()` — Resets everything back to null

**How Zustand works internally:**
```js
const store = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```
`set()` merges new values into the existing state (like `setState` in class components).

---

#### `useAnalyzeJob.js` — The TanStack Query Hook
```
What it does: Manages the full API call lifecycle
```
- `useMutation` wraps our API call
- `mutationFn` — The async function that actually calls `analyzeJobDescription(jdText)`
- `onSuccess` — Fires when API responds successfully → saves to Zustand
- `onError` — Fires when API crashes → saves error to Zustand
- Returns `{ mutate }` which we rename to `executeAnalysis`

**Why useMutation instead of useQuery?**
- `useQuery` = automatic data fetching (runs on mount, auto-refreshes)
- `useMutation` = user-triggered action (runs only when you call `mutate()`)

Analyzing a JD is a user action, not background data loading. That's why we use `useMutation`.

---

#### `geminiService.js` — The AI Integration
```
What it does: Sends data to Google's Gemini AI and parses the response
```

**The System Prompt** (most important part):
We give the AI a detailed persona and strict output rules:
- "You are an expert technical recruiter"
- "Return STRICT JSON without markdown wrappers"
- We define the exact JSON shape we expect

**The User Prompt:**
We combine two things:
1. The candidate's project context (from `projectContextService.js`)
2. The pasted job description

**Defensive parsing:**
```js
const cleaned = responseText.replace(/```json/m, '').replace(/```$/m, '').trim();
return JSON.parse(cleaned);
```
AI models sometimes wrap JSON in markdown code blocks even when told not to. We strip those before parsing.

**Mock fallback:**
If no API key exists, `getMockAnalysis()` returns hardcoded demo data after 2.5 seconds. This ensures the app always works, even without internet.

---

#### `projectContextService.js` — The Mock MCP Layer
```
What it does: Provides your project portfolio data to the AI
```
- Currently hardcodes FoodSathi and Budget Buddy projects
- Returns project name, tech stack, key features, and challenges
- On Day 6, we'll make this dynamic (users input their own projects)
- In a production app, this would use MCP (Model Context Protocol) to securely read actual local project files

---

## PART 4: Key Architecture Concepts

### Separation of Concerns
```
Components (*.jsx)  → Handle what the user SEES
Hooks (useAnalyzeJob.js) → Handle LOGIC and API coordination  
Services (geminiService.js) → Handle EXTERNAL communication
Store (useJobAnalysisStore.js) → Handle SHARED DATA
```
Each layer has exactly ONE job. This makes the code testable, readable, and maintainable.

### The Provider Pattern (main.jsx)
We wrap our app in multiple providers:
```jsx
<QueryClientProvider>      ← Makes React Query work everywhere
  <BrowserRouter>          ← Makes routing work everywhere  
    <App />
  </BrowserRouter>
</QueryClientProvider>
```
Providers are like "power outlets" — they make capabilities available to all child components without explicitly passing props.

### Client-Side Routing
When you click "History" in the Navbar, the page doesn't reload. React Router intercepts the click, changes the URL, and swaps the component. This is called a **Single Page Application (SPA)**.

---

## PART 5: Exhaustive Interview Questions & Answers

### 🔵 About the Project Overall

**Q: What is Applied.AI?**
> It's an AI-powered career intelligence dashboard. Users paste a job description, and the app uses Google's Gemini AI to extract required skills, calculate a match score against the user's existing projects, identify skill gaps, and generate likely interview questions.

**Q: Why did you build this?**
> I wanted to solve a real problem I faced — reading job descriptions and not knowing how well I matched. Instead of building another todo app, I built something that demonstrates real AI integration, modern state management, and production-grade architecture.

**Q: What makes this different from other portfolio projects?**
> Three things: (1) It integrates a live AI API with proper prompt engineering, (2) It uses professional state management patterns with Zustand + TanStack Query instead of just useState, (3) It has a service layer architecture that separates concerns cleanly.

**Q: Walk me through the user flow.**
> The user lands on the dashboard, pastes a job description into the textarea, and clicks "Generate Intel". This triggers a TanStack Query mutation that calls our Gemini service. The service combines the JD text with the user's project context and sends it to Google's Gemini 2.5 Flash model with a carefully engineered prompt. The AI returns structured JSON containing matched skills, missing skills, a match score, and interview questions. This data gets saved to our Zustand global store, which triggers a React re-render showing the analysis results.

---

### 🟢 About React

**Q: Why React over Angular or Vue?**
> React has the largest ecosystem, most job demand, and its component model is intuitive. Also, React 19 brings performance improvements and better server component support.

**Q: Explain the difference between props and state.**
> Props are data passed DOWN from parent to child (read-only for the child). State is data owned BY a component that it can modify. In our app, `isAnalyzing` is state in Zustand that gets passed as a prop to `JobDescriptionInput`.

**Q: What is a controlled component?**
> An input whose value is controlled by React state. Our textarea uses `value={jdText}` and `onChange={(e) => setJdText(e.target.value)}`. React is the "single source of truth" for the input's value.

**Q: What is lifting state up?**
> Moving state from a child component to its parent so siblings can share it. Our `JobDescriptionInput` doesn't manage the API call itself — it lifts the JD text up to `DashboardPage` via the `onAnalyze` callback.

**Q: What are React hooks?**
> Functions that let you use React features (state, effects, context) in functional components. `useState`, `useEffect`, `useMemo` are built-in hooks. `useAnalyzeJob` and `useJobAnalysisStore` are custom hooks we built.

**Q: What's the difference between useEffect and useMutation?**
> `useEffect` runs side effects when dependencies change (like fetching data on mount). `useMutation` from TanStack Query is specifically designed for user-triggered async actions with built-in loading/error/success handling. We use `useMutation` because analyzing a JD is triggered by a button click, not component mount.

---

### 🟡 About Zustand

**Q: What is Zustand and why did you use it?**
> Zustand is a lightweight state management library. It creates a global store that any component can read from without prop drilling. I chose it over Redux because it has zero boilerplate — no reducers, no action types, no dispatch, no Provider wrapper needed.

**Q: How does Zustand prevent unnecessary re-renders?**
> When you write `const isAnalyzing = useJobAnalysisStore(state => state.isAnalyzing)`, the component ONLY re-renders when `isAnalyzing` changes. If `currentAnalysis` changes, this component won't re-render. Context API re-renders ALL consumers on ANY change.

**Q: Show me how you'd add a new piece of state to the store.**
> Simple:
> ```js
> export const useJobAnalysisStore = create((set) => ({
>   // existing state...
>   theme: 'dark',
>   setTheme: (t) => set({ theme: t })
> }));
> ```

**Q: Where does Zustand store the data?**
> In JavaScript memory (a closure). It's not localStorage or a database. When you refresh the page, the state resets. For persistence, we'll use Supabase on Day 7.

---

### 🔴 About TanStack React Query

**Q: What problem does React Query solve?**
> Managing server/async state is complex — you need loading flags, error handling, caching, retry logic, and race condition prevention. React Query handles ALL of this out of the box instead of writing manual `useState` + `useEffect` + `try/catch` in every component.

**Q: Explain useMutation vs useQuery.**
> `useQuery` = "fetch this data and keep it fresh" (GET requests, auto-refetch). `useMutation` = "do this action when I tell you to" (POST/PUT/DELETE, manual trigger). We use `useMutation` because analyzing a JD is a deliberate user action.

**Q: What is the QueryClient?**
> It's the central cache manager. It stores all cached query results and provides methods to invalidate or update cached data. We create it in `main.jsx` and share it via `<QueryClientProvider>`.

---

### 🟣 About Gemini AI Integration

**Q: What is prompt engineering?**
> The practice of crafting precise instructions for an AI model to control its output format, persona, and behavior. It's like writing very detailed requirements for a contractor — the more specific you are, the better the output.

**Q: How do you ensure the AI returns valid JSON?**
> Three layers of defense: (1) The system prompt explicitly says "Return strict JSON, no markdown wrappers, start with { end with }". (2) We provide the exact JSON schema in the prompt. (3) We defensively strip any accidental markdown wrapping before `JSON.parse()`.

**Q: What happens if the AI returns garbage?**
> Our `try/catch` catches the `JSON.parse()` error and throws a readable message "AI returned malformed JSON". The `onError` handler in our TanStack mutation catches this and displays a user-friendly error banner.

**Q: What is a system prompt vs user prompt?**
> System prompt = permanent instructions that define HOW the AI should behave (its persona, output rules). User prompt = the actual data/question for THIS specific request. System prompt stays the same across all requests; user prompt changes every time.

**Q: Why do you send the candidate's project data along with the JD?**
> Without context about the user's skills, the AI can only analyze the JD in isolation. By including project data (tech stack, features built, challenges solved), the AI can intelligently map which JD requirements the user already covers and which they're missing.

**Q: What is the mock fallback and why does it exist?**
> If no API key is configured, `getMockAnalysis()` returns hardcoded demo data after a 2.5s delay. This serves three purposes: (1) The app works in demo mode for recruiters viewing the portfolio, (2) Developers can build UI without burning API credits, (3) It's a standard production pattern — graceful degradation.

---

### 🟠 About Architecture & Design Decisions

**Q: Why do you separate services, hooks, and components?**
> **Separation of Concerns.** Services handle external APIs (testable without React). Hooks handle business logic (reusable across pages). Components handle UI (focused, simple). This makes the code maintainable, testable, and scalable.

**Q: What is MCP (Model Context Protocol)?**
> It's an emerging standard that allows AI applications to securely read local files and project data. In our app, `projectContextService.js` is structured to be MCP-compatible — currently it returns hardcoded data, but the interface is designed so a real MCP integration could be swapped in without changing any other code.

**Q: How would you deploy this to production?**
> Frontend: Deploy to Vercel (integrates perfectly with Vite). Environment variables set in Vercel dashboard. Database: Supabase is already cloud-hosted. For security, the Gemini API key should move to a serverless backend function (Vercel Edge Functions) so it's never exposed in the browser.

**Q: What would you improve if you had more time?**
> (1) Move the API key to a server-side function for security, (2) Add user authentication with Supabase Auth, (3) Add real MCP integration for local project scanning, (4) Add PDF export for analysis reports, (5) Add comparison view for multiple JD analyses.

---

### ⚫ About Tailwind CSS

**Q: How does your theming/dark mode work?**
> We define CSS custom properties in `index.css` like `--primary: 221.2 83.2% 53.3%`. When the `.dark` class is added to the HTML, all variables swap to dark values. Tailwind reads these variables via `@theme` directives. One class toggle = entire app theme change.

**Q: What does `bg-primary/10` mean?**
> It's `background-color: primary color at 10% opacity`. Tailwind's slash syntax applies transparency. We use this extensively for subtle tinted backgrounds.

**Q: What does `backdrop-blur-xl bg-background/95` do?**
> Creates a "frosted glass" (glassmorphism) effect. Content behind the element gets blurred, and the element itself is 95% opaque. This is used in our Navbar.

---

### ⚪ About Environment & Security

**Q: Why is .env in .gitignore?**
> `.env` contains secret API keys. If pushed to GitHub, anyone can steal them and rack up charges on your account. We gitignore it and provide `.env.example` with placeholder values so other developers know what variables to set.

**Q: What does the VITE_ prefix do?**
> Vite only exposes environment variables starting with `VITE_` to the browser-side code via `import.meta.env`. This prevents accidentally exposing server-only secrets.

**Q: Is it safe to put the Gemini API key in the frontend?**
> For a portfolio demo, yes. For production, NO. The key should live in a server-side function (like Vercel Edge Functions or Express.js). The browser should call YOUR backend, and YOUR backend calls Gemini. This prevents users from inspecting the key in browser DevTools.

---

## PART 6: Common "Gotcha" Questions

**Q: What happens if two components read from Zustand at the same time?**
> Both get the same data. Zustand is a shared store. When the data changes, both components re-render with the new value. There's no conflict.

**Q: What happens if the user clicks "Analyze" twice quickly?**
> The button is disabled while `isAnalyzing` is true, preventing double submissions. TanStack Query also handles this — if a mutation is in-flight, calling `mutate()` again will queue the new request.

**Q: What if the internet goes down during analysis?**
> The `fetch` call inside the Gemini SDK will throw a network error. Our `onError` handler catches it and shows "Analysis Failed" with the error message. The app doesn't crash.

**Q: Why not use Redux?**
> Redux requires: action types (strings), action creators (functions), reducers (switch statements), a store configuration, a Provider wrapper, and middleware for async operations. Zustand achieves the same result in 10 lines. For a small-to-medium app like ours, Redux is massive overkill.

**Q: Why not just use Context API instead of Zustand?**
> Context API re-renders EVERY component that consumes the context whenever ANY value in it changes. If I update `isAnalyzing`, every component reading `currentAnalysis` also re-renders unnecessarily. Zustand uses selectors to only re-render components that care about the specific value that changed.
