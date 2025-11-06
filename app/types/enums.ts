/**
 * Enumerations for fixed categories used throughout the app
 * These define the allowed values for various fields in our data model
 */

// Transaction Categories
// Organized by spending type for easier grouping in UI
export enum TransactionCategory {
  // Food & Dining
  GROCERIES = 'groceries',
  DINING = 'dining',
  FOOD_DELIVERY = 'food_delivery',

  // Transportation
  FUEL = 'fuel',
  TRANSPORT = 'transport',
  AUTO = 'auto',

  // Bills & Utilities
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas',
  INTERNET = 'internet',
  MOBILE = 'mobile',
  DTH = 'dth',

  // Shopping
  SHOPPING = 'shopping',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',

  // Health & Fitness
  MEDICAL = 'medical',
  PHARMACY = 'pharmacy',
  FITNESS = 'fitness',

  // Entertainment
  ENTERTAINMENT = 'entertainment',
  MOVIES = 'movies',
  SUBSCRIPTIONS = 'subscriptions',

  // Education
  EDUCATION = 'education',
  BOOKS = 'books',

  // Personal Care
  PERSONAL_CARE = 'personal_care',
  SALON = 'salon',

  // Home
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  FURNITURE = 'furniture',

  // Travel
  TRAVEL = 'travel',
  HOTEL = 'hotel',

  // Financial
  INVESTMENT = 'investment',
  INSURANCE = 'insurance',
  EMI = 'emi',
  TAX = 'tax',

  // Income (for type='income' transactions)
  SALARY = 'salary',
  VARIABLE_PAY = 'variable_pay',      // Bonus, commission, incentives
  FREELANCE = 'freelance',             // Freelance/contract work
  BUSINESS_INCOME = 'business_income', // Business revenue
  INVESTMENT_INCOME = 'investment_income', // Dividends, interest
  RENTAL_INCOME = 'rental_income',     // Property rent
  LOAN_REPAYMENT = 'loan_repayment',   // Money lent returned
  REFUND = 'refund',                   // Purchase refunds
  CASHBACK = 'cashback',               // Cashback rewards
  GIFT_RECEIVED = 'gift_received',     // Money gifts received
  INHERITANCE = 'inheritance',         // Inheritance money
  OTHER_INCOME = 'other_income',       // Other income sources

  // Other
  GIFTS = 'gifts',
  DONATION = 'donation',
  OTHER = 'other',
}

// Payment Methods
export enum PaymentMethod {
  UPI = 'upi',
  GPAY = 'gpay',
  PHONEPE = 'phonepe',
  PAYTM = 'paytm',
  CARD = 'card',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  NET_BANKING = 'netbanking',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  OTHER = 'other',
}

// Transaction Source
// Indicates how the transaction was created
export enum TransactionSource {
  MANUAL = 'manual',
  TELEGRAM = 'telegram',
  OCR = 'ocr',
  SMS = 'sms',
  EMAIL = 'email',
  WEB_SHARE = 'web_share',
  VOICE = 'voice',
  IMPORT = 'import',
}

// Security Types
export enum SecurityType {
  MUTUAL_FUND = 'mf',
  EQUITY = 'equity',
  GOLD = 'gold',
  CRYPTO = 'crypto',
  ETF = 'etf',
  BOND = 'bond',
  FD = 'fd',
  OTHER = 'other',
}

// Price Source
export enum PriceSource {
  AMFI = 'amfi', // Association of Mutual Funds in India
  NSE = 'nse', // National Stock Exchange
  BSE = 'bse', // Bombay Stock Exchange
  MANUAL = 'manual',
  CUSTOM = 'custom',
  API = 'api',
}

// Asset Types (non-market assets)
export enum AssetType {
  BANK = 'bank',
  CASH = 'cash',
  EMERGENCY_FUND = 'emergency_fund',
  FIXED_DEPOSIT = 'fd',
  PROPERTY = 'property',
  PROVIDENT_FUND = 'pf',
  PPF = 'ppf',
  EPF = 'epf',
  NPS = 'nps',
  BONDS = 'bonds',
  CRYPTO = 'crypto',
  OTHER_INVESTMENT = 'other_investment',
  VEHICLE = 'vehicle',
  GOLD_PHYSICAL = 'gold_physical',
  JEWELRY = 'jewelry',
  OTHER_PHYSICAL = 'other_physical',
  OTHER = 'other',
}

// Asset Reprice Rule
export enum RepriceRule {
  MANUAL = 'manual',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  INDEXED = 'indexed',
  LINKED = 'link', // link:<security_id>
}

