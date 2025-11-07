/**
 * CaptureInput Component
 * Main input field for natural language expense capture
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input, Button } from '@/components/ui';
import { parseExpense } from '@/lib/parsers/expense-parser';
import { debounce } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ParsedExpense } from '@/types';

interface CaptureInputProps {
  onParsed: (parsed: ParsedExpense) => void;
  onReceiptClick?: () => void;
}

export function CaptureInput({ onParsed, onReceiptClick }: CaptureInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice input hook
  const voice = useVoiceInput({
    language: 'en-IN',
    continuous: false,
    interimResults: true,
  });

  // Debounced parser
  const debouncedParse = useCallback(
    debounce((value: string) => {
      if (value.trim()) {
        setIsProcessing(true);
        try {
          const parsed = parseExpense(value);
          onParsed(parsed);
        } finally {
          setIsProcessing(false);
        }
      }
    }, 300),
    [onParsed]
  );

  // Update input from voice transcript
  useEffect(() => {
    if (voice.transcript) {
      const fullTranscript = voice.transcript + ' ' + voice.interimTranscript;
      setInput(fullTranscript.trim());

      // Parse final transcript
      if (voice.transcript && !voice.isListening) {
        debouncedParse(voice.transcript);
      }
    }
  }, [voice.transcript, voice.interimTranscript, voice.isListening, debouncedParse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    debouncedParse(value);
  };

  const handleVoiceClick = () => {
    if (voice.isListening) {
      voice.stop();
    } else {
      voice.reset();
      voice.start();
    }
  };

  const handleClear = () => {
    setInput('');
    voice.reset();
    onParsed({
      amount: undefined,
      merchant: undefined,
      category: undefined,
      method: undefined,
      date: undefined,
      note: undefined,
      currency: undefined,
      confidence: {
        amount: 0,
        merchant: 0,
        category: 0,
        method: 0,
        date: 0,
        overall: 0,
      },
      raw: '',
      tokens: [],
      ambiguities: [],
      suggestions: [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div className="relative">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="e.g., Fuel 900 cash 7:30pm"
          className="text-lg pr-10"
          autoFocus
        />
        {input && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="Clear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        {isProcessing && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Voice Error Toast */}
      {voice.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{voice.error}</span>
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {voice.isListening && (
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600 animate-pulse"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-blue-900 font-medium">Listening...</span>
            {voice.interimTranscript && (
              <span className="text-sm text-blue-700 italic">{voice.interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVoiceClick}
          disabled={!voice.isSupported}
          className={voice.isListening ? 'bg-blue-100 text-blue-700' : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-1 ${voice.isListening ? 'animate-pulse' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {voice.isListening ? 'Stop' : 'Voice'}
        </Button>

        <Button variant="ghost" size="sm" onClick={onReceiptClick} disabled={!onReceiptClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Receipt
        </Button>
      </div>
    </div>
  );
}
