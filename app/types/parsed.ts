/**
 * Parser output types
 * Defines structures for natural language parsing results
 *
 * The parser takes free-form text like "Fuel 900 cash 7:30pm"
 * and extracts structured data with confidence scores
 */

import type { TransactionCategory, PaymentMethod, Currency } from './enums';

/**
 * Parsed expense from natural language input
 * Includes confidence scores for each extracted field
 */
export interface ParsedExpense {
  // Extracted values
  amount?: number; // Amount in rupees (will be converted to paise)
  merchant?: string; // Merchant or payee name
  category?: TransactionCategory; // Auto-detected category
  method?: PaymentMethod; // Payment method
  date?: Date; // Parsed date/time
  note?: string; // Additional notes
  currency?: Currency; // Detected currency (defaults to INR)
  type?: 'income' | 'expense' | 'transfer'; // Detected transaction type

  // Confidence scores (0-1, higher = more confident)
  confidence: {
    amount: number; // How confident we are about the amount
    merchant: number; // Merchant name confidence
    category: number; // Category classification confidence
    method: number; // Payment method confidence
    date: number; // Date parsing confidence
    overall: number; // Overall parse confidence
  };

  // Parsing metadata
  raw: string; // Original input text
  tokens: string[]; // Tokenized input
  ambiguities: string[]; // List of ambiguous elements
  suggestions?: ParsedExpenseSuggestion[]; // Alternative interpretations
}

/**
 * Alternative interpretation of the input
 * Shown when confidence is low
 */
export interface ParsedExpenseSuggestion {
  amount?: number;
  merchant?: string;
  category?: TransactionCategory;
  method?: PaymentMethod;
  date?: Date;
  confidence: number; // Overall confidence for this suggestion
  reason: string; // Why this suggestion was made
}

/**
 * Parsing context to improve accuracy
 * Can be used to provide hints to the parser
 */
export interface ParserContext {
  recentTransactions?: Array<{
    merchant: string;
    category: TransactionCategory;
    method: PaymentMethod;
  }>;
  currentLocation?: string; // For location-based suggestions
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  defaultCurrency?: Currency;
  preferredPaymentMethods?: PaymentMethod[]; // User's common payment methods
}

/**
 * Parser configuration
 * Allows customizing parser behavior
 */
export interface ParserConfig {
  minConfidenceThreshold: number; // Minimum confidence to auto-accept (default 0.8)
  enableAISuggestions: boolean; // Use AI for ambiguous cases
  strictMode: boolean; // Require all fields or allow partial matches
  currencySymbols: Record<string, Currency>; // Currency symbol mappings
  dateFormats: string[]; // Accepted date formats
  enableVoiceCorrection: boolean; // Apply voice-to-text corrections
}

/**
 * Parsing result with validation
 */
export interface ParseResult {
  success: boolean;
  parsed?: ParsedExpense;
  errors?: ParseError[];
  warnings?: string[];
}

/**
 * Parsing error details
 */
export interface ParseError {
  field: 'amount' | 'merchant' | 'category' | 'method' | 'date' | 'general';
  message: string;
  suggestion?: string; // How to fix the error
  severity: 'error' | 'warning' | 'info';
}

/**
 * Merchant pattern for category learning
 * Used to build a merchant-to-category dictionary
 */
export interface MerchantPattern {
  merchantName: string; // Normalized merchant name
  category: TransactionCategory;
  confidence: number; // How often this mapping is correct (0-1)
  occurrences: number; // Number of times seen
  lastSeenTs: number; // Last occurrence timestamp
  patterns: string[]; // Regex patterns that match this merchant
}

/**
 * Category suggestion from ML model
 */
export interface CategorySuggestion {
  category: TransactionCategory;
  probability: number; // 0-1
  reason: 'merchant_match' | 'keyword_match' | 'pattern_match' | 'ml_model' | 'user_history';
  keywords?: string[]; // Keywords that triggered this suggestion
}

/**
 * Voice input result
 * From Web Speech API
 */
export interface VoiceInput {
  transcript: string; // Recognized text
  confidence: number; // Speech recognition confidence
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
  isFinal: boolean; // Is this the final result?
  language: string; // Detected language
}

/**
 * OCR result from receipt scanning
 */
export interface OCRResult {
  text: string; // Extracted text
  amount?: number; // Detected amount
  merchant?: string; // Detected merchant name
  date?: Date; // Receipt date
  confidence: number; // Overall OCR confidence
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

/**
 * Receipt data extracted from image
 */
export interface ParsedReceipt {
  merchant: string;
  amount: number;
  date: Date;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  tax?: number;
  total: number;
  paymentMethod?: PaymentMethod;
  rawText: string; // Full extracted text
  confidence: number;
}

/**
 * SMS/Email transaction parser result
 * For parsing bank transaction messages
 */
export interface ParsedBankMessage {
  type: 'debit' | 'credit';
  amount: number;
  merchant?: string;
  account: string; // Last 4 digits
  balance?: number; // Current balance
  bank: string; // Bank name
  timestamp: Date;
  transactionId?: string;
  raw: string; // Original message
}
