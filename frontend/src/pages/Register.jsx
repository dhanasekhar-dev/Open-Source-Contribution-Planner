import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Alert from '../components/common/Alert';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    // Client-side validations
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
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
            <span>Join Developers Worldwide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight uppercase">
            START YOUR <br />
            <span className="text-[#ff7200]">CONTRIBUTION</span> <br />
            JOURNEY TODAY.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
            Create your account to discover open-source projects tailored to your technical skills, connect with welcoming maintainers, and build a standout contribution portfolio.
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
              to="/login"
              className="text-slate-300 hover:text-[#ff7200] font-medium text-sm transition-colors flex items-center gap-1.5 py-3 px-2"
            >
              <span>Already have an account? Login</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">Personalized</span>
              <span className="text-slate-300 font-medium">Recommendations matched to your languages and weekly hours.</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">Targeted</span>
              <span className="text-slate-300 font-medium">Direct access to Good First Issues and starter tasks.</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#ff7200] font-bold block text-sm">100% Free</span>
              <span className="text-slate-300 font-medium">Built for college SPM and open-source growth.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Compact Dark PraRoz Registration Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="praro-card rounded-2xl p-7 sm:p-9 shadow-2xl relative">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-300 mt-1.5">
                Fill in your details to start planning your contributions.
              </p>
            </div>

            {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Your Full Name"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
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
                  className="w-full px-4 py-2 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                    placeholder="Min 6 chars"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2 rounded-lg praro-input text-sm text-white placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg btn-orange text-sm font-bold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>CREATING ACCOUNT...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-slate-300">
              <span>Already have an account?</span>{' '}
              <Link to="/login" className="text-[#ff7200] hover:underline font-bold ml-1">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
