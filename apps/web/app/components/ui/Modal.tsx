'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ModalVariant = 'drawer' | 'center';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title?: string;
  children: ReactNode;
  /** Max width class for center modals or drawer width */
  maxWidth?: string;
};

export default function Modal({
  open,
  onClose,
  variant = 'center',
  title,
  children,
  maxWidth,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Focus trap + Escape handling
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;

    // Focus first focusable element inside
    const timer = setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 50);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      // Focus trap
      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      // Restore focus
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const isDrawer = variant === 'drawer';
  const widthClass = maxWidth ?? (isDrawer ? 'max-w-md' : 'max-w-lg');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          isDrawer
            ? `fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-xl transition-transform duration-200 ${widthClass}`
            : `relative z-50 mt-[10vh] w-full rounded-xl border border-slate-200 bg-white shadow-xl ${widthClass}`
        }
      >
        {title ? (
          <div className={`flex items-center justify-between border-b border-slate-200 px-4 py-3 ${isDrawer ? '' : 'rounded-t-xl'}`}>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className={isDrawer ? 'flex-1 overflow-y-auto p-4' : 'p-4'}>
          {children}
        </div>
      </div>
    </div>
  );
}
