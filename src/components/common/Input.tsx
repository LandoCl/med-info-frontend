import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col items-start gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
              leftIcon ? 'pl-10' : ''
            } ${
              error
                ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-300 dark:border-slate-800'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs font-medium text-rose-500">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-400 dark:text-slate-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
