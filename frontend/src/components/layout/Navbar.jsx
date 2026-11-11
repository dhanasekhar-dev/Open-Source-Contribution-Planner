import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from '../common/Logo';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const guestLinks = [
    { name: 'HOME', path: '/', sectionId: 'home' },
    { name: 'EXPLORE', path: '/repositories' },
    { name: 'HOW IT WORKS', path: '/#how-it-works', sectionId: 'how-it-works' },
    { name: 'ABOUT', path: '/#about', sectionId: 'about' },
    { name: 'LOGIN', path: '/login' },
  ];

  const authLinks = [
    { name: 'HOME', path: '/', sectionId: 'home' },
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'REPOSITORIES', path: '/repositories' },
    { name: 'ISSUES', path: '/issues' },
    { name: 'PROFILE', path: '/profile' },
  ];

  // Scroll and section tracking on the Landing page
  useEffect(() => {
    if (location.pathname !== '/') return;

    // If URL has a section hash on mount or hash change, scroll to it
    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      if (['home', 'how-it-works', 'about'].includes(hashId)) {
        setActiveSection(hashId);
        const targetEl = document.getElementById(hashId);
        if (targetEl) {
          const navOffset = 80;
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    }

    // Scroll listener to update active section as user scrolls
    const handleScroll = () => {
      const navOffset = 85;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 1. If user scrolled to near the bottom of the page, activate 'about'
      if (windowHeight + scrollY >= documentHeight - 60) {
        setActiveSection('about');
        return;
      }

      // 2. If near top of page, activate 'home'
      if (scrollY < 120) {
        setActiveSection('home');
        return;
      }

      // 3. Check section positions from bottom to top
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        if (rect.top <= navOffset + 120) {
          setActiveSection('about');
          return;
        }
      }

      const howItWorksEl = document.getElementById('how-it-works');
      if (howItWorksEl) {
        const rect = howItWorksEl.getBoundingClientRect();
        if (rect.top <= navOffset + 120) {
          setActiveSection('how-it-works');
          return;
        }
      }

      setActiveSection('home');
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname, location.hash]);

  // Handle smooth scrolling when clicking navigation links
  const handleNavClick = (e, link) => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    // When clicking a section link while on the landing page ('/')
    if (location.pathname === '/') {
      if (link.name === 'HOME') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
        window.history.pushState(null, '', '/');
        return;
      }

      if (link.path.includes('#')) {
        e.preventDefault();
        const sectionId = link.path.split('#')[1];
        const el = document.getElementById(sectionId);
        if (el) {
          const navOffset = 80;
          const y = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          setActiveSection(sectionId);
          window.history.pushState(null, '', `#${sectionId}`);
        }
        return;
      }
    }
  };

  // Determine if a link should display the active orange underline
  const isLinkActive = (link) => {
    if (location.pathname === '/') {
      if (link.name === 'HOME') {
        return activeSection === 'home';
      }
      if (link.name === 'HOW IT WORKS') {
        return activeSection === 'how-it-works';
      }
      if (link.name === 'ABOUT') {
        return activeSection === 'about';
      }
      if (link.path && !link.path.includes('#')) {
        return location.pathname === link.path && link.path !== '/';
      }
      return false;
    }

    // When on internal pages (/repositories, /dashboard, /profile, /issues, /login)
    if (link.path.includes('#')) {
      return false;
    }
    return location.pathname === link.path;
  };

  return (
    <nav className="w-full bg-[#0b1120]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo & Project Name */}
          <div
            className="flex items-center cursor-pointer"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('home');
                window.history.pushState(null, '', '/');
              }
            }}
          >
            <Logo size="md" to="/" />
          </div>

          {/* Right: Horizontal Menu Links */}
          <div className="hidden md:flex items-center space-x-8 font-medium">
            {isAuthenticated ? (
              <>
                {authLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={(e) => handleNavClick(e, link)}
                      className={`text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer pb-1 ${
                        active
                          ? 'text-[#ff7200] font-bold border-b-2 border-[#ff7200]'
                          : 'text-white/90 hover:text-[#ff7200] border-b-2 border-transparent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}

                <div className="h-4 w-px bg-white/20 mx-1" />

                {/* User Identity Pill linking to profile */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-[#ff7200]/40 text-xs text-white transition cursor-pointer"
                  title="View your profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-5 h-5 rounded-full object-cover border border-[#ff7200]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#ff7200] flex items-center justify-center text-[10px] font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="font-medium max-w-[120px] truncate text-slate-200">
                    {user?.name || user?.email || 'User'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-white/20 text-white/80 hover:text-white hover:border-[#ff7200] hover:bg-[#ff7200]/10 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {guestLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={(e) => handleNavClick(e, link)}
                      className={`text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer pb-1 ${
                        active
                          ? 'text-[#ff7200] font-bold border-b-2 border-[#ff7200]'
                          : 'text-white/90 hover:text-[#ff7200] border-b-2 border-transparent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-white hover:text-[#ff7200] focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d1424] border-t border-white/10 px-4 pt-4 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              {authLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`block px-3 py-2 rounded-md text-xs font-semibold tracking-wider ${
                      active
                        ? 'text-[#ff7200] bg-white/5 font-bold border-l-2 border-[#ff7200]'
                        : 'text-white/90 hover:text-[#ff7200]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-xs text-slate-300"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-5 h-5 rounded-full object-cover border border-[#ff7200]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#ff7200] flex items-center justify-center text-[10px] font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="truncate max-w-[140px] font-medium">{user?.name || user?.email}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-300 border border-rose-500/30 rounded-md cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {guestLinks.map((link) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`block px-3 py-2 rounded-md text-xs font-semibold tracking-wider ${
                      active
                        ? 'text-[#ff7200] bg-white/5 font-bold border-l-2 border-[#ff7200]'
                        : 'text-white/90 hover:text-[#ff7200]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
