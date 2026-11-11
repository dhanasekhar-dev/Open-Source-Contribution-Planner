/**
 * Repository filtering service for filtering GitHub repositories based on user profile
 */

const RepositoryFilterService = {
  /**
   * Filter repositories based on user profile preferences
   * @param {Array} repositories - Array of repository objects from GitHub
   * @param {Object} user - User profile object
   * @returns {Array} Filtered repositories
   */
  filterRepositories: (repositories, user) => {
    if (!repositories || !Array.isArray(repositories)) {
      return [];
    }

    if (!user) {
      return repositories;
    }

    return repositories.filter(repo =>
      RepositoryFilterService.matchesLanguage(repo, user) &&
      RepositoryFilterService.matchesSkillsOrInterests(repo, user) &&
      RepositoryFilterService.matchesExperienceLevel(repo, user) &&
      RepositoryFilterService.matchesAvailableTime(repo, user)
    );
  },

  /**
   * Check if repository language matches user's preferred languages
   * @param {Object} repo - Repository object
   * @param {Object} user - User profile object
   * @returns {boolean} True if language matches or no language preference
   */
  matchesLanguage: (repo, user) => {
    if (!user.languages || user.languages.length === 0) {
      return true; // No language preference, accept all
    }

    if (!repo.language) {
      return false; // Repository has no language, but user has preferences
    }

    // Case-insensitive exact match
    const repoLanguage = repo.language.trim().toLowerCase();
    return user.languages.some(lang =>
      lang.trim().toLowerCase() === repoLanguage
    );
  },

  /**
   * Check if repository topics match user's skills or interests
   * @param {Object} repo - Repository object
   * @param {Object} user - User profile object
   * @returns {boolean} True if matches skills/interests or no preferences
   */
  matchesSkillsOrInterests: (repo, user) => {
    // If no skills or interests specified, accept all
    const hasSkillsPreference = user.skills && user.skills.length > 0;
    const hasInterestsPreference = user.interests && user.interests.length > 0;

    if (!hasSkillsPreference && !hasInterestsPreference) {
      return true;
    }

    if (!repo.topics || !Array.isArray(repo.topics) || repo.topics.length === 0) {
      return !(hasSkillsPreference || hasInterestsPreference);
    }

    // Normalize repository topics for comparison
    const normalizedTopics = repo.topics.map(topic =>
      topic.trim().toLowerCase()
    );

    // Check skills match
    if (hasSkillsPreference) {
      const skillsMatch = user.skills.some(skill => {
        // Normalize user skill: lowercase and replace spaces with hyphens to match topic format
        const normalizedSkill = skill.trim().toLowerCase().replace(/\s+/g, '-');
        return normalizedTopics.some(topic =>
          topic.includes(normalizedSkill) || normalizedSkill.includes(topic)
        );
      });

      if (skillsMatch) {
        return true; // Skills matched, no need to check interests
      }
    }

    // Check interests match
    if (hasInterestsPreference) {
      const interestsMatch = user.interests.some(interest => {
        // Normalize user interest: lowercase and replace spaces with hyphens to match topic format
        const normalizedInterest = interest.trim().toLowerCase().replace(/\s+/g, '-');
        return normalizedTopics.some(topic =>
          topic.includes(normalizedInterest) || normalizedInterest.includes(topic)
        );
      });

      return interestsMatch;
    }

    return false;
  },

  /**
   * Check if repository matches user's experience level
   * Uses repository signals to estimate suitability for experience level
   * @param {Object} repo - Repository object
   * @param {Object} user - User profile object
   * @returns {boolean} True if matches experience level or no preference
   */
  matchesExperienceLevel: (repo, user) => {
    if (!user.experienceLevel || user.experienceLevel.trim() === '') {
      return true; // No experience level preference
    }

    const level = user.experienceLevel.trim().toLowerCase();

    // Normalize signals to 0-1 range for comparison
    const starsScore = Math.min(1, Math.log10((repo.stars || 0) + 1) / 5); // Log scale, 100k stars = 1.0
    const forksScore = Math.min(1, Math.log10((repo.forks || 0) + 1) / 4); // Log scale, 10k forks = 1.0
    const issuesScore = Math.min(1, (repo.openIssues || 0) / 100); // Linear, 100 issues = 1.0

    // Calculate activity score based on recency
    const activityScore = RepositoryFilterService.calculateActivityScore(repo.updatedAt);

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
        return compositeScore >= 0.2 && compositeScore <= 0.7;
      case 'intermediate':
        // Intermediate users can handle a wider range
        return compositeScore >= 0.1 && compositeScore <= 0.9;
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
   * Check if repository update frequency matches user's available time
   * Uses repository activity as proxy for maintenance effort required
   * @param {Object} repo - Repository object
   * @param {Object} user - User profile object
   * @returns {boolean} True if matches available time or no preference
   */
  matchesAvailableTime: (repo, user) => {
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

    // Calculate time commitment score based on repository activity
    // More active repositories might require more time to stay updated
    const activityScore = RepositoryFilterService.calculateActivityScore(repo.updatedAt);

    // Invert activity score: less active = lower time commitment needed
    // Very active repo (score 1.0) might need more time to keep up with
    const timeCommitmentScore = 1.0 - activityScore;

    // Normalize user's available time to 0-1 scale (assuming max 20 hrs/week as high)
    const normalizedUserTime = Math.min(1, maxHoursPerWeek / 20);

    // User can handle repository if their available time >= required time commitment
    return normalizedUserTime >= timeCommitmentScore * 0.8; // 0.8 factor for buffer
  }
};

module.exports = RepositoryFilterService;