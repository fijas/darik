'use client';

/**
 * Import Page
 * Import holdings from CSV files
 */

import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { Card } from '@/components/ui';
import CsvImporter from '@/components/import/CsvImporter';

export default function ImportPage() {
  const router = useRouter();

  const handleImportComplete = () => {
    // Redirect to portfolio page after successful import
    setTimeout(() => {
      router.push('/portfolio');
    }, 2000);
  };

  return (
    <Layout title="Import Holdings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Import Holdings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import your investment holdings from CSV files exported from various platforms.
          </p>
        </div>

        <Card>
          <CsvImporter onImportComplete={handleImportComplete} />
        </Card>
      </div>
    </Layout>
  );
}
