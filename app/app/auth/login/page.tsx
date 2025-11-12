'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasskeySetup from '@/components/auth/PasskeySetup';
import PasskeyLogin from '@/components/auth/PasskeyLogin';
import { hasKey } from '@/lib/crypto/key-storage';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'setup' | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Check if user has already set up encryption
  useEffect(() => {
    hasKey('master').then((keyExists) => {
      setMode(keyExists ? 'login' : 'setup');
    });
  }, []);

  const handleSetupComplete = () => {
    // Redirect to home after successful setup
    router.push('/');
  };

  const handleLoginSuccess = () => {
    // Redirect to home after successful login
    router.push('/');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);

    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleSwitchToSetup = () => {
    setMode('setup');
  };

  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-down">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {mode === 'setup' ? (
        <PasskeySetup
          onSetupComplete={handleSetupComplete}
          onError={handleError}
        />
      ) : (
        <PasskeyLogin
          onLoginSuccess={handleLoginSuccess}
          onError={handleError}
          onSwitchToSetup={handleSwitchToSetup}
        />
      )}

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Darik Finance - Your data, encrypted and private
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          End-to-end encryption ensures only you can access your financial data
        </p>
      </div>
    </div>
  );
}
