import api from './axios';

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

export const issueApi = {
  // Get all public issues for a repository
  getIssues: async (owner, repo) => {
    const response = await api.get(`/api/repositories/${owner}/${repo}/issues`);
    return response.data;
  },

  // Get recommended issues with match scores and reasons (supports explore preferences)
  getRecommendedIssues: async (owner, repo, params = {}) => {
    const response = await api.get(`/api/repositories/${owner}/${repo}/issues/recommended`, {
      params: formatParams(params),
    });
    return response.data;
  },
};

export default issueApi;
