/**
 * Web Speech API Wrapper
 * Provides voice input functionality with browser compatibility checks
 */

export interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type VoiceInputCallback = (result: VoiceInputResult) => void;
export type VoiceErrorCallback = (error: string) => void;

/**
 * Check if browser supports Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
         ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Get SpeechRecognition constructor (handles webkit prefix)
 */
function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null;

  return (window.SpeechRecognition ||
          (window as any).webkitSpeechRecognition) as typeof SpeechRecognition;
}

/**
 * Voice Input Manager
 * Handles speech recognition with callbacks
 */
export class VoiceInput {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: VoiceInputCallback | null = null;
  private onErrorCallback: VoiceErrorCallback | null = null;
  private options: VoiceInputOptions;

  constructor(options: VoiceInputOptions = {}) {
    this.options = {
      language: options.language || 'en-IN', // Default to Indian English
      continuous: options.continuous ?? false,
      interimResults: options.interimResults ?? true,
      maxAlternatives: options.maxAlternatives ?? 1,
    };

    this.initialize();
  }

  /**
   * Initialize speech recognition
   */
  private initialize() {
    if (!isSpeechRecognitionSupported()) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognitionConstructor = getSpeechRecognition();
    if (!SpeechRecognitionConstructor) return;

    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.lang = this.options.language!;
    this.recognition.continuous = this.options.continuous!;
    this.recognition.interimResults = this.options.interimResults!;
    this.recognition.maxAlternatives = this.options.maxAlternatives!;

    // Set up event handlers
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
    this.recognition.onstart = this.handleStart.bind(this);
  }

  /**
   * Handle speech recognition results
   */
  private handleResult(event: SpeechRecognitionEvent) {
    const last = event.results.length - 1;
    const result = event.results[last];

    if (result && result[0]) {
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      if (this.onResultCallback) {
        this.onResultCallback({
          transcript,
          confidence,
          isFinal,
        });
      }
    }
  }

  /**
   * Handle speech recognition errors
   */
  private handleError(event: SpeechRecognitionErrorEvent) {
    this.isListening = false;

    let errorMessage = 'Speech recognition error';

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not found or not working.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone permission denied.';
        break;
      case 'network':
        errorMessage = 'Network error. Check your connection.';
        break;
      case 'aborted':
        errorMessage = 'Speech recognition aborted.';
        break;
      case 'language-not-supported':
        errorMessage = 'Language not supported.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }

    if (this.onErrorCallback) {
      this.onErrorCallback(errorMessage);
    }
  }

  /**
   * Handle speech recognition end
   */
  private handleEnd() {
    this.isListening = false;
  }

  /**
   * Handle speech recognition start
   */
  private handleStart() {
    this.isListening = true;
  }

  /**
   * Start listening for speech input
   */
  start() {
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition not supported in this browser');
      }
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(`Failed to start speech recognition: ${error}`);
      }
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort speech recognition
   */
  abort() {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  /**
   * Set callback for results
   */
  onResult(callback: VoiceInputCallback) {
    this.onResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: VoiceErrorCallback) {
    this.onErrorCallback = callback;
  }

  /**
   * Check if currently listening
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Update language setting
   */
  setLanguage(language: string) {
    this.options.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.recognition) {
      this.abort();
      this.recognition = null;
    }
    this.onResultCallback = null;
    this.onErrorCallback = null;
  }
}

/**
 * Simplified hook-friendly function for one-time voice input
 */
export async function captureVoiceInput(
  options: VoiceInputOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const voiceInput = new VoiceInput({
      ...options,
      continuous: false,
      interimResults: false,
    });

    voiceInput.onResult((result) => {
      if (result.isFinal) {
        voiceInput.destroy();
        resolve(result.transcript);
      }
    });

    voiceInput.onError((error) => {
      voiceInput.destroy();
      reject(new Error(error));
    });

    voiceInput.start();

    // Timeout after 10 seconds
    setTimeout(() => {
      if (voiceInput.isActive()) {
        voiceInput.destroy();
        reject(new Error('Speech recognition timeout'));
      }
    }, 10000);
  });
}
