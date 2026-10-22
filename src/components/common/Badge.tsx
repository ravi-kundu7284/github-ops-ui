import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  const variantStyles = {
    default: 'bg-[#21262d] text-[#c9d1d9] border-[#30363d]',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    danger: 'bg-red-950/60 text-red-300 border-red-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    info: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    outline: 'bg-transparent text-slate-300 border-[#30363d]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
