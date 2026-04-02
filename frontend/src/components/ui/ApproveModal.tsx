'use client';

import React from 'react';
import { Modal } from './Modal';
import { CheckCircle } from 'lucide-react';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  isApproving: boolean;
}

export default function ApproveModal({
  isOpen,
  onClose,
  itemName,
  itemType = 'request',
  onConfirm,
  isApproving,
}: ApproveModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Accept ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
    >
      <div className="flex flex-col items-center text-center">
        {/* <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e'
        }}>
          <CheckCircle className="w-8 h-8" />
        </div> */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to accept{" "}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {itemName}
          </span>
          ? This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isApproving}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              if (!isApproving) {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApproving}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'white',
              backgroundColor: '#22c55e'
            }}
            onMouseEnter={(e) => {
              if (!isApproving) {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e';
            }}
          >
            {isApproving ? "Accepting..." : "Yes, Accept"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
