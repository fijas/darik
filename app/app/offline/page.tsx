/**
 * Offline Page
 * Displayed when the user is offline and the page is not cached
 */

'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
          <svg
            className="h-12 w-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">You&apos;re Offline</h1>

        <p className="mb-6 text-gray-600">
          It looks like you&apos;re not connected to the internet.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-blue-900">
              Don&apos;t worry! Darik works offline
            </h2>
            <ul className="space-y-1 text-left text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Add and view transactions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>View your portfolio</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Check your goals</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Your data syncs automatically when you&apos;re back online</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>

          <div className="text-sm text-gray-500">
            <a href="/" className="text-blue-600 hover:text-blue-700">
              Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
