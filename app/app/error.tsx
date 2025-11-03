/**
 * Error Boundary
 * Global error handler for unhandled errors
 */

'use client';

import { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { Card, Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <Layout>
      <div className="mx-auto max-w-md space-y-6">
        <Card variant="elevated" padding="lg" className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-danger"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className="mb-2 text-2xl font-bold">Something went wrong!</h2>
          <p className="mb-6 text-muted">
            An unexpected error occurred. Please try again.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-lg bg-secondary p-4 text-left">
              <p className="text-sm font-mono text-foreground">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button fullWidth onClick={reset}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
