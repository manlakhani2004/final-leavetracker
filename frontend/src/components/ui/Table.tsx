import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead className="bg-gray-50">{children}</thead>;
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
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
        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        header ? 'font-medium text-gray-700' : '',
        className
      )}
    >
      {children}
    </Component>
  );
}
