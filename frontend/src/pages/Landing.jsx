import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import repositoryApi from '../api/repositoryApi';
import Alert from '../components/common/Alert';

const Landing = () => {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  // Login form state inside the Hero card
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sample repositories for the explore section
  const [sampleRepos, setSampleRepos] = useState([]);
  const [loadingSample, setLoadingSample] = useState(true);

  useEffect(() => {
    const fetchSample = async () => {
      try {
        const data = await repositoryApi.searchRepositories({ language: 'JavaScript' });
        if (data?.success && Array.isArray(data.repositories)) {
          setSampleRepos(data.repositories.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load sample repositories:', err);
      } finally {
        setLoadingSample(false);
      }
    };
    fetchSample();
  }, []);

  const handleHeroLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Check your credentials.';
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-100 font-sans bg-landscape min-h-screen">
      {/* =========================================================================
          1. MAIN HERO SECTION (PraRoz Reference Style)
          Landscape background with dark overlay, bold typography on left,
          compact dark login card on right.
      ========================================================================== */}
      <section id="home" className="scroll-mt-20 relative min-h-[calc(100vh-5rem)] flex items-center px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Large Bold Headline, Subtitle, & CTA */}
          <div className="lg:col-span-7 space-y-6 lg:pr-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.12]">
              OPEN SOURCE<br />
              <span className="text-[#ff7200]">CONTRIBUTION</span><br />
              STARTS HERE.
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl font-normal">
              Discover open-source projects that match your programming languages, skills, interests, and available time. Find meaningful issues and start contributing to real-world software.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-5">
              <Link
                to={isAuthenticated ? '/repositories' : '/repositories'}
                className="px-8 py-3.5 btn-orange rounded-md text-xs sm:text-sm uppercase tracking-wider font-bold inline-block cursor-pointer shadow-lg"
              >
                EXPLORE PROJECTS
              </Link>

              <a
                href="#how-it-works"
                className="text-xs sm:text-sm font-semibold text-white/90 hover:text-[#ff7200] transition-colors flex items-center gap-1.5"
              >
                <span>Learn How It Works</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Compact Dark Login Card (PraRoz Style) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="praro-card p-7 sm:p-9 rounded-2xl relative">
              {/* Heading Panel */}
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Login <span className="text-[#ff7200]">Here</span>
                </h2>
                <div className="w-12 h-0.5 bg-[#ff7200] mx-auto mt-2 rounded-full" />
              </div>

              {loginError && (
                <Alert
                  type="error"
                  message={loginError}
                  className="mb-4"
                  onClose={() => setLoginError('')}
                />
              )}

              {isAuthenticated ? (
                /* Authenticated State: Welcome card */
                <div className="text-center space-y-4 py-3">
                  <div className="w-12 h-12 rounded-full bg-[#ff7200]/20 border border-[#ff7200] text-[#ff7200] flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Welcome back, {user?.name || 'Developer'}!
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      You are signed in with <span className="text-white font-medium">{user?.email}</span>
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2.5">
                    <Link
                      to="/dashboard"
                      className="w-full py-2.5 btn-orange rounded-md text-xs uppercase font-bold text-center block"
                    >
                      GO TO DASHBOARD →
                    </Link>
                    <Link
                      to="/repositories"
                      className="w-full py-2.5 btn-orange-outline rounded-md text-xs uppercase font-medium text-center block"
                    >
                      Explore Repositories
                    </Link>
                  </div>
                </div>
              ) : (
                /* Unauthenticated State: Clean PraRoz Form */
                <form onSubmit={handleHeroLogin} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="Enter Email Here"
                      required
                      className="w-full px-4 py-3 rounded-md praro-input text-xs sm:text-sm text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="Enter Password Here"
                      required
                      className="w-full px-4 py-3 rounded-md praro-input text-xs sm:text-sm text-white placeholder-slate-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer select-none"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 btn-orange rounded-md text-xs sm:text-sm uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50 transition shadow-md"
                  >
                    {loginLoading ? 'Logging In...' : 'Login'}
                  </button>

                  <div className="pt-3 text-center text-xs text-slate-300">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-[#ff7200] hover:underline font-semibold ml-1 cursor-pointer"
                    >
                      Sign up here
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. HOW IT WORKS SECTION
          Clean, elegant dark cards explaining the contribution trajectory
      ========================================================================== */}
      <section id="how-it-works" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff7200]">
            SIMPLE 3-STEP PROCESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            How The Planner Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            No more wandering through millions of GitHub repos without direction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="content-card p-6 sm:p-8 rounded-xl content-card-hover space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff7200]/15 border border-[#ff7200]/30 flex items-center justify-center text-[#ff7200] font-bold text-base">
              1
            </div>
            <h3 className="text-base font-bold text-white">Define Your Skills</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select the programming languages you know, your framework experience, and how many hours you can realistically commit each week.
            </p>
          </div>

          <div className="content-card p-6 sm:p-8 rounded-xl content-card-hover space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff7200]/15 border border-[#ff7200]/30 flex items-center justify-center text-[#ff7200] font-bold text-base">
              2
            </div>
            <h3 className="text-base font-bold text-white">Discover Matching Repositories</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our rule-based engine scores public GitHub repositories against your profile and displays genuine match percentages and reasons.
            </p>
          </div>

          <div className="content-card p-6 sm:p-8 rounded-xl content-card-hover space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff7200]/15 border border-[#ff7200]/30 flex items-center justify-center text-[#ff7200] font-bold text-base">
              3
            </div>
            <h3 className="text-base font-bold text-white">Find Beginner-Friendly Issues</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore open issues labeled for newcomers, jump directly to GitHub, and start writing real code that makes an impact.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED REPOSITORIES PREVIEW
      ========================================================================== */}
      <section id="explore" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff7200]">
              CURATED DISCOVERY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Active Open-Source Projects
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Real public GitHub repositories ready for open-source contributors.
            </p>
          </div>
          <Link
            to="/repositories"
            className="text-xs font-semibold text-[#ff7200] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Browse All Repositories →
          </Link>
        </div>

        {loadingSample ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading public repositories from GitHub...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleRepos.map((repo) => (
              <div
                key={repo.githubId || repo.fullName}
                className="content-card p-6 rounded-xl flex flex-col justify-between content-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30">
                      {repo.language || 'Code'}
                    </span>
                    <span className="text-xs text-amber-400 font-medium">
                      ★ {Number(repo.stars || 0).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white truncate mb-1">
                    {repo.name}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {repo.description || 'Public open-source repository.'}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">@{repo.owner}</span>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff7200] hover:underline font-semibold"
                  >
                    View on GitHub ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. ABOUT SECTION
      ========================================================================== */}
      <section id="about" className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="content-card p-8 sm:p-12 rounded-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff7200]">
              ABOUT THE PROJECT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4">
              Making Open Source Accessible For Every Developer
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              The <strong>Open-Source Contribution Planner</strong> is designed to solve the common hesitation developers face when starting out: not knowing which projects fit their current skills, and not finding issues they can realistically solve.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              By separating your saved profile from temporary exploration preferences, you can freely browse repositories in new languages without rewriting your profile.
            </p>
            <Link
              to={isAuthenticated ? '/repositories' : '/register'}
              className="px-6 py-2.5 btn-orange rounded-md text-xs uppercase font-bold inline-block"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
