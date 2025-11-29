import { useEffect, memo, useCallback } from 'react';
import type { ToastType } from '@post-manager/types';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

function ToastComponent({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  const isSuccess = type === 'success';

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-slide-in-right max-w-sm w-full sm:w-auto"
      role="alert"
      aria-live={isSuccess ? 'polite' : 'assertive'}
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border ${
          isSuccess
            ? 'bg-green-500/95 dark:bg-green-600/95 border-green-600 dark:border-green-500 text-white'
            : 'bg-red-500/95 dark:bg-red-600/95 border-red-600 dark:border-red-500 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isSuccess ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <p className="flex-1 text-sm font-medium">{message}</p>

          <button
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClose();
              }
            }}
            className="flex-shrink-0 ml-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1 transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export const Toast = memo(ToastComponent);

