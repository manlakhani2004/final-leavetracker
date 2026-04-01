'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label?: string;
  subLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ 
  label, 
  subLabel, 
  checked, 
  onChange, 
  disabled = false,
  className 
}: SwitchProps) {
  return (
    <div className={cn("flex items-center justify-between gap-x-4 py-2", className)}>
      {(label || subLabel) && (
        <div className="flex flex-col">
          {label && (
            <span 
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {label}
            </span>
          )}
          {subLabel && (
            <span 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {subLabel}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ 
          background: checked ? 'var(--switch-active)' : 'var(--switch-inactive)',
          '--tw-ring-color': 'var(--focus-ring)',
        } as React.CSSProperties}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
