const User = require('../models/User');
const { searchRepositories } = require('../services/githubService');
const { calculateRepositoryMatchScore } = require('../utils/repositoryScore');
const { getEffectivePreferences } = require('../utils/preferenceHelper');

/**
 * Build a set of targeted search queries across preferred languages, domain interests, and skills
 * @param {Object} preferences - User profile or explore preferences
 * @returns {Array<string>} List of search query strings (max 4 to avoid rate limit spikes)
 */
const buildMultiSearchQueries = (preferences = {}) => {
  const queries = [];
  const validLanguages = Array.isArray(preferences.languages)
    ? preferences.languages.map(l => String(l).trim()).filter(Boolean)
    : [];

  const validInterests = Array.isArray(preferences.interests)
    ? preferences.interests.map(i => String(i).trim()).filter(Boolean)
    : [];

  const validSkills = Array.isArray(preferences.skills)
    ? preferences.skills.map(s => String(s).trim()).filter(Boolean)
    : [];

  // Extract a topic/keyword for domain interest (e.g. "Web Development" -> "web")
  let domainKeyword = '';
  if (validInterests.length > 0) {
    const firstInterest = validInterests[0].toLowerCase();
    if (firstInterest.includes('web')) {
      domainKeyword = 'web';
    } else {
      domainKeyword = firstInterest.replace(/[^a-z0-9]+/g, '-');
    }
  }

  // 1. Language queries: For each preferred language, construct targeted searches
  if (validLanguages.length > 0) {
    validLanguages.slice(0, 3).forEach(lang => {
      // Query combining language and domain keyword if available
      if (domainKeyword) {
        queries.push(`language:${lang} ${domainKeyword} stars:>20 sort:stars`);
      }
      // General high-quality repositories in that language
      queries.push(`language:${lang} stars:>50 sort:stars`);
    });
  }

  // 2. Domain / Topic search if available
  if (validInterests.length > 0 && queries.length < 4) {
    const slug = validInterests[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    queries.push(`topic:${slug} stars:>50 sort:stars`);
  }

  // 3. Skill / Technology search if no languages or room left
  if (queries.length < 3 && validSkills.length > 0) {
    const firstSkill = validSkills[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    queries.push(`topic:${firstSkill} stars:>50 sort:stars`);
  }

  // 4. Fallback if no specific criteria
  if (queries.length === 0) {
    queries.push('stars:>1000 sort:stars');
  }

  // Deduplicate and cap to at most 4 queries
  return Array.from(new Set(queries)).slice(0, 4);
};

/**
 * @desc    Get recommended repositories based on user profile or explore preferences
 * @route   GET /api/repositories/recommended
 * @access  Private
 */
const getRecommendedRepositories = async (req, res) => {
  console.log('Get recommended repositories controller called');
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Extract explore preferences if provided, else use saved user profile from MongoDB
    const effectivePreferences = getEffectivePreferences(req.query, user);

    // Build multi-query search queries to cover all languages and interests
    const searchQueries = buildMultiSearchQueries(effectivePreferences);
    console.log('Generated multi-queries for recommended search:', searchQueries);

    // Fetch candidate repositories across all queries concurrently with resilient error handling
    const queryPromises = searchQueries.map(async (q) => {
      try {
        return await searchRepositories({ q, per_page: 30 });
      } catch (err) {
        console.warn(`Recommendation search query failed for "${q}":`, err.message);
        return [];
      }
    });

    const queryResults = await Promise.all(queryPromises);

    // Deduplicate candidate repositories
    const seen = new Set();
    const candidateRepositories = [];

    for (const repoList of queryResults) {
      if (Array.isArray(repoList)) {
        for (const repo of repoList) {
          const key = repo.githubId || repo.fullName || repo.url || `${repo.owner}/${repo.name}`;
          if (key && !seen.has(key)) {
            seen.add(key);
            candidateRepositories.push(repo);
          }
        }
      }
    }

    // Handle empty candidate pool gracefully without crashing
    if (candidateRepositories.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        repositories: [],
        message: 'No repositories could be retrieved from GitHub matching your preferences. If you recently performed several searches, GitHub API rate limits may be temporarily active. Please try again shortly.'
      });
    }

    // Calculate match score and explainable reasons for every repository
    const repositoriesWithScores = candidateRepositories.map(repo => {
      const { score, reasons } = calculateRepositoryMatchScore(repo, effectivePreferences);
      return {
        ...repo,
        matchScore: score,
        matchReasons: reasons
      };
    });

    // Sort by match score descending (highest match score first; tie-breaker: stars count)
    repositoriesWithScores.sort((a, b) => {
      const scoreA = typeof a.matchScore === 'number' ? a.matchScore : -1;
      const scoreB = typeof b.matchScore === 'number' ? b.matchScore : -1;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return (b.stars || 0) - (a.stars || 0);
    });

    res.status(200).json({
      success: true,
      count: repositoriesWithScores.length,
      repositories: repositoriesWithScores
    });
  } catch (error) {
    console.error('Get recommended repositories controller error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getRecommendedRepositories,
  buildMultiSearchQueries
};