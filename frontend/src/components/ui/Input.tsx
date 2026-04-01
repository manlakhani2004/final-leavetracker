import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--input-label)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-xl shadow-sm transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2',
            error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : '',
            className
          )}
          style={{
            background: 'var(--input-bg)',
            borderColor: error ? undefined : 'var(--input-border)',
            color: 'var(--input-text)',
            ...(!error && {
              '--tw-ring-color': 'var(--input-focus-ring)',
            } as React.CSSProperties),
            ...style,
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
