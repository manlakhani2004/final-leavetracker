import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, className, style, ...props }: SelectProps) {
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
      <select
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
          ...style,
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
