/**
 * securityUtils.js
 * 
 * Production security helper functions for input sanitization, rate limiting,
 * prompt injection defense, and URL validation.
 */

// Memory store for client-side rate limiting
const rateLimitStore = new Map();

/**
 * Enforces client-side cooldown rate limiting for costly operations.
 * @param {string} key - Unique action identifier (e.g. 'analyze_job', 'github_fetch')
 * @param {number} cooldownMs - Cooldown period in milliseconds
 * @returns {{ allowed: boolean, remainingMs: number }}
 */
export const checkRateLimit = (key, cooldownMs = 3000) => {
  const now = Date.now();
  const lastCall = rateLimitStore.get(key) || 0;
  const elapsed = now - lastCall;

  if (elapsed < cooldownMs) {
    return {
      allowed: false,
      remainingMs: cooldownMs - elapsed,
    };
  }

  rateLimitStore.set(key, now);
  return { allowed: true, remainingMs: 0 };
};

/**
 * Sanitizes user input for Job Description analysis.
 * Prevents prompt injection, trims input, removes dangerous control characters, and caps size.
 * @param {string} input - Raw JD text
 * @param {number} maxLength - Max allowed length (default 15,000)
 * @returns {string} Sanitized string
 */
export const sanitizeJdInput = (input, maxLength = 15000) => {
  if (!input || typeof input !== 'string') return '';

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Limit length to prevent payload overflow / token exhaustion
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  // 3. Strip NULL bytes and dangerous non-printable ASCII control chars
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 4. Defuse prompt injection attempts by neutralizing system instructions overrides
  clean = clean.replace(/(\b(ignore|forget|override)\s+(all|previous|above)\s+(instructions|prompts|rules)\b)/gi, '[FILTERED_TEXT]');

  return clean;
};

/**
 * Validates a GitHub URL to prevent SSRF and protocol injection.
 * @param {string} url - User-provided repository URL
 * @returns {{ isValid: boolean, owner?: string, repo?: string, error?: string }}
 */
export const validateGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL must be a valid string' };
  }

  const trimmed = url.trim();

  // Strict regex enforcing https://github.com/owner/repo structure with allowed chars
  const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_\-.]+)\/?$/;
  const match = trimmed.match(githubRegex);

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid GitHub URL format. Must be like https://github.com/owner/repository',
    };
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  // Prevent path traversal attempts in owner or repo name
  if (owner.includes('..') || repo.includes('..')) {
    return { isValid: false, error: 'Malicious path components detected' };
  }

  return { isValid: true, owner, repo };
};

/**
 * Escapes HTML characters to prevent XSS if inserting untrusted content into innerHTML.
 * @param {string} str - Raw text
 * @returns {string} Escaped text
 */
export const escapeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
