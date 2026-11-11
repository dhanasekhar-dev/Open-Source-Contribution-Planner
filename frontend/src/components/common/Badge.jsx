import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border-white/10',
    primary: 'bg-[#ff7200]/15 text-[#ff7200] border-[#ff7200]/40',
    orange: 'bg-[#ff7200]/15 text-[#ff7200] border-[#ff7200]/40',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  };

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-0.5 tracking-tight',
    sm: 'text-xs px-2.5 py-1 tracking-tight',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
