console.log('LOADING REPOSITORY CONTROLLER');
const User = require('../models/User');
const { searchRepositories, getRepositoryByOwnerAndName, getRepositoryIssues } = require('../services/githubService');
const IssueFilterService = require('../services/issueFilterService');
const IssueRecommendationService = require('../services/issueRecommendationService');
const { getEffectivePreferences } = require('../utils/preferenceHelper');
const fs = require('fs');

/**
 * @desc    Search repositories based on user profile or explore preferences
 * @route   GET /api/repositories/search
 * @access  Private
 */
const searchRepositoriesController = async (req, res) => {
  try {
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
    }

    // Extract explore preferences if present, else fallback to user profile (or empty if guest)
    const effectivePreferences = getEffectivePreferences(req.query, user);

    // Build GitHub search query from preferences
    const query = buildSearchQuery(effectivePreferences, req.query);
    console.log('Generated query:', query);

    // Search GitHub repositories
    const repositories = await searchRepositories({ q: query });

    res.status(200).json({
      success: true,
      count: repositories.length,
      repositories
    });
  } catch (error) {
    console.error('Repository search controller error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get details for a specific repository
 * @route   GET /api/repositories/:owner/:repo
 * @access  Private
 */
const getRepositoryController = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    const repository = await getRepositoryByOwnerAndName(owner, repo);

    res.status(200).json({
      success: true,
      repository
    });
  } catch (error) {
    console.error('Get repository controller error:', error);
    if (error.message === 'Failed to get repository details') {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get issues for a specific repository
 * @route   GET /api/repositories/:owner/:repo/issues
 * @access  Private
 */
const getRepositoryIssuesController = async (req, res) => {
  console.log('getRepositoryIssuesController called');
  try {
    const { owner, repo } = req.params;

    const issues = await getRepositoryIssues(owner, repo);

    res.status(200).json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get repository issues controller error:', error);
    if (error.message === 'Failed to get repository issues') {
      return res.status(404).json({ success: false, message: 'Repository not found or no issues available' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get recommended issues for a specific repository based on profile or explore preferences
 * @route   GET /api/repositories/:owner/:repo/issues/recommended
 * @access  Private
 */
const getRecommendedIssuesController = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Extract explore preferences if provided, else use saved user profile
    const effectivePreferences = getEffectivePreferences(req.query, user);

    // Fetch issues for the repository
    const issues = await getRepositoryIssues(owner, repo);

    if (issues.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        issues: [],
        message: 'No issues found for this repository.'
      });
    }

    // Fetch repository details for language and context
    const repository = await getRepositoryByOwnerAndName(owner, repo);

    // Apply filtering based on effective preferences and repository context
    const filteredIssues = IssueFilterService.filterIssues(issues, effectivePreferences, repository);

    if (filteredIssues.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        issues: [],
        message: 'No issues matched your current preferences after filtering. Consider broadening your preferences.'
      });
    }

    // Calculate match score for each filtered issue
    const issuesWithScores = IssueRecommendationService.scoreIssues(filteredIssues, effectivePreferences, repository);

    // Sort by match score descending (null scores stay at the bottom)
    issuesWithScores.sort((a, b) => {
      const scoreA = a.matchScore !== null && a.matchScore !== undefined ? a.matchScore : -1;
      const scoreB = b.matchScore !== null && b.matchScore !== undefined ? b.matchScore : -1;
      return scoreB - scoreA;
    });

    res.status(200).json({
      success: true,
      count: issuesWithScores.length,
      issues: issuesWithScores
    });
  } catch (error) {
    console.error('Get recommended issues controller error:', error);
    if (error.message === 'Failed to get repository issues') {
      return res.status(404).json({ success: false, message: 'Repository not found or no issues available' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Build GitHub search query string from preferences object
 * @param {Object} preferences - Preferences object (languages, skills, interests)
 * @param {Object} reqQuery - Raw request query for explicit search terms
 * @returns {string} GitHub search query
 */
const buildSearchQuery = (preferences = {}, reqQuery = {}) => {
  const queryParts = [];

  if (reqQuery.q && typeof reqQuery.q === 'string' && reqQuery.q.trim()) {
    queryParts.push(reqQuery.q.trim());
  }

  // Add language preferences
  if (preferences.languages && preferences.languages.length > 0) {
    const validLangs = preferences.languages.filter(l => l && String(l).trim());
    if (validLangs.length > 0) {
      queryParts.push(`language:${validLangs[0].trim()}`);
    }
  } else if (preferences.skills && preferences.skills.length > 0) {
    const firstSkill = String(preferences.skills[0]).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (firstSkill) queryParts.push(`topic:${firstSkill}`);
  } else if (preferences.interests && preferences.interests.length > 0) {
    const firstInterest = String(preferences.interests[0]).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (firstInterest) queryParts.push(`topic:${firstInterest}`);
  }

  // If no specific preferences, search for popular repositories
  if (queryParts.length === 0) {
    queryParts.push('stars:>1000 sort:stars');
  }

  return queryParts.join(' ');
};

module.exports = {
  searchRepositoriesController,
  getRepositoryController,
  getRepositoryIssuesController,
  getRecommendedIssuesController,
  buildSearchQuery
};