import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import repositoryApi from '../api/repositoryApi';
import RepositoryCard from '../components/common/RepositoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ExplorePreferencesPanel from '../components/common/ExplorePreferencesPanel';
import useExplore from '../hooks/useExplore';
import useAuth from '../hooks/useAuth';

const Repositories = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  // Unauthenticated visitors default to 'all' public repositories; authenticated users default to 'recommended'
  const activeTab = urlTab || (isAuthenticated ? 'recommended' : 'all');

  const { getQueryParams, hasActivePreferences, preferenceSource, clearPreferences } = useExplore();

  // Reset temporary explore preferences when navigating directly from profile page
  useEffect(() => {
    if (searchParams.get('source') === 'profile') {
      clearPreferences();
    }
  }, [searchParams, clearPreferences]);

  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendMessage, setBackendMessage] = useState('');

  // Client-side quick filter inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [minMatchScore, setMinMatchScore] = useState(0);

  const handleTabChange = (targetTab) => {
    if (targetTab === 'recommended' && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/repositories', search: '?tab=recommended' },
          message: 'Sign in to access personalized repository recommendations scored against your developer profile.',
        },
      });
      return;
    }
    setSearchParams({ tab: targetTab });
  };

  const fetchRepositories = useCallback(async () => {
    // If visitor is unauthenticated and hits recommended tab, redirect to login
    if (activeTab === 'recommended' && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: {
          from: { pathname: '/repositories', search: '?tab=recommended' },
          message: 'Sign in to access personalized repository recommendations scored against your developer profile.',
        },
      });
      return;
    }

    setLoading(true);
    setError('');
    setBackendMessage('');

    try {
      const exploreParams = getQueryParams();
      let data;
      if (activeTab === 'recommended') {
        data = await repositoryApi.getRecommendedRepositories(exploreParams);
      } else if (activeTab === 'filtered') {
        data = await repositoryApi.getFilteredRepositories(exploreParams);
      } else {
        data = await repositoryApi.searchRepositories(exploreParams);
      }

      if (data?.success) {
        setRepositories(Array.isArray(data.repositories) ? data.repositories : []);
        if (data.message) {
          setBackendMessage(data.message);
        }
      } else {
        setError(data?.message || 'Failed to load repositories');
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not load repositories from GitHub API through backend.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, getQueryParams, isAuthenticated, navigate]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  // Extract unique languages present in current repository list for filter dropdown
  const availableLanguages = Array.from(
    new Set(
      repositories
        .map((r) => r.language)
        .filter((l) => Boolean(l && l.trim()))
    )
  ).sort();

  // Filtered repositories based on in-page search and filters
  const displayedRepositories = repositories.filter((repo) => {
    const matchesSearch =
      searchTerm === '' ||
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.owner && repo.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (repo.topics && repo.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesLanguage =
      selectedLanguage === 'ALL' ||
      (repo.language && repo.language.toLowerCase() === selectedLanguage.toLowerCase());

    const matchesScore =
      minMatchScore === 0
        ? true
        : typeof repo.matchScore === 'number' && repo.matchScore >= minMatchScore;

    return matchesSearch && matchesLanguage && matchesScore;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('ALL');
    setMinMatchScore(0);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="content-card rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[#ff7200]/10 border border-[#ff7200]/30 text-[#ff7200] text-sm">
                📂
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                Explore Repositories
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Discover real GitHub open-source repositories calibrated to your programming languages and contribution interests.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-900/90 border border-white/10 p-1.5 rounded-xl self-start md:self-auto">
            <button
              onClick={() => handleTabChange('recommended')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recommended'
                  ? 'bg-[#ff7200] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={!isAuthenticated ? 'Sign in to access personalized scoring' : 'Personalized repository recommendations'}
            >
              <span>Recommended (Scored)</span>
              {!isAuthenticated && <span className="text-[10px] opacity-80">🔒</span>}
            </button>
            <button
              onClick={() => handleTabChange('filtered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'filtered'
                  ? 'bg-[#ff7200] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Filtered
            </button>
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#ff7200] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Repositories
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Keyword Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Search by Keyword / Topic
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by repo name, topic, or keyword..."
              className="w-full px-3.5 py-2.5 praro-input rounded-lg text-xs text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Filter by Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 praro-input rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-400">All Languages</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Match Score Filter (only in recommended tab) */}
          {activeTab === 'recommended' ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Min Match Score
                </label>
                <span className="text-xs font-bold text-[#ff7200]">
                  {minMatchScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full mt-2 accent-[#ff7200] cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white border border-white/10 bg-slate-900 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Filter Summary */}
        {(searchTerm || selectedLanguage !== 'ALL' || minMatchScore > 0) && (
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>
              Showing <strong className="text-[#ff7200]">{displayedRepositories.length}</strong> of{' '}
              <strong className="text-white">{repositories.length}</strong> repositories
            </span>
            <button
              onClick={handleClearFilters}
              className="text-[#ff7200] hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Independent Explore Preferences Panel */}
      <ExplorePreferencesPanel onApply={fetchRepositories} />

      {/* Discovery Mode Indicator Banner */}
      {preferenceSource === 'custom' && hasActivePreferences() ? (
        <div className="content-card rounded-2xl border-l-4 border-l-[#ff7200] p-4 text-xs text-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg text-[#ff7200]">🎯</span>
            <div className="leading-relaxed">
              <strong className="text-white font-semibold">Custom Explore Preferences Active:</strong> Repositories are scored according to your temporary selections. Your saved profile in MongoDB remains completely unchanged.
            </div>
          </div>
        </div>
      ) : activeTab === 'recommended' && isAuthenticated ? (
        <div className="content-card rounded-2xl border-l-4 border-l-[#ff7200] p-4 text-xs text-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg text-[#ff7200]">👤</span>
            <div className="leading-relaxed">
              <strong className="text-white font-semibold">Personalized Saved Profile Recommendations:</strong> Repositories are ranked using your saved preferences in MongoDB ({user?.languages?.length ? `Languages: ${user.languages.join(', ')}` : 'Languages: None'}{user?.interests?.length ? ` • Interest: ${user.interests.join(', ')}` : ''}{user?.skills?.length ? ` • Skills: ${user.skills.join(', ')}` : ''}{user?.experienceLevel ? ` • ${user.experienceLevel}` : ''}).
            </div>
          </div>
        </div>
      ) : !hasActivePreferences() ? (
        <div className="content-card rounded-2xl p-4 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-lg">🌐</span>
            <div className="leading-relaxed">
              <strong className="text-white font-semibold">Unranked Discovery:</strong> Showing popular public GitHub repositories without personalized rankings. Use the Explore Preferences Panel above or complete your profile to enable personalized match scoring.
            </div>
          </div>
        </div>
      ) : null}

      {/* Backend Alert Message if empty or informational */}
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
        <LoadingSpinner text="Fetching repositories and calculating match scores..." />
      ) : displayedRepositories.length === 0 ? (
        /* Empty State */
        <div className="content-card rounded-2xl p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            🔍
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            No repositories found
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            {backendMessage ||
              'No repositories matched your current query or filters. Consider adjusting your explore preferences, clearing language/keyword filters, or resetting preferences.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                handleClearFilters();
                clearPreferences();
              }}
              className="btn-orange-outline px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              Reset Preferences
            </button>
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Edit Saved Profile
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: '/repositories', message: 'Sign in to save your developer profile and enable personalized matching.' }}
                className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Sign In to Plan
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Repositories Grid */
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {activeTab === 'recommended'
                  ? `Recommended Repositories (${displayedRepositories.length})`
                  : `Repositories Found (${displayedRepositories.length})`}
              </p>
            </div>
            <button
              onClick={fetchRepositories}
              className="text-xs text-[#ff7200] hover:underline font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
            >
              <span>↻</span> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedRepositories.map((repo) => (
              <RepositoryCard key={repo.githubId || repo.fullName} repo={repo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Repositories;
