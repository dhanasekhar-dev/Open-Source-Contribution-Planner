import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import repositoryApi from '../api/repositoryApi';
import RepositoryCard from '../components/common/RepositoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendedRepos, setRecommendedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopRecommendations = async () => {
      setLoading(true);
      try {
        const data = await repositoryApi.getRecommendedRepositories();
        if (data?.success && Array.isArray(data.repositories)) {
          setRecommendedRepos(data.repositories.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not fetch dashboard recommendations:', err);
        setError('Could not load top recommendations. Set your languages and skills in Profile to calibrate results.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRecommendations();
  }, []);

  const hasPreferences =
    user?.languages?.length > 0 ||
    user?.skills?.length > 0 ||
    Boolean(user?.experienceLevel);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden content-card p-6 sm:p-8">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff7200]/10 border border-[#ff7200]/30 text-[#ff7200] text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Developer Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
            Welcome back, <span className="text-[#ff7200]">{user?.name || 'Developer'}</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl font-normal">
            Track your open-source journey, calibrate your skill stack, and discover active GitHub repositories looking for your contributions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/repositories?tab=recommended&source=profile"
              className="btn-orange px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
            >
              <span>Explore Matched Repositories</span>
              <span>→</span>
            </Link>
            <Link
              to="/issues"
              className="btn-orange-outline px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-2"
            >
              <span>Browse Issues</span>
            </Link>
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold tracking-wider uppercase transition"
            >
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Developer Profile Overview Stats */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Your Profile Highlights
            </h2>
          </div>
          <Link to="/profile" className="text-xs text-[#ff7200] hover:underline font-semibold">
            Manage Profile →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Languages */}
          <div className="content-card p-5 rounded-2xl content-card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Languages</span>
              <span className="text-[#ff7200] text-base">💻</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.languages?.length || 0}
            </p>
            <p className="text-xs text-slate-300 mt-1 truncate">
              {user?.languages?.length ? user.languages.join(', ') : 'None configured'}
            </p>
          </div>

          {/* Skills */}
          <div className="content-card p-5 rounded-2xl content-card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Frameworks</span>
              <span className="text-[#ff7200] text-base">⚡</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.skills?.length || 0}
            </p>
            <p className="text-xs text-slate-300 mt-1 truncate">
              {user?.skills?.length ? user.skills.join(', ') : 'No skills set'}
            </p>
          </div>

          {/* Experience */}
          <div className="content-card p-5 rounded-2xl content-card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Experience Level</span>
              <span className="text-[#ff7200] text-base">🎯</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white truncate">
              {user?.experienceLevel ? user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1) : 'Not specified'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Issue difficulty filter</p>
          </div>

          {/* Weekly Time */}
          <div className="content-card p-5 rounded-2xl content-card-hover">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Available Time</span>
              <span className="text-[#ff7200] text-base">⏱️</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white truncate">
              {user?.availableHours || 'Flexible'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Weekly availability</p>
          </div>
        </div>
      </div>

      {/* If profile preferences are empty, prompt user */}
      {!hasPreferences && (
        <div className="p-5 rounded-2xl content-card border-l-4 border-l-[#ff7200] flex items-start gap-4">
          <span className="text-2xl p-2 rounded-xl bg-[#ff7200]/10 text-[#ff7200] shrink-0">
            💡
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Complete your profile for customized recommendations
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Adding your preferred programming languages (JavaScript, Python, Go, etc.) and experience level enables our matching engine to calculate relevant repository scores for you.
            </p>
            <Link
              to="/profile"
              className="inline-block mt-3 text-xs font-bold text-[#ff7200] hover:underline uppercase tracking-wider transition"
            >
              Configure Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Top Recommended Repositories Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
                Recommended Repositories For You
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live GitHub repositories matching your saved languages, skills, and experience level.
            </p>
          </div>
          <Link
            to="/repositories?tab=recommended"
            className="text-xs font-bold uppercase tracking-wider text-[#ff7200] hover:underline flex items-center gap-1"
          >
            <span>View All Recommendations</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recommended repositories from GitHub..." size="md" />
        ) : error ? (
          <div className="content-card rounded-2xl p-8 text-center text-slate-300 text-sm">
            {error}
          </div>
        ) : recommendedRepos.length === 0 ? (
          <div className="content-card rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-base font-bold text-white uppercase tracking-wider">
              No recommended repositories found yet
            </p>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Configure your profile languages and interests, or use Explore Preferences to discover open-source projects right now.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/profile"
                className="btn-orange px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Set Up Profile
              </Link>
              <Link
                to="/repositories"
                className="btn-orange-outline px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Explore All Repositories
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedRepos.map((repo) => (
              <RepositoryCard key={repo.githubId || repo.fullName} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
