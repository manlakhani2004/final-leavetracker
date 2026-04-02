'use client';

import React from 'react';
import { Modal } from './Modal';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType?: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  itemName,
  itemType = 'item',
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
    >
      <div className="flex flex-col items-center text-center">
        {/* <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444'
        }}>
          <Trash2 className="w-8 h-8" />
        </div> */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete{" "}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {itemName}
          </span>
          ? This action cannot be undone.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
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
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'white',
              backgroundColor: '#ef4444'
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
