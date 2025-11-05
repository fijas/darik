'use client';

/**
 * CSV Importer Component
 *
 * Allows users to import holdings from CSV files
 * Supports: CAMS, KFintech, Kuvera, Zerodha
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { importCSV, type CSVImportResult, type CSVFormat } from '@/lib/importers/csv-parser';
import { getOrCreateSecurity } from '@/lib/db/securities';
import { addHolding } from '@/lib/db/holdings';

export default function CsvImporter({ onImportComplete }: { onImportComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [format, setFormat] = useState<CSVFormat | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setFormat(null);

    // Preview the format
    try {
      const text = await selectedFile.text();
      const previewResult = importCSV(text);
      setFormat(previewResult.success && previewResult.holdings.length > 0 ? 'generic' : 'unknown');
    } catch (error) {
      console.error('Failed to preview CSV:', error);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const importResult = importCSV(text);

      if (!importResult.success || importResult.holdings.length === 0) {
        setResult(importResult);
        setImporting(false);
        return;
      }

      // Process each holding
      for (const { security, holding } of importResult.holdings) {
        // Get or create security
        const existingSecurity = await getOrCreateSecurity(security.symbol, security);

        // Create holding with the security ID
        await addHolding({
          ...holding,
          securityId: existingSecurity.id,
        });
      }

      setResult(importResult);
      onImportComplete?.();
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: false,
        holdings: [],
        errors: [error instanceof Error ? error.message : 'Import failed'],
        summary: {
          totalRows: 0,
          successfulImports: 0,
          failedImports: 0,
        },
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
          disabled={importing}
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {file ? file.name : 'Click to upload CSV file'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Supports CAMS, KFintech, Kuvera, Zerodha
          </span>
        </label>
      </div>

      {/* Format Detection */}
      {file && format && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {format !== 'unknown'
              ? '✓ CSV format detected. Ready to import.'
              : '⚠ Unknown CSV format. Please check if the file is supported.'}
          </p>
        </div>
      )}

      {/* Import Button */}
      {file && (
        <Button
          onClick={handleImport}
          disabled={importing || !file}
          variant="primary"
          className="w-full"
        >
          {importing ? 'Importing...' : 'Import Holdings'}
        </Button>
      )}

      {/* Import Result */}
      {result && (
        <div
          className={`rounded-lg p-4 ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-2 ${
              result.success
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {result.success ? 'Import Successful' : 'Import Failed'}
          </h3>

          <div className="space-y-2 text-sm">
            <p
              className={
                result.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }
            >
              Total rows: {result.summary.totalRows}
            </p>
            <p
              className={
                result.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }
            >
              Successful imports: {result.summary.successfulImports}
            </p>
            {result.summary.failedImports > 0 && (
              <p className="text-red-700 dark:text-red-300">
                Failed imports: {result.summary.failedImports}
              </p>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-red-800 dark:text-red-200 mb-1">Errors:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  {result.errors.slice(0, 10).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>... and {result.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Import Holdings
        </h3>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-semibold mb-1">CAMS Statement</h4>
            <p>
              Download your consolidated account statement from CAMS and upload the CSV file.
              Ensure it contains columns: Scheme, Folio No, Closing Unit Balance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">KFintech Statement</h4>
            <p>
              Download your statement from KFintech (formerly Karvy) and upload the CSV. Should
              contain: Fund, Scheme Name, Balance Units.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Kuvera Export</h4>
            <p>
              Export your portfolio from Kuvera as CSV. Contains: Fund House, Scheme, Units,
              Average NAV.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Zerodha Holdings</h4>
            <p>
              Download holdings from Zerodha Console and upload the CSV. Contains: Symbol,
              Quantity, Average Price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
