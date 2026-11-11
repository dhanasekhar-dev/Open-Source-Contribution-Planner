/**
 * Issue recommendation service for scoring and ranking GitHub issues based on user profile or explore preferences
 */

/**
 * Score issues based on user profile or explore preferences and repository context
 * @param {Array} issues - Array of issue objects from GitHub (normalized)
 * @param {Object} user - User profile or explore preferences object
 * @param {Object} repository - Normalized repository object (for language context)
 * @returns {Array} Issues with matchScore and matchReasons added
 */
const scoreIssues = (issues, user = {}, repository) => {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  const hasLanguagePref = Array.isArray(user.languages) && user.languages.length > 0;
  const hasSkillPref = Array.isArray(user.skills) && user.skills.length > 0;
  const hasExperiencePref = Boolean(user.experienceLevel && String(user.experienceLevel).trim());
  const hasInterestPref = Array.isArray(user.interests) && user.interests.length > 0;
  const hasTimePref = Boolean(user.availableHours && String(user.availableHours).trim());

  const hasAnyPreference =
    hasLanguagePref || hasSkillPref || hasExperiencePref || hasInterestPref || hasTimePref;

  // If no preferences, do not assign a match score or reasons
  if (!hasAnyPreference) {
    return issues.map(issue => ({
      ...issue,
      matchScore: null,
      matchReasons: []
    }));
  }

  const totalWeight =
    (hasLanguagePref ? 0.3 : 0) +
    (hasSkillPref ? 0.3 : 0) +
    (hasExperiencePref ? 0.2 : 0) +
    (hasInterestPref ? 0.1 : 0) +
    (hasTimePref ? 0.1 : 0);

  return issues.map(issue => {
    const languageScore = hasLanguagePref ? computeLanguageMatch(issue, user, repository) : 0;
    const skillScore = hasSkillPref ? computeSkillMatch(issue, user) : 0;
    const experienceScore = hasExperiencePref ? computeExperienceMatch(issue, user, repository) : 0;
    const interestScore = hasInterestPref ? computeInterestMatch(issue, user) : 0;
    const timeScore = hasTimePref ? computeTimeMatch(issue, user, repository) : 0;

    const earnedScore =
      (hasLanguagePref ? languageScore * 0.3 : 0) +
      (hasSkillPref ? skillScore * 0.3 : 0) +
      (hasExperiencePref ? experienceScore * 0.2 : 0) +
      (hasInterestPref ? interestScore * 0.1 : 0) +
      (hasTimePref ? timeScore * 0.1 : 0);

    const matchScore = totalWeight > 0 ? parseFloat((earnedScore / totalWeight).toFixed(2)) : null;

    // Generate human-readable reasons only for active matched dimensions
    const matchReasons = generateMatchReasons(
      issue, user, repository,
      languageScore, skillScore, experienceScore, interestScore, timeScore
    );

    return {
      ...issue,
      matchScore,
      matchReasons
    };
  });
};

/**
 * Compute language match score (0-1)
 */
const computeLanguageMatch = (issue, user, repository) => {
  if (!user.languages || user.languages.length === 0) {
    return 0.0;
  }

  if (!repository || !repository.language) {
    return 0.0;
  }

  const repoLanguage = repository.language.trim().toLowerCase();
  const match = user.languages.some(lang =>
    lang.trim().toLowerCase() === repoLanguage
  );

  return match ? 1.0 : 0.0;
};

/**
 * Compute skill match score (0-1)
 */
const computeSkillMatch = (issue, user) => {
  if (!user.skills || user.skills.length === 0) {
    return 0.0;
  }

  const issueText = [
    issue.title || '',
    issue.description || '',
    ...(issue.labels || []).map(label => label.name || '')
  ].join(' ').toLowerCase();

  let matchedSkills = 0;
  user.skills.forEach(skill => {
    const normalizedSkill = skill.trim().toLowerCase();
    if (issueText.includes(normalizedSkill)) {
      matchedSkills++;
    }
  });

  return user.skills.length > 0 ? matchedSkills / user.skills.length : 0.0;
};

/**
 * Compute experience match score (0-1)
 */
