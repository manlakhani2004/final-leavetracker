import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variantStyles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200/50',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    rejected: 'bg-rose-50 text-rose-600 border-rose-200/50',
    cancelled: 'bg-slate-50 text-slate-500 border-slate-200/50',
    default: 'bg-indigo-50 text-indigo-600 border-indigo-200/50',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider uppercase font-bold',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border transition-all duration-300',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
