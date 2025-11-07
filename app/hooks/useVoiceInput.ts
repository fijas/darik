/**
 * React Hook for Voice Input
 * Manages voice recognition state and lifecycle
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  VoiceInput,
  isSpeechRecognitionSupported,
  type VoiceInputOptions,
  type VoiceInputResult,
} from '@/lib/speech/voice-input';

export interface UseVoiceInputReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceInput(options: VoiceInputOptions = {}): UseVoiceInputReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);

  const voiceInputRef = useRef<VoiceInput | null>(null);

  // Check browser support on mount
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  // Initialize voice input
  useEffect(() => {
    if (!isSupported) return;

    const voiceInput = new VoiceInput({
      ...options,
      continuous: options.continuous ?? false,
      interimResults: options.interimResults ?? true,
    });

    voiceInput.onResult((result: VoiceInputResult) => {
      if (result.isFinal) {
        setTranscript((prev) => (prev + ' ' + result.transcript).trim());
        setInterimTranscript('');
        setConfidence(result.confidence);
      } else {
        setInterimTranscript(result.transcript);
      }
    });

    voiceInput.onError((errorMessage: string) => {
      setError(errorMessage);
      setIsListening(false);
    });

    voiceInputRef.current = voiceInput;

    // Cleanup on unmount
    return () => {
      voiceInput.destroy();
    };
  }, [isSupported, options]);

  // Start listening
  const start = useCallback(() => {
    if (!voiceInputRef.current) return;

    setError(null);
    setIsListening(true);
    voiceInputRef.current.start();
  }, []);

  // Stop listening
  const stop = useCallback(() => {
    if (!voiceInputRef.current) return;

    voiceInputRef.current.stop();
    setIsListening(false);
  }, []);

  // Reset transcript
  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setConfidence(0);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    confidence,
    start,
    stop,
    reset,
  };
}
