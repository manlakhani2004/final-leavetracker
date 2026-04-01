import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-[0.98]';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-2',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))`,
          color: '#ffffff',
          boxShadow: `0 8px 20px -6px var(--primary-shadow)`,
        };
      case 'secondary':
        return {
          background: 'var(--surface)',
          color: 'var(--text-secondary)',
          border: `1px solid var(--border)`,
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #f43f5e, #dc2626)',
          color: '#ffffff',
          boxShadow: '0 8px 20px -6px rgba(244,63,94,0.5)',
        };
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981, #0d9488)',
          color: '#ffffff',
          boxShadow: '0 8px 20px -6px rgba(16,185,129,0.5)',
        };
      case 'outline':
        return {
          border: `2px solid var(--primary-light)`,
          color: 'var(--primary-text)',
          background: 'var(--surface)',
        };
      case 'ghost':
        return {
          color: 'var(--text-secondary)',
          background: 'transparent',
        };
      default:
        return {};
    }
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], className)}
      style={{ ...getVariantStyles(), ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
