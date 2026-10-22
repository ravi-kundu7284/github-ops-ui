import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1117] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#238636] hover:bg-[#2ea043] text-white border border-[#2ea043]/30 focus:ring-emerald-500 shadow-sm',
    secondary: 'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] focus:ring-slate-500',
    danger: 'bg-[#da3633] hover:bg-[#b62324] text-white border border-red-700/50 focus:ring-red-500 shadow-sm',
    outline: 'bg-transparent hover:bg-[#21262d] text-[#c9d1d9] border border-[#30363d] focus:ring-sky-500',
    ghost: 'bg-transparent hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] border-transparent focus:ring-slate-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" className="text-current" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
};
