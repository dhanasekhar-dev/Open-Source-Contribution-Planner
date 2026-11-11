/**
 * Calculate repository match score based on user profile or explore preferences
 * @param {Object} repository - Normalized repository object from GitHub
 * @param {Object} user - User profile or explore preferences object
 * @returns {Object} Contains score (0-100 or null if no preferences) and reasons array
 */
const calculateRepositoryMatchScore = (repository, user = {}) => {
  const hasLanguagePref = Array.isArray(user.languages) && user.languages.length > 0;
  const hasInterestPref = Array.isArray(user.interests) && user.interests.length > 0;
  const hasSkillPref = Array.isArray(user.skills) && user.skills.length > 0;
  const hasExperiencePref = Boolean(user.experienceLevel && String(user.experienceLevel).trim());

  // If no preferences are provided, do not assign a score or reasons
  if (!hasLanguagePref && !hasInterestPref && !hasSkillPref && !hasExperiencePref) {
    return {
      score: null,
      reasons: []
    };
  }

  const scores = {
    languageMatch: 0,
    interestTopicMatch: 0,
    skillTechnologyMatch: 0,
    experienceLevelSuitability: 0
  };

  const reasons = [];

  // 1. Language Match (Weight 40%)
  if (hasLanguagePref) {
    if (repository.language) {
      const repoLanguage = repository.language.trim().toLowerCase();
      const languageMatch = user.languages.some(lang =>
        lang.trim().toLowerCase() === repoLanguage
      );

      if (languageMatch) {
        scores.languageMatch = 100;
        reasons.push(`${repository.language} language match`);
      } else {
        scores.languageMatch = 0;
      }
    } else {
      scores.languageMatch = 0;
    }
  }

  // 2. Interest / Domain Topic Match (Weight 25%)
  if (hasInterestPref) {
    const normalizedTopics = (repository.topics || []).map(topic =>
      String(topic).trim().toLowerCase()
    );
    const repoDescription = (repository.description || '').toLowerCase();
    const repoName = (repository.name || '').toLowerCase();

    // Domain profiles for specific matching and avoiding false-positive substrings
    const DOMAIN_PROFILES = {
      'web development': {
        dedicatedTopics: [
          'web-development', 'webdev', 'frontend', 'backend', 'fullstack',
          'web-framework', 'web-app', 'web-application', 'website',
          'springmvc', 'servlet', 'rest-api', 'http', 'django', 'flask',
          'fastapi', 'express', 'nodejs', 'aspnet', 'rails', 'react', 'vue', 'angular'
        ],
        dedicatedDescPhrases: [
          'web development', 'web application', 'web framework',
          'website', 'websites', 'full stack', 'backend service',
          'rest api', 'spring mvc', 'frontend and backend'
        ],
        standaloneKeywords: ['web', 'webdev']
      },
      'mobile development': {
        dedicatedTopics: ['mobile', 'android', 'ios', 'react-native', 'flutter', 'swift', 'kotlin-mobile'],
        dedicatedDescPhrases: ['mobile application', 'android app', 'ios app', 'mobile development'],
        standaloneKeywords: ['mobile']
      },
      'ai/ml': {
        dedicatedTopics: ['ai', 'ml', 'machine-learning', 'deep-learning', 'artificial-intelligence', 'neural-network', 'nlp', 'llm'],
        dedicatedDescPhrases: ['machine learning', 'deep learning', 'artificial intelligence', 'neural network'],
        standaloneKeywords: ['ai', 'ml']
      },
      'devops': {
        dedicatedTopics: ['devops', 'ci-cd', 'docker', 'kubernetes', 'ansible', 'terraform'],
        dedicatedDescPhrases: ['devops', 'ci/cd', 'continuous integration', 'infrastructure as code'],
        standaloneKeywords: ['devops']
      }
    };

    let totalInterestPoints = 0;
    const matchedInterestNames = [];

    user.interests.forEach(interest => {
      const trimmed = interest.trim();
      const lowerInterest = trimmed.toLowerCase();
      const slugInterest = lowerInterest.replace(/\s+/g, '-');
      const profile = DOMAIN_PROFILES[lowerInterest];

      let matchStrength = 0; // 0 = no match, 80 = secondary/general tag, 100 = core domain focus

      if (profile) {
        // A. Check dedicated domain topics
        const hasDedicatedTopic = normalizedTopics.some(t => profile.dedicatedTopics.includes(t));
        // B. Check description phrases
        const hasDescPhrase = profile.dedicatedDescPhrases.some(p => repoDescription.includes(p));
        // C. Check standalone keyword (must be exact topic match, NOT loose compound substring like 'web-mapping')
        const hasStandaloneKeyword = normalizedTopics.some(t => profile.standaloneKeywords.includes(t)) ||
                                     new RegExp(`(^|[^a-zA-Z0-9])${profile.standaloneKeywords[0]}([^a-zA-Z0-9]|$)`, 'i').test(repoName);

        if (hasDedicatedTopic && (hasDescPhrase || hasStandaloneKeyword)) {
          matchStrength = 100; // Strong match: dedicated topics + description/name
        } else if (hasDedicatedTopic || hasDescPhrase) {
          matchStrength = 100; // Strong match: explicit dedicated topic or description phrase
        } else if (hasStandaloneKeyword) {
          matchStrength = 80;  // Secondary/general tag match (e.g. standalone 'web' without dedicated web-dev terms)
        }
      } else {
        // Generic fallback for custom user interests
        const exactTopicMatch = normalizedTopics.includes(slugInterest) || normalizedTopics.includes(lowerInterest);
        const descMatch = repoDescription.includes(lowerInterest);
        if (exactTopicMatch && descMatch) {
          matchStrength = 100;
        } else if (exactTopicMatch || descMatch) {
          matchStrength = 85;
        }
      }

      if (matchStrength > 0) {
        totalInterestPoints += matchStrength;
        matchedInterestNames.push(trimmed);
      }
    });

    if (matchedInterestNames.length > 0) {
      scores.interestTopicMatch = Math.round(totalInterestPoints / user.interests.length);
      reasons.push(`${matchedInterestNames.join(', ')} topic match`);
    } else {
      scores.interestTopicMatch = 0;
    }
  }

  // 3. Skill/Technology Match (Weight 20%)
  if (hasSkillPref) {
    const repoDescription = (repository.description || '').toLowerCase();
    const repoLanguage = (repository.language || '').toLowerCase().trim();
    const normalizedTopics = (repository.topics || []).map(t => String(t).trim().toLowerCase());

    const matchedSkills = [];

    for (const skill of user.skills) {
      const trimmed = skill.trim();
      const lower = trimmed.toLowerCase();
      const slug = lower.replace(/\s+/g, '-').replace(/\./g, '');
      const slugHyphen = lower.replace(/\s+/g, '-');

      // Check language match (e.g. CSS, HTML, JavaScript)
      if (repoLanguage && (repoLanguage === lower || repoLanguage === slug)) {
        matchedSkills.push(trimmed);
        continue;
      }

      // Check topics match
      const topicMatched = normalizedTopics.some(topic => {
        return (
          topic === lower ||
          topic === slug ||
          topic === slugHyphen ||
          topic.replace(/-/g, '') === slug
        );
      });

      if (topicMatched) {
        matchedSkills.push(trimmed);
        continue;
      }

      // Check description with word boundary regex where possible
      const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
      if (wordBoundaryRegex.test(repoDescription) || (slug.length > 3 && repoDescription.includes(slug))) {
        matchedSkills.push(trimmed);
      }
    }

    if (matchedSkills.length > 0) {
      scores.skillTechnologyMatch = Math.round((matchedSkills.length / user.skills.length) * 100);
      reasons.push(`${matchedSkills.join(', ')} technology match`);
    } else {
      scores.skillTechnologyMatch = 0;
    }
  }

  // 4. Project Scale & Maintenance Health (Weight 15%)
  if (hasExperiencePref) {
    const level = user.experienceLevel.trim().toLowerCase();
    const normalizedTopics = (repository.topics || []).map(t => String(t).trim().toLowerCase());
    const stars = repository.stars || 0;
    const daysSinceUpdate = calculateDaysSinceUpdate(repository.updatedAt);

    // Direct verifiable evidence of newcomer onboarding
    const NEWCOMER_TAGS = ['good-first-issue', 'good-first-issues', 'first-timers-only', 'help-wanted', 'beginner-friendly', 'hacktoberfest'];
    const hasNewcomerTag = normalizedTopics.some(t => NEWCOMER_TAGS.includes(t));

    let suitabilityScore = 0;
    let suitabilityReason = '';

    if (hasNewcomerTag) {
      // Direct maintainer-declared onboarding tags detected
      suitabilityScore = 100;
      suitabilityReason = 'Newcomer-friendly contribution tags detected';
    } else if (level === 'beginner') {
      if (daysSinceUpdate <= 90 && stars <= 10000) {
        suitabilityScore = 85;
        suitabilityReason = 'Recent repository updates detected (accessible project scale)';
      } else if (daysSinceUpdate <= 90) {
        suitabilityScore = 65;
        suitabilityReason = 'Recent repository updates detected (large-scale community project)';
      } else {
        suitabilityScore = 55;
        suitabilityReason = 'Moderate repository update recency';
      }
    } else if (level === 'intermediate') {
      if (daysSinceUpdate <= 90 && stars >= 500) {
        suitabilityScore = 90;
        suitabilityReason = 'Recent repository updates detected (established project scale)';
      } else if (daysSinceUpdate <= 90) {
        suitabilityScore = 80;
        suitabilityReason = 'Recent repository updates detected';
      } else if (daysSinceUpdate <= 180) {
        suitabilityScore = 70;
        suitabilityReason = 'Moderate repository update recency';
      } else {
        suitabilityScore = 50;
        suitabilityReason = 'Infrequent repository updates detected';
      }
    } else if (level === 'advanced') {
      if (daysSinceUpdate <= 90 && stars >= 1000) {
        suitabilityScore = 95;
        suitabilityReason = 'Recent repository updates detected (established large-scale project)';
      } else if (daysSinceUpdate <= 90) {
        suitabilityScore = 75;
        suitabilityReason = 'Recent repository updates detected';
      } else {
        suitabilityScore = 55;
        suitabilityReason = 'Infrequent repository updates detected';
      }
    } else {
      suitabilityScore = 85;
      suitabilityReason = 'Recent repository updates detected';
    }

    scores.experienceLevelSuitability = suitabilityScore;
    if (suitabilityReason) {
      reasons.push(suitabilityReason);
    }
  }

  // Dynamic weighting over specified preferences
  let totalWeight = 0;
  let earnedScore = 0;

  if (hasLanguagePref) {
    totalWeight += 0.40;
    earnedScore += scores.languageMatch * 0.40;
  }
  if (hasInterestPref) {
    totalWeight += 0.25;
    earnedScore += scores.interestTopicMatch * 0.25;
  }
  if (hasSkillPref) {
    totalWeight += 0.20;
    earnedScore += scores.skillTechnologyMatch * 0.20;
  }
  if (hasExperiencePref) {
    totalWeight += 0.15;
    earnedScore += scores.experienceLevelSuitability * 0.15;
  }

  const finalScore = totalWeight > 0 ? Math.round(earnedScore / totalWeight) : null;

  return {
    score: finalScore,
    reasons: reasons.filter(Boolean)
  };
};

/**
 * Calculate days elapsed since last repository update
 * @param {string} updatedAt - ISO date string from GitHub
 * @returns {number} Days elapsed
 */
const calculateDaysSinceUpdate = (updatedAt) => {
  if (!updatedAt) return 999;
  const updatedDate = new Date(updatedAt);
  if (isNaN(updatedDate.getTime())) return 999;
  const now = new Date();
  const diffTime = Math.abs(now - updatedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = { calculateRepositoryMatchScore };