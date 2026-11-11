/**
 * Issue filtering service for filtering GitHub issues based on user profile and repository context
 */

const IssueFilterService = {
  /**
   * Filter issues based on user profile and repository context
   * @param {Array} issues - Array of issue objects from GitHub (normalized)
   * @param {Object} user - User profile object
   * @param {Object} repository - Normalized repository object (for language context)
   * @returns {Array} Filtered issues
   */
  filterIssues: (issues, user, repository) => {
    if (!issues || !Array.isArray(issues)) {
      return [];
    }

    if (!user) {
      return issues;
    }

    return issues.filter(issue =>
      IssueFilterService.matchesLanguage(issue, user, repository) &&
      IssueFilterService.matchesSkillsOrInterests(issue, user) &&
      IssueFilterService.matchesExperienceLevel(issue, user, repository) &&
      IssueFilterService.matchesAvailableTime(issue, user, repository)
    );
  },

  /**
   * Check if issue matches user's preferred languages (via repository language)
   * @param {Object} issue - Issue object
   * @param {Object} user - User profile object
   * @param {Object} repository - Repository object (contains language)
   * @returns {boolean} True if language matches or no language preference
   */
  /**
   * Check if issue matches user's preferred languages (via repository language)
   * @param {Object} issue - Issue object
   * @param {Object} user - User profile object
   * @param {Object} repository - Repository object (contains language)
   * @returns {boolean} True to not filter based on language (handled in recommendation service)
   */
  matchesLanguage: (issue, user, repository) => {
    return true; // Language filtering is handled in the recommendation service via scoring
  },

  /**
   * Check if issue matches user's skills or interests
   * @param {Object} issue - Issue object
   * @param {Object} user - User profile object
   * @returns {boolean} True if matches skills/interests or no preferences
   */
  matchesSkillsOrInterests: (issue, user) => {
    // Always pass this filter; skills/interests are handled in the recommendation service via scoring
    return true;
  },

  /**
   * Check if issue matches user's experience level
   * @param {Object} issue - Issue object
   * @param {Object} user - User profile object
   * @param {Object} repository - Repository object (for activity signals)
   * @returns {boolean} True if matches experience level or no preference
   */
  matchesExperienceLevel: (issue, user, repository) => {
    if (!user.experienceLevel || user.experienceLevel.trim() === '') {
      return true; // No experience level preference
    }

    const level = user.experienceLevel.trim().toLowerCase();

    // Check for explicit experience labels on the issue
    const issueLabels = (issue.labels || []).map(label => label.name.toLowerCase());
    const hasBeginnerLabel = issueLabels.some(label =>
      ['beginner', 'good first issue', 'easy', 'help wanted'].includes(label)
    );
    const hasAdvancedLabel = issueLabels.some(label =>
      ['advanced', 'hard', 'difficult', 'expert'].includes(label)
    );

    // If issue has explicit labels, use them
    if (hasBeginnerLabel && !hasAdvancedLabel) {
      return level === 'beginner';
    }
    if (hasAdvancedLabel && !hasBeginnerLabel) {
      return level === 'advanced';
    }
    // If both or neither, we fall back to repository-based assessment

    // Use repository signals to estimate suitability for experience level
    if (!repository) {
      // If no repository context, we can only rely on issue labels
      // If no explicit labels, we assume it's suitable for all levels
      return !(hasBeginnerLabel || hasAdvancedLabel);
    }

    // Normalize signals to 0-1 range for comparison (same as in repository filter)
    const starsScore = Math.min(1, Math.log10((repository.stars || 0) + 1) / 5); // Log scale, 100k stars = 1.0
    const forksScore = Math.min(1, Math.log10((repository.forks || 0) + 1) / 4); // Log scale, 10k forks = 1.0
    const issuesScore = Math.min(1, (repository.openIssues || 0) / 100); // Linear, 100 issues = 1.0

    // Calculate activity score based on recency
    const activityScore = IssueFilterService.calculateActivityScore(repository.updatedAt);

    // Composite score: weighted combination of signals
    const compositeScore = (
      starsScore * 0.3 +
      forksScore * 0.2 +
      issuesScore * 0.2 +
      activityScore * 0.3
    );

    // Experience level thresholds (these are tunable parameters)
    switch (level) {
      case 'beginner':
        // Beginners might prefer moderately active, well-established projects
        // Not too obscure (minimum activity), not overly complex (moderate scores)
        return compositeScore >= 0.2;
      case 'intermediate':
        // Intermediate users can handle a wider range
        return compositeScore >= 0.1 && compositeScore <= 1.0;
      case 'advanced':
        // Advanced users might prefer either very active projects or cutting edge ones
        // High composite score (established) OR low score with recent activity (new/experimental)
        return compositeScore >= 0.6 || (compositeScore >= 0.3 && activityScore >= 0.7);
      default:
        return true;
    }
  },

  /**
   * Calculate activity score based on repository update frequency
   * @param {string} updatedAt - ISO date string from GitHub
   * @returns {number} Activity score between 0-1 (1 = very recent)
   */
  calculateActivityScore: (updatedAt) => {
    if (!updatedAt) return 0;

    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now - updatedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Activity scoring:
    // - Updated within 7 days: 1.0
    // - Updated within 30 days: 0.7
    // - Updated within 90 days: 0.4
    // - Updated within 180 days: 0.2
    // - Older than 180 days: 0.0
    if (diffDays <= 7) return 1.0;
    if (diffDays <= 30) return 0.7;
    if (diffDays <= 90) return 0.4;
    if (diffDays <= 180) return 0.2;
    return 0.0;
  },

  /**
   * Check if issue update frequency matches user's available time
   * Uses issue update frequency as proxy for maintenance effort required
   * @param {Object} issue - Issue object
   * @param {Object} user - User profile object
   * @param {Object} repository - Repository object (for activity signals)
   * @returns {boolean} True if matches available time or no preference
   */
  matchesAvailableTime: (issue, user, repository) => {
    if (!user.availableHours || user.availableHours.trim() === '') {
      return true; // No time preference
    }

    // Parse availableHours (expected format: "X-Y hrs/week" or "Z hrs/week")
    const hoursMatch = user.availableHours.match(/(\d+)\s*-\s*(\d+)\s*hrs?\/week/i) ||
                     user.availableHours.match(/(\d+)\s*hrs?\/week/i);

    let maxHoursPerWeek = 0;
    if (hoursMatch) {
      if (hoursMatch.length === 3) { // Range format: "X-Y hrs/week"
        maxHoursPerWeek = parseInt(hoursMatch[2]); // Take the upper bound
      } else if (hoursMatch.length === 2) { // Single value: "Z hrs/week"
        maxHoursPerWeek = parseInt(hoursMatch[1]);
      }
    } else {
      // If format is not recognized, try to extract any number
      const numMatch = user.availableHours.match(/(\d+)/);
      if (numMatch) {
        maxHoursPerWeek = parseInt(numMatch[1]);
      } else {
        // Cannot parse, assume no restriction (could log warning in real implementation)
        return true;
      }
    }

    // Calculate time commitment score based on issue and repository activity
    // We'll use the repository's activity score as a proxy for how active the project is
    // More active repositories might have issues that require more timely responses
    const activityScore = IssueFilterService.calculateActivityScore(repository ? repository.updatedAt : null);

    // Invert activity score: less active = lower time commitment needed
    // Very active repo (score 1.0) might need more time to keep up with
    const timeCommitmentScore = 1.0 - activityScore;

    // Normalize user's available time to 0-1 scale (assuming max 20 hrs/week as high)
    const normalizedUserTime = Math.min(1, maxHoursPerWeek / 20);

    // User can handle repository if their available time >= required time commitment
    return normalizedUserTime >= timeCommitmentScore * 0.8; // 0.8 factor for buffer
  }
};

module.exports = IssueFilterService;