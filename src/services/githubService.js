/**
 * githubService.js
 * 
 * Helper to fetch public repo info and READMEs to provide context for AI analysis.
 */

export const fetchRepoData = async (url) => {
  try {
    // 1. Parse URL to get owner and repo name
    // Format: https://github.com/owner/repo
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) throw new Error("Invalid GitHub URL format");
    
    const owner = parts[0];
    const repo = parts[1].replace('.git', '');

    // 2. Fetch basic repo info from GitHub API (Public)
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoRes.ok) throw new Error("Repository not found or private");
    const repoInfo = await repoRes.json();

    // 3. Try to fetch README from common branch names
    const branches = ['main', 'master', 'develop'];
    let readmeText = '';
    
    for (const branch of branches) {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
      if (readmeRes.ok) {
        readmeText = await readmeRes.text();
        break;
      }
    }

    return {
      name: repoInfo.name,
      description: repoInfo.description || '',
      language: repoInfo.language || '',
      topics: repoInfo.topics || [],
      readme: readmeText.substring(0, 5000), // Cap for AI context
    };
  } catch (error) {
    console.error("GitHub Fetch Error:", error);
    throw error;
  }
};
