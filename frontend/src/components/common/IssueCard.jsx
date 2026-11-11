import React from 'react';

const IssueCard = ({ issue, repoContext }) => {
  if (!issue) return null;

  const hasScore = issue.matchScore !== null && issue.matchScore !== undefined;

  // Format match score display nicely
  const numericScore = hasScore
    ? issue.matchScore <= 1
      ? Math.round(issue.matchScore * 100)
      : Math.round(issue.matchScore)
    : null;

  const isHighMatch = numericScore !== null && numericScore >= 75;
  const isMidMatch = numericScore !== null && numericScore >= 45;

  return (
    <div className="content-card rounded-2xl p-5 content-card-hover flex flex-col justify-between">
      <div>
        {/* Header: Title, Number, State, Score */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
              {repoContext && (
                <span className="font-semibold text-slate-200 bg-slate-900/90 px-2 py-0.5 rounded-md border border-white/10">
                  {repoContext}
                </span>
              )}
              <span className="text-slate-400 font-mono">#{issue.number}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  issue.state === 'open'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {issue.state}
              </span>
            </div>

            <h3 className="text-base font-bold text-white hover:text-[#ff7200] transition leading-snug">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open on GitHub"
              >
                {issue.title}
              </a>
            </h3>
          </div>

          <div className="shrink-0">
            {numericScore !== null ? (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                  isHighMatch
                    ? 'bg-[#ff7200]/20 text-[#ff7200] border-[#ff7200]/60'
                    : isMidMatch
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-white/10'
                }`}
              >
                {numericScore}% Match
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] text-slate-400 bg-slate-900 border border-white/10 font-medium">
                Unranked
              </span>
            )}
          </div>
        </div>

        {/* Description snippet */}
        {issue.description && (
          <p className="text-xs text-slate-300 line-clamp-3 my-2.5 whitespace-pre-line leading-relaxed font-normal">
            {issue.description}
          </p>
        )}

        {/* Match Reasons */}
        {issue.matchReasons && issue.matchReasons.length > 0 && (
          <div className="bg-slate-900/80 border border-[#ff7200]/20 rounded-xl p-3 my-3">
            <p className="text-[11px] font-bold text-[#ff7200] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>Match Highlights</span>
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {issue.matchReasons.map((reason, idx) => (
                <li key={idx} className="leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {issue.labels.map((label, idx) => {
              const bg = label.color ? `#${label.color}` : '#3b82f6';
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: `${bg}20`,
                    borderColor: `${bg}50`,
                    color: '#f1f5f9',
                  }}
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border truncate max-w-xs transition"
                  title={label.description || label.name}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3 text-[11px]">
          {issue.createdAt && (
            <span>
              Opened {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          )}
          {issue.assignee && (
            <span className="text-slate-300 font-medium">Assignee: @{issue.assignee}</span>
          )}
        </div>

        <div>
          {issue.url && (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff7200] hover:underline font-bold text-xs transition inline-flex items-center gap-1"
            >
              <span>View on GitHub</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
