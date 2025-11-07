/**
 * Share Target Handler
 * Handles shared text and images from other apps (Android/iOS)
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CaptureInput } from '@/components/capture/CaptureInput';
import { PreviewCard } from '@/components/capture/PreviewCard';
import { parseExpense } from '@/lib/parsers/expense-parser';
import type { ParsedExpense } from '@/types';

function ShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sharedText, setSharedText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract shared data from URL params
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    // Combine all shared text
    const combined = [title, text, url].filter(Boolean).join(' ');

    if (combined) {
      setSharedText(combined);
      // Parse the shared text
      const parsed = parseExpense(combined);
      setParsedData(parsed);
    }

    setIsLoading(false);
  }, [searchParams]);

  const handleParsed = (parsed: ParsedExpense) => {
    setParsedData(parsed);
  };

  const handleSave = async () => {
    // Handle saving - this will be done via the PreviewCard component
    // After save, redirect to home
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Processing shared data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Add Transaction</h1>
          <p className="text-sm text-gray-600">
            Shared from another app. Edit and save to add to your expenses.
          </p>
        </div>

        <div className="space-y-4">
          {sharedText && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <strong>Shared:</strong> {sharedText}
            </div>
          )}

          <CaptureInput onParsed={handleParsed} />

          {parsedData && (
            <PreviewCard parsed={parsedData} onSave={handleSave} onCancel={handleCancel} />
          )}

          <div className="text-center">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel and go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
