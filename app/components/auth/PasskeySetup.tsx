'use client';

import { useState } from 'react';
import {
  registerPasskey,
  registerWithPassword,
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
} from '@/lib/crypto/passkey-wrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface PasskeySetupProps {
  onSetupComplete: () => void;
  onError?: (error: string) => void;
}

export default function PasskeySetup({ onSetupComplete, onError }: PasskeySetupProps) {
  const [setupMethod, setSetupMethod] = useState<'passkey' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean | null>(null);

  // Check passkey availability on mount
  useState(() => {
    if (isWebAuthnSupported()) {
      isPlatformAuthenticatorAvailable().then(setPasskeyAvailable);
    } else {
      setPasskeyAvailable(false);
    }
  });

  const handlePasskeySetup = async () => {
    if (!username || !displayName) {
      onError?.('Please provide both username and display name');
      return;
    }

    setIsLoading(true);
    try {
      await registerPasskey(username, displayName);
      onSetupComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Passkey setup failed';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSetup = async () => {
    if (!password || password !== confirmPassword) {
      onError?.('Passwords do not match');
      return;
    }

    if (password.length < 12) {
      onError?.('Password must be at least 12 characters');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithPassword(password);
      onSetupComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password setup failed';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Method selection screen
  if (!setupMethod) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Secure Your Data</h1>
          <p className="text-gray-600">
            Choose how you want to protect your financial data with end-to-end encryption
          </p>
        </div>

        <div className="space-y-4">
          {passkeyAvailable !== false && (
            <Card className="p-6 space-y-3 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSetupMethod('passkey')}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Passkey (Recommended)</h3>
                  <p className="text-sm text-gray-600">
                    Use fingerprint, Face ID, or device PIN for secure and convenient access
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Most Secure</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">No Password</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Device-Bound</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 space-y-3 hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => setSetupMethod('password')}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Password</h3>
                <p className="text-sm text-gray-600">
                  Use a strong password to derive your encryption key
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Fallback Option</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Cross-Device</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Your data is encrypted on your device. Neither method sends your password or biometrics to any server.
          </p>
        </div>
      </div>
    );
  }

  // Passkey setup form
  if (setupMethod === 'passkey') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <button
          onClick={() => setSetupMethod(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Set Up Passkey</h1>
          <p className="text-gray-600">
            Create a secure passkey using your device's biometric authentication
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isLoading}
              autoComplete="username"
            />
            <p className="text-xs text-gray-500">
              This identifies you across devices
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              disabled={isLoading}
              autoComplete="name"
            />
            <p className="text-xs text-gray-500">
              Your name for display purposes
            </p>
          </div>

          <Button
            onClick={handlePasskeySetup}
            disabled={isLoading || !username || !displayName}
            className="w-full"
          >
            {isLoading ? 'Setting up...' : 'Create Passkey'}
          </Button>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Your device will prompt for biometric authentication (fingerprint, Face ID, etc.)</li>
                <li>• A secure encryption key will be generated and stored on your device</li>
                <li>• Your financial data will be encrypted before syncing to the cloud</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password setup form
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <button
        onClick={() => setSetupMethod(null)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Set Up Password</h1>
        <p className="text-gray-600">
          Create a strong password to protect your encryption key
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500">
            Minimum 12 characters recommended
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <Button
          onClick={handlePasswordSetup}
          disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
          className="w-full"
        >
          {isLoading ? 'Setting up...' : 'Create Encryption Key'}
        </Button>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Warning</p>
            <ul className="space-y-1 text-xs">
              <li>• Store this password securely - it cannot be recovered if lost</li>
              <li>• Use a password manager or write it down in a safe place</li>
              <li>• Losing this password means losing access to your encrypted data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
