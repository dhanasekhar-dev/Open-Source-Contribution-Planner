import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import repositoryApi from '../api/repositoryApi';
import IssueCard from '../components/common/IssueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import useExplore from '../hooks/useExplore';

const Issues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerParam = searchParams.get('owner') || '';
  const repoParam = searchParams.get('repo') || '';
  const tabParam = searchParams.get('tab') || 'recommended'; // 'recommended' | 'all'

  const { getQueryParams, hasActivePreferences, explorePreferences } = useExplore();

  // Repository inputs for searching issues on any repo
  const [ownerInput, setOwnerInput] = useState(ownerParam);
  const [repoInput, setRepoInput] = useState(repoParam);

  const [repositoryDetails, setRepositoryDetails] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendMessage, setBackendMessage] = useState('');

  // Quick repository selector from user's recommendations
  const [quickRepos, setQuickRepos] = useState([]);

  // Client-side filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all'); // 'all' | 'open' | 'closed'
  const [selectedLabel, setSelectedLabel] = useState('ALL');

  // Load recommended repositories for the dropdown quick selector
  useEffect(() => {
    const fetchQuickRepos = async () => {
      try {
        const exploreParams = getQueryParams();
        const data = await repositoryApi.getRecommendedRepositories(exploreParams);
        if (data?.success && Array.isArray(data.repositories)) {
          setQuickRepos(data.repositories.slice(0, 8));
          // If no owner/repo specified in URL, default to the top recommended repo!
          if (!ownerParam && !repoParam && data.repositories.length > 0) {
            const topRepo = data.repositories[0];
            setSearchParams({
              owner: topRepo.owner,
              repo: topRepo.name,
              tab: 'recommended',
            });
            setOwnerInput(topRepo.owner);
            setRepoInput(topRepo.name);
          }
        }
      } catch (err) {
        console.warn('Could not fetch quick repos:', err);
      }
    };

    fetchQuickRepos();
  }, [ownerParam, repoParam, setSearchParams, getQueryParams]);

  // Sync inputs with URL params
  useEffect(() => {
    setOwnerInput(ownerParam);
    setRepoInput(repoParam);
  }, [ownerParam, repoParam]);

  const fetchIssuesAndRepo = useCallback(async () => {
    if (!ownerParam || !repoParam) {
      setIssues([]);
      setRepositoryDetails(null);
      return;
    }

    setLoading(true);
    setError('');
    setBackendMessage('');

    try {
      // 1. Fetch Repository Details
      try {
        const repoData = await repositoryApi.getRepositoryDetails(ownerParam, repoParam);
        if (repoData?.success) {
          setRepositoryDetails(repoData.repository);
        }
      } catch (e) {
        console.warn('Could not fetch repository meta details:', e);
      }

      // 2. Fetch Issues (Recommended or All) using active explore preferences
      let issuesData;
      if (tabParam === 'all') {
        issuesData = await repositoryApi.getRepositoryIssues(ownerParam, repoParam);
      } else {
        const exploreParams = getQueryParams();
        issuesData = await repositoryApi.getRecommendedIssues(ownerParam, repoParam, exploreParams);
      }

      if (issuesData?.success) {
        setIssues(Array.isArray(issuesData.issues) ? issuesData.issues : []);
        if (issuesData.message) {
          setBackendMessage(issuesData.message);
        }
      } else {
        setError(issuesData?.message || 'Failed to load issues.');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not fetch issues for this repository.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ownerParam, repoParam, tabParam, getQueryParams]);

  useEffect(() => {
    fetchIssuesAndRepo();
  }, [fetchIssuesAndRepo]);

  const handleSelectRepository = (owner, repo) => {
    setSearchParams({ owner, repo, tab: tabParam });
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (ownerInput.trim() && repoInput.trim()) {
      setSearchParams({
        owner: ownerInput.trim(),
        repo: repoInput.trim(),
        tab: tabParam,
      });
    }
  };

  const setTab = (tab) => {
    setSearchParams({
      owner: ownerParam,
      repo: repoParam,
      tab,
    });
  };

  // Collect unique labels across fetched issues
  const allLabels = Array.from(
    new Set(
      issues
        .flatMap((i) => (i.labels || []).map((l) => l.name))
        .filter(Boolean)
    )
  ).sort();

  // Filter issues by state, label, and keyword
  const displayedIssues = issues.filter((issue) => {
    const matchesSearch =
      searchTerm === '' ||
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.labels && issue.labels.some((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesState = stateFilter === 'all' || issue.state === stateFilter;

    const matchesLabel =
      selectedLabel === 'ALL' ||
      (issue.labels && issue.labels.some((l) => l.name === selectedLabel));

    return matchesSearch && matchesState && matchesLabel;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Target Repository Selector / Header */}
      <div className="content-card rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[#ff7200]/10 border border-[#ff7200]/30 text-[#ff7200] text-sm">
                🎯
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                Browse Repository Issues
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Discover real GitHub issues and starter tasks matched to your skills, experience level, and available time.
            </p>
          </div>

          {/* Quick Repo Dropdown */}
          {quickRepos.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-300 font-semibold uppercase tracking-wider">Quick Repo:</span>
              <select
                value={ownerParam && repoParam ? `${ownerParam}/${repoParam}` : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [o, r] = e.target.value.split('/');
                    handleSelectRepository(o, r);
                  }
                }}
                className="px-3.5 py-2 praro-input rounded-lg text-xs text-white cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">Select recommended repo...</option>
                {quickRepos.map((r) => (
                  <option
                    key={r.fullName || `${r.owner}/${r.name}`}
                    value={`${r.owner}/${r.name}`}
                    className="bg-slate-900 text-slate-200"
                  >
                    {r.name} ({r.language || 'Code'}) {r.matchScore !== undefined ? `[${r.matchScore}% Match]` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Repository Input Form */}
        <form onSubmit={handleManualSearch} className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Repository Owner
            </label>
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              placeholder="e.g. facebook, vercel, expressjs"
              className="w-full px-3.5 py-2 praro-input rounded-lg text-xs text-white placeholder-slate-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Repository Name
            </label>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. react, next.js, express"
              className="w-full px-3.5 py-2 praro-input rounded-lg text-xs text-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
          >
            Find Issues
          </button>
        </form>

        {/* Selected Repository Card Banner */}
        {repositoryDetails && (
          <div className="mt-5 p-4 bg-slate-900/80 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white">
                  {repositoryDetails.fullName || `${repositoryDetails.owner}/${repositoryDetails.name}`}
                </span>
                {repositoryDetails.language && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30">
                    {repositoryDetails.language}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {repositoryDetails.description || 'No description provided.'}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                <span>★ {Number(repositoryDetails.stars || 0).toLocaleString()}</span>
                <span>⑂ {Number(repositoryDetails.forks || 0).toLocaleString()}</span>
                <span>⊙ {repositoryDetails.openIssues || 0} open issues</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {repositoryDetails.url && (
                <a
                  href={repositoryDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs and Filtering Bar */}
      {ownerParam && repoParam && (
        <div className="content-card rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            {/* Recommendation Mode Tabs */}
            <div className="flex bg-slate-900/90 border border-white/10 p-1.5 rounded-xl self-start">
              <button
                onClick={() => setTab('recommended')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  tabParam === 'recommended'
                    ? 'bg-[#ff7200] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Recommended Issues (Scored)
              </button>
              <button
                onClick={() => setTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  tabParam === 'all'
                    ? 'bg-[#ff7200] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All Repository Issues
              </button>
            </div>

            <span className="text-xs text-slate-300">
              Showing <strong className="text-[#ff7200]">{displayedIssues.length}</strong> of{' '}
              <strong className="text-white">{issues.length}</strong> issues
            </span>
          </div>

          {/* Active Explore Preferences Context Banner */}
          {tabParam === 'recommended' && (
            <div className="p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-base text-[#ff7200]">🎯</span>
                {hasActivePreferences() ? (
                  <span className="leading-relaxed">
                    <strong className="text-white font-semibold uppercase tracking-wider">Scoring Active:</strong> Ranked using explore preferences{' '}
                    {explorePreferences.languages?.length > 0 && `[Languages: ${explorePreferences.languages.join(', ')}] `}
                    {explorePreferences.skills?.length > 0 && `[Skills: ${explorePreferences.skills.join(', ')}] `}
                    {explorePreferences.experienceLevel && `[Level: ${explorePreferences.experienceLevel}] `}
                    {explorePreferences.availableHours && `[Time: ${explorePreferences.availableHours}] `}
                  </span>
                ) : (
                  <span>
                    <strong className="text-white font-semibold uppercase tracking-wider">Unranked Mode:</strong> No explore preferences active. Issues displayed unranked.
                  </span>
                )}
              </div>
              <Link
                to="/repositories"
                className="text-[#ff7200] hover:underline font-bold uppercase tracking-wider shrink-0 transition"
              >
                Adjust Preferences ↗
              </Link>
            </div>
          )}

          {/* Filtering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Filter by Keyword
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search issue title or description..."
                className="w-full px-3.5 py-2 praro-input rounded-lg text-xs text-white placeholder-slate-400"
              />
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Issue State
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3.5 py-2 praro-input rounded-lg text-xs text-slate-200 cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-slate-200">All States</option>
                <option value="open" className="bg-slate-900 text-slate-200">Open Only</option>
                <option value="closed" className="bg-slate-900 text-slate-200">Closed Only</option>
              </select>
            </div>

            {/* Label Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Filter by Label
              </label>
              <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="w-full px-3.5 py-2 praro-input rounded-lg text-xs text-slate-200 cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-400">All Labels</option>
                {allLabels.map((lbl) => (
                  <option key={lbl} value={lbl} className="bg-slate-900 text-slate-200">
                    {lbl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Backend Alert Message if empty or info */}
      {backendMessage && (
        <Alert
          type="info"
          message={backendMessage}
          onClose={() => setBackendMessage('')}
        />
      )}

      {/* Error State */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner text={`Fetching issues for ${ownerParam}/${repoParam}...`} />
      ) : !ownerParam || !repoParam ? (
        /* Empty Prompt State */
        <div className="content-card rounded-2xl p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            📂
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            Select a repository to explore issues
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            Choose one of your recommended repositories above or browse repositories to start discovering issues.
          </p>
          <div className="mt-6">
            <Link
              to="/repositories"
              className="btn-orange inline-block px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Browse Recommended Repositories
            </Link>
          </div>
        </div>
      ) : displayedIssues.length === 0 ? (
        /* No Issues Found State */
        <div className="content-card rounded-2xl p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            📋
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            No issues found
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            {backendMessage ||
              'No public issues matched the active filters or your current profile preferences.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStateFilter('all');
                setSelectedLabel('ALL');
              }}
              className="btn-orange-outline px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setTab('all')}
              className="btn-orange px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              View All Repository Issues
            </button>
          </div>
        </div>
      ) : (
        /* Issues List */
        <div className="space-y-4">
          {displayedIssues.map((issue) => (
            <IssueCard
              key={issue.githubId || issue.number}
              issue={issue}
              repoContext={`${ownerParam}/${repoParam}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Issues;
