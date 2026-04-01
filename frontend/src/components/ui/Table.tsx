import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table 
        className={cn('min-w-full', className)}
        style={{ borderColor: 'var(--table-border)' }}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead style={{ background: 'var(--table-header-bg)' }}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody 
      className="divide-y"
      style={{ 
        background: 'var(--table-body-bg)',
        borderColor: 'var(--table-border)',
      }}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return <tr className={className}>{children}</tr>;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

export function TableCell({ children, className, header = false }: TableCellProps) {
  const Component = header ? 'th' : 'td';
  return (
    <Component
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm',
        className
      )}
      style={{ 
        color: header ? 'var(--table-header-text)' : 'var(--table-text)',
        fontWeight: header ? 500 : undefined,
      }}
    >
      {children}
    </Component>
  );
}
