'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, className = '', id, ...rest },
  ref
) {
  const inputId = id || rest.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-admin-text-dark mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-admin-muted-dark">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full ${leftIcon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm rounded-lg border bg-white dark:bg-admin-surface-dark text-gray-900 dark:text-admin-text-dark placeholder-gray-400 dark:placeholder-admin-muted-dark border-gray-300 dark:border-admin-border-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 ${error ? 'border-red-500 dark:border-red-500' : ''} ${className}`}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-admin-muted-dark">{hint}</p>
      )}
    </div>
  );
});
