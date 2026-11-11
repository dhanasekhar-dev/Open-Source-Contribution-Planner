import React from 'react';

/**
 * Diagrammatic visual illustration of the recommendation workflow:
 * Developer Skills & Availability -> Matching Algorithm -> Scored Repositories & Good First Issues
 * Built with pure CSS & inline SVG, compact and lightweight.
 */
const WorkflowIllustration = ({ className = '' }) => {
  return (
    <div
      className={`relative rounded-2xl bg-slate-900/40 border border-slate-800/80 p-4 overflow-hidden backdrop-blur-md select-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle ambient background glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Workflow Diagram Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-2 relative z-10 text-xs">
        {/* Step 1: Developer Criteria (4 cols) */}
        <div className="sm:col-span-4 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Developer Profile</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 shadow-sm">
            <div className="flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                TypeScript
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                Python
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                React
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
              <span>Level: Beginner</span>
              <span className="text-slate-500">•</span>
              <span>5 hrs/week</span>
            </div>
          </div>
        </div>

        {/* Connector Arrow 1 (1 col) */}
        <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* Step 2: Scoring Engine Hub (2 cols) */}
        <div className="sm:col-span-2 flex flex-col items-center justify-center py-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600/30 via-indigo-500/20 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <span className="text-base">⚡</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mt-1 text-center">
            Match Engine
          </span>
          <span className="text-[9px] text-slate-500 text-center">Multi-Factor Scoring</span>
        </div>

        {/* Connector Arrow 2 (1 col) */}
        <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
          <svg className="w-5 h-5 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* Step 3: Recommendations Output (3 cols) */}
        <div className="sm:col-span-3 space-y-2">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Target Output</span>
          </div>

          <div className="space-y-1.5">
            {/* Repo preview pill */}
            <div className="p-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[10px]">
              <div className="flex items-center space-x-1 truncate max-w-[100px]">
                <span className="text-slate-400 font-mono truncate">expressjs/express</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[9px] font-bold">
                92% Match
              </span>
            </div>

            {/* Issue preview pill */}
            <div className="p-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[10px]">
              <div className="flex items-center space-x-1 truncate max-w-[100px]">
                <span className="text-slate-300 truncate">#142 good first issue</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-[9px] font-bold">
                Suitable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowIllustration;
