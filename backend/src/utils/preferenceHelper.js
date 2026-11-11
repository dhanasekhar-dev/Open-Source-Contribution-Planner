/**
 * Preference extraction helper
 * Allows query parameters from explore mode to be used for repository and issue recommendations
 * without modifying the user's saved profile in the database.
 */

const parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Extract effective preferences from req.query or fall back to user profile
 * @param {Object} query - Express req.query
 * @param {Object} dbUser - User object from database
 * @returns {Object} Effective preferences object
 */
const getEffectivePreferences = (query = {}, dbUser = {}) => {
  const isExplore =
    query.explore === 'true' ||
    query.languages !== undefined ||
    query.skills !== undefined ||
    query.interests !== undefined ||
    query.experienceLevel !== undefined ||
    query.availableHours !== undefined;

  if (!isExplore) {
    return dbUser || {};
  }

  return {
    _id: dbUser?._id,
    name: dbUser?.name,
    email: dbUser?.email,
    languages: query.languages !== undefined ? parseArray(query.languages) : [],
    skills: query.skills !== undefined ? parseArray(query.skills) : [],
    interests: query.interests !== undefined ? parseArray(query.interests) : [],
    experienceLevel: query.experienceLevel !== undefined ? String(query.experienceLevel).trim() : '',
    availableHours: query.availableHours !== undefined ? String(query.availableHours).trim() : ''
  };
};

module.exports = {
  getEffectivePreferences,
  parseArray
};
