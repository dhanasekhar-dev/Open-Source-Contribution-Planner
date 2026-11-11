import React from 'react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-rose-950/50 text-rose-200 border-rose-500/50',
    success: 'bg-emerald-950/50 text-emerald-200 border-emerald-500/50',
    warning: 'bg-amber-950/50 text-amber-200 border-amber-500/50',
    info: 'bg-cyan-950/50 text-cyan-200 border-cyan-500/50 glow-cyan',
  };

  const icons = {
    error: '⚠️',
    success: '✓',
    warning: '⚡',
    info: '📡',
  };

  return (
    <div
      className={`p-4 rounded-xl border backdrop-blur-xl flex items-start justify-between text-xs sm:text-sm shadow-xl font-mono ${
        styles[type] || styles.info
      } ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-2.5 mr-2">
        <span className="text-base select-none">{icons[type] || '📡'}</span>
        <div className="leading-relaxed font-sans text-xs sm:text-sm">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white transition font-bold px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
