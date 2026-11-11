const axios = require('axios');
require('dotenv').config();

const GITHUB_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional for higher rate limits

// Create axios instance with default headers
const githubApi = axios.create({
  baseURL: GITHUB_BASE_URL,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
  }
});

/**
 * Search for repositories using GitHub's search API
 * @param {Object} queryParams - Search parameters
 * @returns {Promise<Array>} Normalized repository data
 */
const searchRepositories = async (queryParams) => {
  try {
    console.log('GitHub service received queryParams:', queryParams);
    const response = await githubApi.get('/search/repositories', {
      params: queryParams
    });
    console.log('GitHub service response status:', response.status);
    console.log('GitHub service total_count:', response.data.total_count);
    console.log('GitHub service items count:', response.data.items.length);
    
    // Normalize and extract relevant repository data
    const normalized = response.data.items.map(repo => normalizeRepositoryData(repo));
    console.log('GitHub service returning', normalized.length, 'normalized repositories');
    return normalized;
  } catch (error) {
    console.error('GitHub repository search error:', error.response?.data || error.message);
    throw new Error('Failed to search repositories');
  }
};

/**
 * Get details for a specific repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Normalized repository data
 */
const getRepositoryByOwnerAndName = async (owner, repo) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repo}`);
    return normalizeRepositoryData(response.data);
  } catch (error) {
    console.error('GitHub get repository error:', error.response?.data || error.message);
    throw new Error('Failed to get repository details');
  }
};

/**
 * Get issues for a specific repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} Normalized issues data (excluding pull requests)
 */
const getRepositoryIssues = async (owner, repo) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repo}/issues`, {
      params: {
        state: 'all',
        per_page: 100
      }
    });
    // Filter out pull requests (GitHub returns pull requests in the issues endpoint)
    const issues = response.data.filter(issue => !issue.pull_request);
    // Normalize each issue
    return issues.map(normalizeIssueData);
  } catch (error) {
    console.error('GitHub get repository issues error:', error.response?.data || error.message);
    throw new Error('Failed to get repository issues');
  }
};

/**
 * Normalize GitHub issue data to our application format
 * @param {Object} githubIssue - Raw GitHub issue data
 * @returns {Object} Normalized issue data
 */
const normalizeIssueData = (githubIssue) => {
  return {
    githubId: githubIssue.id,
    number: githubIssue.number,
    title: githubIssue.title,
    description: githubIssue.body || '',
    url: githubIssue.html_url,
    state: githubIssue.state, // 'open' or 'closed'
    createdAt: githubIssue.created_at,
    updatedAt: githubIssue.updated_at,
    labels: githubIssue.labels || [],
    assignee: githubIssue.assignee ? githubIssue.assignee.login : null
  };
};

/**
 * Normalize GitHub repository data to our application format
 * @param {Object} githubRepo - Raw GitHub repository data
 * @returns {Object} Normalized repository data
 */
const normalizeRepositoryData = (githubRepo) => {
  return {
    githubId: githubRepo.id,
    name: githubRepo.name,
    fullName: githubRepo.full_name,
    owner: githubRepo.owner.login,
    description: githubRepo.description || '',
    url: githubRepo.html_url,
    language: githubRepo.language || '',
    topics: githubRepo.topics || [],
    stars: githubRepo.stargazers_count || 0,
    forks: githubRepo.forks_count || 0,
    openIssues: githubRepo.open_issues_count || 0,
    updatedAt: githubRepo.updated_at,
    license: githubRepo.license ? githubRepo.license.name : null
  };
};

module.exports = {
  getRepositoryIssues,
  searchRepositories,
  getRepositoryByOwnerAndName
};
