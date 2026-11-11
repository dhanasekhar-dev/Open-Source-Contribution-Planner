import api from './axios';

/**
 * Format explore preferences object into Axios query params
 */
const formatParams = (params = {}) => {
  const query = {};
  if (params.explore) query.explore = 'true';
  if (params.q) query.q = params.q;

  if (Array.isArray(params.languages) && params.languages.length > 0) {
    query.languages = params.languages.join(',');
  } else if (typeof params.languages === 'string' && params.languages.trim()) {
    query.languages = params.languages.trim();
  }

  if (Array.isArray(params.skills) && params.skills.length > 0) {
    query.skills = params.skills.join(',');
  } else if (typeof params.skills === 'string' && params.skills.trim()) {
    query.skills = params.skills.trim();
  }

  if (Array.isArray(params.interests) && params.interests.length > 0) {
    query.interests = params.interests.join(',');
  } else if (typeof params.interests === 'string' && params.interests.trim()) {
    query.interests = params.interests.trim();
  }

  if (params.experienceLevel) {
    query.experienceLevel = params.experienceLevel;
  }

  if (params.availableHours) {
    query.availableHours = params.availableHours;
  }

  return query;
};

export const repositoryApi = {
  // Discovery search (accepts explore preference overrides)
  searchRepositories: async (params = {}) => {
    const response = await api.get('/api/repositories/search', {
      params: formatParams(params),
    });
    return response.data;
  },

  // Filtered search (accepts explore preference overrides)
  getFilteredRepositories: async (params = {}) => {
    const response = await api.get('/api/repositories/filtered/filtered-search', {
      params: formatParams(params),
    });
    return response.data;
  },

  // Recommended repositories with match scores (accepts explore preference overrides)
  getRecommendedRepositories: async (params = {}) => {
    const response = await api.get('/api/repositories/recommended', {
      params: formatParams(params),
    });
    return response.data;
  },

  // Get specific repository details
  getRepositoryDetails: async (owner, repo) => {
    const response = await api.get(`/api/repositories/${owner}/${repo}`);
    return response.data;
  },

  // Get issues for a repository
  getRepositoryIssues: async (owner, repo) => {
    const response = await api.get(`/api/repositories/${owner}/${repo}/issues`);
    return response.data;
  },

  // Get recommended issues for a repository (accepts explore preference overrides)
  getRecommendedIssues: async (owner, repo, params = {}) => {
    const response = await api.get(`/api/repositories/${owner}/${repo}/issues/recommended`, {
      params: formatParams(params),
    });
    return response.data;
  },
};

export default repositoryApi;
