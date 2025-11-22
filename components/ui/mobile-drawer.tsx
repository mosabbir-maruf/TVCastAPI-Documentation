'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  children: React.ReactNode;
}

export function MobileDrawer({ isOpen, onClose, position = 'left', children }: MobileDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-80 max-w-[85vw] bg-background border-${position === 'left' ? 'r' : 'l'} shadow-2xl z-50 lg:hidden overflow-y-auto animate-in slide-in-from-${position === 'left' ? 'left' : 'right'} duration-300`}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b">
          <h2 className="text-sm font-semibold">
            {position === 'left' ? 'Navigation' : 'On This Page'}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
}

