/**
 * Sheet Component
 * Slide-out panel (bottom sheet on mobile, side sheet on desktop)
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'bottom' | 'right';
  className?: string;
}

export function Sheet({ isOpen, onClose, children, title, side = 'bottom', className }: SheetProps) {
  // Prevent body scroll when sheet is open
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

  if (!isOpen) return null;

  const sideStyles = {
    bottom: 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]',
    right: 'top-0 right-0 bottom-0 w-full sm:w-[400px] sm:max-w-[90vw]',
  };

  const animations = {
    bottom: 'animate-in slide-in-from-bottom',
    right: 'animate-in slide-in-from-right',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed z-50 bg-background shadow-lg',
          sideStyles[side],
          animations[side],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
