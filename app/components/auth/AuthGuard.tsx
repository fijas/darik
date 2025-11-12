/**
 * Auth Guard
 * Protects routes by checking for encryption key setup
 * Redirects to /auth/login if no key is found
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasKey } from '@/lib/crypto/key-storage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Allow access to auth pages without checking
      if (pathname?.startsWith('/auth')) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      // Check if encryption key exists
      const keyExists = await hasKey('master');

      if (!keyExists) {
        // No key found - redirect to login/setup
        router.push('/auth/login');
        return;
      }

      // Key exists - allow access
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}