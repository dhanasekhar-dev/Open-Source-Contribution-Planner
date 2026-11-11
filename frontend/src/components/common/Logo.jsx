import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Recognizable Logo combining code brackets with connected repository nodes.
 * Elegant warm orange and white aesthetic matching the PraRoz design.
 */
const Logo = ({ size = 'md', to = '/', clickable = true, showSubtitle = false, className = '' }) => {
  const dimensions = {
    sm: { icon: 'w-8 h-8', text: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { icon: 'w-9 h-9', text: 'text-base font-bold', sub: 'text-[11px]' },
    lg: { icon: 'w-11 h-11', text: 'text-lg sm:text-xl font-extrabold', sub: 'text-xs' },
  }[size] || { icon: 'w-9 h-9', text: 'text-base font-bold', sub: 'text-[11px]' };

  const logoGraphic = (
    <div className={`relative shrink-0 ${dimensions.icon}`}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(255,114,0,0.35)]"
      >
        {/* Background rounded squircle with subtle border */}
        <rect
          x="1"
          y="1"
          width="42"
          height="42"
          rx="11"
          fill="url(#logo-bg)"
          stroke="#ff7200"
          strokeWidth="1.5"
        />

        {/* Network connection branches */}
        <path
          d="M12 28L22 16L32 28"
          stroke="#ff7200"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <path
          d="M22 16V33"
          stroke="#ff7200"
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Code Glyph < / > in center */}
        <path
          d="M17 20L13.5 23L17 26"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27 20L30.5 23L27 26"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23 19.5L21 26.5"
          stroke="#ff7200"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Connected Node dots */}
        <circle cx="22" cy="13" r="3" fill="#ff7200" />
        <circle cx="22" cy="13" r="1.5" fill="#FFFFFF" />

        <circle cx="11" cy="29" r="2.75" fill="#ff7200" />
        <circle cx="11" cy="29" r="1.25" fill="#FFFFFF" />

        <circle cx="33" cy="29" r="2.75" fill="#ff7200" />
        <circle cx="33" cy="29" r="1.25" fill="#FFFFFF" />

        <circle cx="22" cy="34" r="2" fill="#ff7200" opacity="0.8" />

        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="0.6" stopColor="#1E293B" />
            <stop offset="1" stopColor="#0B1120" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  const textContent = (
    <div className="flex flex-col">
      <span className={`tracking-tight text-white leading-tight font-semibold ${dimensions.text}`}>
        Open-Source <span className="text-[#ff7200] font-bold">Contribution Planner</span>
      </span>
      {showSubtitle && (
        <span className={`text-slate-400 font-normal tracking-normal ${dimensions.sub}`}>
          Intelligent GitHub Matching Engine
        </span>
      )}
    </div>
  );

  if (!clickable) {
    return (
      <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
        {logoGraphic}
        {textContent}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`inline-flex items-center space-x-3 group hover:opacity-95 transition-opacity cursor-pointer ${className}`}
      title="Open-Source Contribution Planner"
    >
      {logoGraphic}
      {textContent}
    </Link>
  );
};

export default Logo;
