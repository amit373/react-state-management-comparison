import { useCallback, useRef, useState } from 'react';
import type { ToastType } from '@post-manager/types';

export interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface UseToastOptions {
  autoHide?: boolean;
  duration?: number;
}

const DEFAULT_DURATION = 3000;

export function useToast(options: UseToastOptions = {}): {
  toast: ToastState | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
} {
  const { autoHide = true, duration = DEFAULT_DURATION } = options;
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      hideToast();
      setToast({ id: Date.now(), message, type });

      if (autoHide) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [autoHide, duration, hideToast]
  );

  return { toast, showToast, hideToast };
}

export type { ToastType } from '@post-manager/types';

