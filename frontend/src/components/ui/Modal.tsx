import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import Draggable from 'react-draggable';
import { Hand } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity pointer-events-auto"
        style={{ background: 'var(--modal-overlay)' }}
        onClick={onClose}
      ></div>

      <Draggable
        nodeRef={nodeRef}
        handle=".modal-drag-handle"
        bounds="parent"
      >
        <div
          ref={nodeRef}
          className={cn(
            'relative rounded-2xl shadow-2xl ring-1 ring-gray-900/5 w-full text-left overflow-hidden flex flex-col max-h-[90vh]',
            'pointer-events-auto animate-in zoom-in-95 duration-200',
            sizeStyles[size]
          )}
          style={{ background: 'var(--modal-bg)', margin: 0 }}
        >
          {title && (
            <div
              className="flex items-center justify-between px-6 py-4 modal-drag-handle cursor-grab active:cursor-grabbing select-none shrink-0"
              style={{
                borderBottom: `1px solid var(--modal-border)`,
                background: 'var(--modal-header-bg)'
              }}
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold" style={{ color: 'var(--modal-title)' }}>{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors z-10"
                style={{ color: 'var(--text-muted)' }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
                onTouchStart={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="px-6 py-6 sm:p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </Draggable>
    </div>
  );
}
