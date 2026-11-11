import React from 'react';
import { Link } from 'react-router-dom';

const RepositoryCard = ({ repo, onSelectRepo }) => {
  if (!repo) return null;

  const hasScore = repo.matchScore !== undefined && repo.matchScore !== null;
  const isHighMatch = hasScore && repo.matchScore >= 80;
  const isMidMatch = hasScore && repo.matchScore >= 50;

  return (
    <div className="content-card rounded-2xl p-5 sm:p-6 content-card-hover flex flex-col justify-between h-full relative group">
      <div>
        {/* Header: Name, Language & Match Score */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold tracking-wider text-[#ff7200] uppercase block mb-1">
              {repo.language || 'Codebase'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#ff7200] transition truncate">
              {repo.name}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
              {repo.fullName || `${repo.owner}/${repo.name}`}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            {hasScore ? (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  isHighMatch
                    ? 'bg-[#ff7200]/20 text-[#ff7200] border-[#ff7200]/60'
                    : isMidMatch
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-white/10'
                }`}
              >
                {repo.matchScore}% Match
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] text-slate-400 bg-slate-900 border border-white/10 font-medium">
                Unranked
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 my-2.5 leading-relaxed font-normal">
          {repo.description || 'No description provided by repository maintainers.'}
        </p>

        {/* Match Reasons (only when meaningfully present) */}
        {repo.matchReasons && repo.matchReasons.length > 0 && (
          <div className="bg-slate-900/80 border border-[#ff7200]/20 rounded-xl p-3 my-3">
            <p className="text-[11px] font-bold text-[#ff7200] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Why this matches your profile</span>
            </p>
            <ul className="text-xs text-slate-300 space-y-1">
              {repo.matchReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#ff7200] font-bold">•</span>
                  <span className="truncate">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata Badges: Language and Topics */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {repo.language && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ff7200]/15 text-[#ff7200] border border-[#ff7200]/30">
              {repo.language}
            </span>
          )}
          {repo.topics &&
            repo.topics.slice(0, 4).map((topic, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] text-slate-300 bg-slate-900/90 border border-white/10"
              >
                #{topic}
              </span>
            ))}
          {repo.topics && repo.topics.length > 4 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{repo.topics.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Stats & Actions */}
      <div className="pt-4 border-t border-white/10 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 text-xs font-medium">
          <span title="Stars" className="flex items-center gap-1 text-slate-200">
            <span className="text-amber-400">★</span>
            <span>{Number(repo.stars || 0).toLocaleString()}</span>
          </span>
          <span title="Forks" className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">⑂</span>
            <span>{Number(repo.forks || 0).toLocaleString()}</span>
          </span>
          <span title="Open Issues" className="flex items-center gap-1 text-slate-200">
            <span className="text-slate-400">⊙</span>
            <span>{repo.openIssues !== undefined ? repo.openIssues : 'N/A'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to={`/issues?owner=${encodeURIComponent(repo.owner)}&repo=${encodeURIComponent(repo.name)}`}
            onClick={() => onSelectRepo && onSelectRepo(repo)}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-[#ff7200]/50 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Explore Issues →
          </Link>
          <a
            href={repo.url || `https://github.com/${repo.owner}/${repo.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-orange px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm inline-flex items-center gap-1.5"
            title="Open repository directly on GitHub"
          >
            <span>View Repository</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;
