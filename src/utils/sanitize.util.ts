
/**
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
export const escapeRegex = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * @param page - Page number
 * @param limit - Items per page
 * @returns Sanitized values with defaults
 */
export const sanitizePaginationParams = (
  page?: number | string,
  limit?: number | string
): { page: number; limit: number } => {
  const sanitizedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const sanitizedLimit = Math.min(
    100,
    Math.max(1, parseInt(String(limit || 10), 10) || 10)
  );

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
  };
};

/**
 * Sanitize search query to prevent injection attacks
 * @param query - Search query string
 * @returns Sanitized query
 */
export const sanitizeSearchQuery = (query?: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove dangerous characters, limit length
  return query
    .trim()
    .substring(0, 200) // Prevent extremely long queries
    .replace(/[<>{}]/g, ''); // Remove potentially dangerous chars
};

/**
 * Build safe regex from user input
 * @param input - User input string
 * @param flags - Regex flags (default: 'i' for case-insensitive)
 * @returns Safe RegExp object
 */
export const buildSafeRegex = (input?: string, flags: string = 'i'): RegExp | null => {
  const sanitized = sanitizeSearchQuery(input);
  if (!sanitized) return null;
  
  try {
    return new RegExp(escapeRegex(sanitized), flags);
  } catch (error) {
    console.error('Failed to build regex:', error);
    return null;
  }
};
