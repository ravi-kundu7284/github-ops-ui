import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#8b949e]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition-colors disabled:opacity-50 disabled:bg-[#161b22] ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8b949e]">{hint}</span>}
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 4,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#8b949e]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-sm text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] transition-colors font-mono disabled:opacity-50 disabled:bg-[#161b22] ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs text-[#8b949e]">{hint}</span>}
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
};

