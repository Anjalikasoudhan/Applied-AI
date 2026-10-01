import { validateGitHubUrl } from '../utils/securityUtils';

/**
 * githubService.js
 * 
 * Helper to fetch public repo info and READMEs to provide context for AI analysis.
 * Uses strict URL validation to prevent SSRF and protocol injection attacks.
 */

export const fetchRepoData = async (url) => {
  try {
    // 1. Validate URL to prevent SSRF or malicious protocol injection
    const validation = validateGitHubUrl(url);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid GitHub repository URL.");
    }

    const { owner, repo } = validation;

    // 2. Fetch basic repo info from GitHub API (Public)
    const repoRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    if (!repoRes.ok) throw new Error("Repository not found or private");
    const repoInfo = await repoRes.json();

    // 3. Try to fetch README and package.json from common branch names securely
    const branches = ['main', 'master', 'develop'];
    let readmeText = '';
    let packageJson = '';
    
    for (const branch of branches) {
      const encodedBranch = encodeURIComponent(branch);
      if (!readmeText) {
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodedBranch}/README.md`);
        if (readmeRes.ok) readmeText = await readmeRes.text();
      }
      
      if (!packageJson) {
        const pkgRes = await fetch(`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodedBranch}/package.json`);
        if (pkgRes.ok) packageJson = await pkgRes.text();
      }
    }

    return {
      name: repoInfo.name,
      description: repoInfo.description || '',
      language: repoInfo.language || '',
      topics: repoInfo.topics || [],
      readme: readmeText.substring(0, 5000), 
      packageJson: packageJson,
    };

  } catch (error) {
    console.error("GitHub Fetch Error:", error);
    throw error;
  }
};
