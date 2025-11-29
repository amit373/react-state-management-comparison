import { memo } from 'react';

interface ErrorBannerProps {
  message: string;
}

function ErrorBannerComponent({ message }: ErrorBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {message}
    </div>
  );
}

export const ErrorBanner = memo(ErrorBannerComponent);