// Liability Types
export enum LiabilityType {
  HOME_LOAN = 'home_loan',
  CAR_LOAN = 'car_loan',
  GOLD_LOAN = 'gold_loan',
  PERSONAL_LOAN = 'personal_loan',
  EDUCATION_LOAN = 'education_loan',
  STUDENT_LOAN = 'student_loan',
  CREDIT_CARD = 'cc',
  OVERDRAFT = 'overdraft',
  OTHER_LOAN = 'other_loan',
  OTHER = 'other',
}

// Goal Strategy
export enum GoalStrategy {
  SIP = 'sip', // Systematic Investment Plan
  LUMPSUM = 'lumpsum',
  HYBRID = 'hybrid', // Combination of both
}

// Currency
export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

// Sync Status
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
  ERROR = 'error',
}

// Helper functions to get display labels
export const getCategoryLabel = (category: TransactionCategory): string => {
  const labels: Record<TransactionCategory, string> = {
    [TransactionCategory.GROCERIES]: 'Groceries',
    [TransactionCategory.DINING]: 'Dining Out',
    [TransactionCategory.FOOD_DELIVERY]: 'Food Delivery',
    [TransactionCategory.FUEL]: 'Fuel',
    [TransactionCategory.TRANSPORT]: 'Transportation',
    [TransactionCategory.AUTO]: 'Auto/Taxi',
    [TransactionCategory.ELECTRICITY]: 'Electricity Bill',
    [TransactionCategory.WATER]: 'Water Bill',
    [TransactionCategory.GAS]: 'Gas Bill',
    [TransactionCategory.INTERNET]: 'Internet',
    [TransactionCategory.MOBILE]: 'Mobile',
    [TransactionCategory.DTH]: 'DTH/Cable',
    [TransactionCategory.SHOPPING]: 'Shopping',
    [TransactionCategory.CLOTHING]: 'Clothing',
    [TransactionCategory.ELECTRONICS]: 'Electronics',
    [TransactionCategory.MEDICAL]: 'Medical',
    [TransactionCategory.PHARMACY]: 'Pharmacy',
    [TransactionCategory.FITNESS]: 'Fitness',
    [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
    [TransactionCategory.MOVIES]: 'Movies',
    [TransactionCategory.SUBSCRIPTIONS]: 'Subscriptions',
    [TransactionCategory.EDUCATION]: 'Education',
    [TransactionCategory.BOOKS]: 'Books',
    [TransactionCategory.PERSONAL_CARE]: 'Personal Care',
    [TransactionCategory.SALON]: 'Salon/Spa',
    [TransactionCategory.RENT]: 'Rent',
    [TransactionCategory.MAINTENANCE]: 'Maintenance',
    [TransactionCategory.FURNITURE]: 'Furniture',
    [TransactionCategory.TRAVEL]: 'Travel',
    [TransactionCategory.HOTEL]: 'Hotel',
    [TransactionCategory.INVESTMENT]: 'Investment',
    [TransactionCategory.INSURANCE]: 'Insurance',
    [TransactionCategory.EMI]: 'EMI',
    [TransactionCategory.TAX]: 'Tax',
    [TransactionCategory.SALARY]: 'Salary',
    [TransactionCategory.VARIABLE_PAY]: 'Variable Pay',
    [TransactionCategory.FREELANCE]: 'Freelance',
    [TransactionCategory.BUSINESS_INCOME]: 'Business Income',
    [TransactionCategory.INVESTMENT_INCOME]: 'Investment Income',
    [TransactionCategory.RENTAL_INCOME]: 'Rental Income',
    [TransactionCategory.LOAN_REPAYMENT]: 'Loan Repayment',
    [TransactionCategory.REFUND]: 'Refund',
    [TransactionCategory.CASHBACK]: 'Cashback',
    [TransactionCategory.GIFT_RECEIVED]: 'Gift Received',
    [TransactionCategory.INHERITANCE]: 'Inheritance',
    [TransactionCategory.OTHER_INCOME]: 'Other Income',
    [TransactionCategory.GIFTS]: 'Gifts',
    [TransactionCategory.DONATION]: 'Donation',
    [TransactionCategory.OTHER]: 'Other',
  };
  return labels[category];
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.UPI]: 'UPI',
    [PaymentMethod.GPAY]: 'Google Pay',
    [PaymentMethod.PHONEPE]: 'PhonePe',
    [PaymentMethod.PAYTM]: 'Paytm',
    [PaymentMethod.CARD]: 'Card',
    [PaymentMethod.CREDIT_CARD]: 'Credit Card',
    [PaymentMethod.DEBIT_CARD]: 'Debit Card',
    [PaymentMethod.CASH]: 'Cash',
    [PaymentMethod.NET_BANKING]: 'Net Banking',
    [PaymentMethod.WALLET]: 'Wallet',
    [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
    [PaymentMethod.CHEQUE]: 'Cheque',
    [PaymentMethod.OTHER]: 'Other',
  };
  return labels[method];
};
