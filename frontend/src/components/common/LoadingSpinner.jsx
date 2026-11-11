import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-14 w-14 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative">
        <div className={`animate-spin rounded-full border-slate-700 border-t-[#ff7200] border-r-[#ff7200] ${sizeClasses[size] || sizeClasses.md}`} />
      </div>
      {text && (
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
