'use client';

import { useState } from 'react';
import {
  authenticateWithPasskey,
  authenticateWithPassword,
  autoLogin,
  hasPasskey,
  getPasskeyInfo,
} from '@/lib/crypto/passkey-wrapper';
import { getKeyMetadata } from '@/lib/crypto/key-storage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface PasskeyLoginProps {
  onLoginSuccess: () => void;
  onError?: (error: string) => void;
  onSwitchToSetup?: () => void;
}

export default function PasskeyLogin({ onLoginSuccess, onError, onSwitchToSetup }: PasskeyLoginProps) {
  const [loginMethod, setLoginMethod] = useState<'passkey' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-detect login method
  const [authMethod, setAuthMethod] = useState<'passkey' | 'password' | 'none'>('none');

  useState(() => {
    getKeyMetadata().then((metadata) => {
      if (metadata?.wrappedBy === 'passkey' && hasPasskey()) {
        setAuthMethod('passkey');
        setLoginMethod('passkey');
      } else if (metadata?.wrappedBy === 'password') {
        setAuthMethod('password');
        setLoginMethod('password');
      } else {
        setAuthMethod('none');
      }
    });
  });

  // Try auto-login on mount
  useState(() => {
    if (authMethod === 'passkey') {
      autoLogin()
        .then((key) => {
          if (key) {
            onLoginSuccess();
          }
        })
        .catch((error) => {
          console.error('Auto-login failed:', error);
        });
    }
  });

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    try {
      await authenticateWithPasskey();
      onLoginSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!password) {
      onError?.('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      // Get salt from stored key metadata
      const metadata = await getKeyMetadata();
      if (!metadata?.salt) {
        throw new Error('Encryption key metadata not found');
      }

      const salt = new Uint8Array(metadata.salt);
      await authenticateWithPassword(password, salt);
      onLoginSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  // No auth method configured - redirect to setup
  if (authMethod === 'none') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Darik</h1>
          <p className="text-gray-600">
            Let's secure your financial data first
          </p>
        </div>

        <Card className="p-6 space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600">
            No encryption key found. Set up passkey or password protection to get started.
          </p>
          <Button onClick={onSwitchToSetup} className="w-full">
            Set Up Encryption
          </Button>
        </Card>
      </div>
    );
  }

  // Passkey login
  if (loginMethod === 'passkey') {
    const passkeyInfo = getPasskeyInfo();

    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600">
            Unlock your encrypted data with your passkey
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {passkeyInfo?.credentialId ? 'Passkey Configured' : 'User'}
              </p>
              <p className="text-sm text-gray-500">
                Created {passkeyInfo?.createdAt ? new Date(passkeyInfo.createdAt).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>

          <Button
            onClick={handlePasskeyLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Authenticating...' : 'Unlock with Passkey'}
          </Button>

          {authMethod === 'password' && (
            <button
              onClick={() => setLoginMethod('password')}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Use password instead
            </button>
          )}
        </Card>

        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Your device will prompt for biometric authentication</p>
          <p>(fingerprint, Face ID, or device PIN)</p>
        </div>
      </div>
    );
  }

  // Password login
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-600">
          Enter your password to decrypt your data
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password) {
                  handlePasswordLogin();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button
          onClick={handlePasswordLogin}
          disabled={isLoading || !password}
          className="w-full"
        >
          {isLoading ? 'Decrypting...' : 'Unlock'}
        </Button>

        {authMethod === 'passkey' && hasPasskey() && (
          <button
            onClick={() => setLoginMethod('passkey')}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Use passkey instead
          </button>
        )}
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Forgot your password?</p>
            <p className="text-xs mt-1">
              Unfortunately, encrypted data cannot be recovered without the password. This is by design to ensure maximum security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