const computeExperienceMatch = (issue, user, repository) => {
  if (!user.experienceLevel || user.experienceLevel.trim() === '') {
    return 0.0;
  }

  const level = user.experienceLevel.trim().toLowerCase();

  const issueLabels = (issue.labels || []).map(label => label.name.toLowerCase());
  const hasBeginnerLabel = issueLabels.some(label =>
    ['beginner', 'good first issue', 'easy', 'help wanted'].includes(label)
  );
  const hasAdvancedLabel = issueLabels.some(label =>
    ['advanced', 'hard', 'difficult', 'expert'].includes(label)
  );

  if (hasBeginnerLabel && !hasAdvancedLabel) {
    return level === 'beginner' ? 1.0 : 0.2;
  }
  if (hasAdvancedLabel && !hasBeginnerLabel) {
    return level === 'advanced' ? 1.0 : 0.2;
  }

  if (!repository) {
    return !(hasBeginnerLabel || hasAdvancedLabel) ? 0.5 : 0.0;
  }

  const starsScore = Math.min(1, Math.log10((repository.stars || 0) + 1) / 5);
  const forksScore = Math.min(1, Math.log10((repository.forks || 0) + 1) / 4);
  const issuesScore = Math.min(1, (repository.openIssues || 0) / 100);
  const activityScore = calculateActivityScore(repository.updatedAt);

  const compositeScore = (
    starsScore * 0.3 +
    forksScore * 0.2 +
    issuesScore * 0.2 +
    activityScore * 0.3
  );

  let score = 0.5;
  switch (level) {
    case 'beginner':
      if (compositeScore >= 0.2 && compositeScore <= 0.7) {
        score = 1.0;
      } else if (compositeScore < 0.2) {
        score = compositeScore / 0.2;
      } else {
        score = Math.max(0.2, (1.0 - compositeScore) / 0.3);
      }
      break;
    case 'intermediate':
      if (compositeScore >= 0.1) {
        score = 1.0;
      } else {
        score = compositeScore / 0.1;
      }
      break;
    case 'advanced':
      if (compositeScore >= 0.6 || (compositeScore >= 0.3 && activityScore >= 0.7)) {
        score = 1.0;
      } else {
        score = Math.min(1.0, (compositeScore / 0.3 + activityScore / 0.7) / 2);
      }
      break;
    default:
      score = 0.5;
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Calculate activity score based on repository update frequency
 */
const calculateActivityScore = (updatedAt) => {
  if (!updatedAt) return 0;

  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now - updatedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return 1.0;
  if (diffDays <= 30) return 0.7;
  if (diffDays <= 90) return 0.4;
  if (diffDays <= 180) return 0.2;
  return 0.0;
};

/**
 * Compute interest match score (0-1)
 */
const computeInterestMatch = (issue, user) => {
  if (!user.interests || user.interests.length === 0) {
    return 0.0;
  }

  const issueText = [
    issue.title || '',
    issue.description || '',
    ...(issue.labels || []).map(label => label.name || '')
  ].join(' ').toLowerCase();

  let matchedInterests = 0;
  user.interests.forEach(interest => {
    const normalizedInterest = interest.trim().toLowerCase();
    if (issueText.includes(normalizedInterest)) {
      matchedInterests++;
    }
  });

  return user.interests.length > 0 ? matchedInterests / user.interests.length : 0.0;
};

/**
 * Compute time match score (0-1)
 */
const computeTimeMatch = (issue, user, repository) => {
  if (!user.availableHours || user.availableHours.trim() === '') {
    return 0.0;
  }

  const hoursMatch = user.availableHours.match(/(\d+)\s*-\s*(\d+)\s*hrs?\/week/i) ||
                     user.availableHours.match(/(\d+)\s*hrs?\/week/i);

  let maxHoursPerWeek = 0;
  if (hoursMatch) {
    if (hoursMatch.length === 3) {
      maxHoursPerWeek = parseInt(hoursMatch[2]);
    } else if (hoursMatch.length === 2) {
      maxHoursPerWeek = parseInt(hoursMatch[1]);
    }
  } else {
    const numMatch = user.availableHours.match(/(\d+)/);
    if (numMatch) {
      maxHoursPerWeek = parseInt(numMatch[1]);
    } else {
      return 0.5;
    }
  }

  const activityScore = calculateActivityScore(
    repository ? repository.updatedAt : null
  );

  const timeCommitmentScore = 1.0 - activityScore;
  const normalizedUserTime = Math.min(1, maxHoursPerWeek / 20);
  const requiredTime = timeCommitmentScore * 0.8;

  if (normalizedUserTime >= requiredTime) {
    return 1.0;
  } else if (normalizedUserTime <= 0) {
    return 0.0;
  } else {
    return normalizedUserTime / requiredTime;
  }
};

/**
 * Generate human-readable reasons for the match
 */
const generateMatchReasons = (issue, user, repository, languageScore, skillScore, experienceScore, interestScore, timeScore) => {
  const reasons = [];

  // Language match
  if (languageScore === 1.0 && user.languages && user.languages.length > 0) {
    reasons.push(`Language match: ${repository?.language || user.languages[0]}`);
  }

  // Skill match
  if (skillScore > 0 && user.skills && user.skills.length > 0) {
    const matchedSkills = user.skills.filter(skill => {
      const issueText = [
        issue.title || '',
        issue.description || '',
        ...(issue.labels || []).map(label => label.name || '')
      ].join(' ').toLowerCase();
      return issueText.includes(skill.trim().toLowerCase());
    });
    if (matchedSkills.length > 0) {
      reasons.push(`Skills match: ${matchedSkills.join(', ')}`);
    }
  }

  // Experience match
  if (experienceScore >= 0.8 && user.experienceLevel && user.experienceLevel.trim() !== '') {
    reasons.push(`Experience level ${user.experienceLevel} suitable`);
  }

  // Interest match
  if (interestScore > 0 && user.interests && user.interests.length > 0) {
    const matchedInterests = user.interests.filter(interest => {
      const issueText = [
        issue.title || '',
        issue.description || '',
        ...(issue.labels || []).map(label => label.name || '')
      ].join(' ').toLowerCase();
      return issueText.includes(interest.trim().toLowerCase());
    });
    if (matchedInterests.length > 0) {
      reasons.push(`Interests match: ${matchedInterests.join(', ')}`);
    }
  }

  // Time match
  if (timeScore >= 0.8 && user.availableHours && user.availableHours.trim() !== '') {
    reasons.push('Time commitment suitable');
  }

  return reasons;
};

const IssueRecommendationService = {
  scoreIssues,
  computeLanguageMatch,
  computeSkillMatch,
  computeExperienceMatch,
  computeInterestMatch,
  computeTimeMatch,
  generateMatchReasons,
  calculateActivityScore
};

module.exports = IssueRecommendationService;
