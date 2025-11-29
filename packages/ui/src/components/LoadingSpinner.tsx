import { memo } from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

function LoadingSpinnerComponent({
  size = 'md',
  className = '',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2',
  };

  return (
    <div
      className={`flex flex-col justify-center items-center py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-600 dark:border-blue-400`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export const LoadingSpinner = memo(LoadingSpinnerComponent);

