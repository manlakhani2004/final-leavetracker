import React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 text-center animate-in fade-in duration-200">
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>
        
        <div 
          className={cn(
            'relative bg-white rounded-2xl shadow-2xl ring-1 ring-gray-900/5 w-full text-left overflow-hidden',
            'transform transition-all animate-in zoom-in-95 duration-200',
            sizeStyles[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="px-6 py-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
