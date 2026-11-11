import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Alert from '../components/common/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect destination after login if redirected from a protected route
  const from =
    typeof location.state?.from === 'string'
      ? location.state.from
      : location.state?.from?.pathname
      ? `${location.state.from.pathname}${location.state.from.search || ''}`
      : '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Authentication failed. Check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-landscape flex items-center justify-center py-8 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Side: Bold Typography & Hero Mission */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff7200]/10 border border-[#ff7200]/30 text-[#ff7200] text-xs font-semibold tracking-wider uppercase">
            <span>Open Source Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight uppercase">
            OPEN SOURCE <br />
            <span className="text-[#ff7200]">CONTRIBUTION</span> <br />
            STARTS HERE.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
            Discover open-source projects that match your programming languages, skills, interests, and available time. Find meaningful issues and start contributing to real-world software.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/repositories"
              className="btn-orange px-7 py-3 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
            >
              <span>EXPLORE PROJECTS</span>
              <span>→</span>
            </Link>

            <Link
              to="/"
              className="text-slate-300 hover:text-[#ff7200] font-medium text-sm transition-colors flex items-center gap-1.5 py-3 px-2"
            >
              <span>Learn How It Works</span>
              <span>→</span>
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">01 / Curated</span>
              <span className="text-slate-300 font-medium">Real GitHub repositories with verified health metrics.</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">02 / Calibrated</span>
              <span className="text-slate-300 font-medium">Beginner-friendly issues matched to your skill level.</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">03 / Flexible</span>
              <span className="text-slate-300 font-medium">Explore any stack without altering your saved profile.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Compact Dark PraRoz Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="praro-card rounded-2xl p-7 sm:p-9 shadow-2xl relative">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Login Here
              </h2>
              <p className="text-xs text-slate-300 mt-1.5">
                Enter your credentials to access your planner.
              </p>
            </div>

            {location.state?.message && !error && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#ff7200]/15 border border-[#ff7200]/40 text-[#ff7200] text-xs font-semibold flex items-center gap-2.5">
                <span className="text-sm">🔒</span>
                <span>{location.state.message}</span>
              </div>
            )}

            {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email Here"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#ff7200] hover:text-[#ff8a26] transition font-medium cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password Here"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg btn-orange text-sm font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>LOGGING IN...</span>
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-300">
              <span>Don't have an account?</span>{' '}
              <Link to="/register" className="text-[#ff7200] hover:underline font-bold ml-1">
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
