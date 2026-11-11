const User = require('../models/User');
const { searchRepositories } = require('../services/githubService');
const RepositoryFilterService = require('../services/repositoryFilterService');
const { getEffectivePreferences } = require('../utils/preferenceHelper');
const { buildSearchQuery } = require('./repositoryController');

/**
 * @desc    Search and filter repositories based on user profile or explore preferences
 * @route   GET /api/repositories/filtered/filtered-search
 * @access  Private
 */
const filteredRepositorySearchController = async (req, res) => {
  try {
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
    }

    // Extract explore preferences if provided, else use saved user profile (or empty if visitor)
    const effectivePreferences = getEffectivePreferences(req.query, user);

    // Build GitHub search query from effective preferences
    const query = buildSearchQuery(effectivePreferences, req.query);

    // Search GitHub repositories
    const repositories = await searchRepositories({ q: query });

    // Apply filtering based on effective preferences
    const filteredRepositories = RepositoryFilterService.filterRepositories(repositories, effectivePreferences);

    res.status(200).json({
      success: true,
      count: filteredRepositories.length,
      repositories: filteredRepositories
    });
  } catch (error) {
    console.error('Filtered repository search controller error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  filteredRepositorySearchController
};