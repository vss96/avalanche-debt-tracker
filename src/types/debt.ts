export type DebtType = 'credit_card' | 'loan';

export interface DebtEntry {
  id: string;
  creditorName: string;
  debtType: DebtType;
  balance: number;
  minimumPayment: number;
  interestRate: number; // Annual percentage rate
  loanDurationMonths?: number; // For loans - original loan term
  loanFee?: number; // For loans - upfront or monthly fees
  loanFeeType?: 'upfront' | 'monthly'; // How the fee is applied
  createdAt: Date;
  updatedAt: Date;
}

export const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'loan', label: 'Loan', icon: '🏦' }
] as const;

export interface UserFinances {
  monthlyIncomeAfterExpenses: number;
  currency: string; // ISO currency code (USD, EUR, GBP, etc.)
  defaultMinimumPaymentPercentage: number; // 1-10% for calculating minimum payments
  lastUpdated: Date;
}

export interface MonthlyBreakdown {
  month: number;
  balance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
}

export interface AvalancheRecommendation {
  debtId: string;
  creditorName: string;
  debtType: DebtType;
  currentBalance: number;
  minimumPayment: number;
  interestRate: number;
  recommendedPayment: number;
  isTargetDebt: boolean; // The debt to focus extra payments on
  monthsToPayoff?: number;
  totalInterestSaved?: number;
  monthlyBreakdown?: MonthlyBreakdown[];
  loanDurationMonths?: number; // For loans - original loan term
}

export interface AvalancheStrategy {
  totalAvailableFunds: number;
  totalMinimumPayments: number;
  extraFundsAvailable: number;
  recommendations: AvalancheRecommendation[];
  totalMonthsToDebtFree: number;
  totalInterestSaved: number;
  lastCalculated: Date;
}

export interface DebtSummary {
  totalDebt: number;
  totalMinimumPayments: number;
  highestInterestRate: number;
  lowestInterestRate: number;
  numberOfDebts: number;
}

// Form validation types
export interface DebtFormData {
  creditorName: string;
  debtType: DebtType;
  balance: string;
  minimumPayment: string;
  interestRate: string;
  loanDurationMonths: string;
  loanFee: string;
  loanFeeType: 'upfront' | 'monthly';
}

export interface DebtFormErrors {
  creditorName?: string;
  debtType?: string;
  balance?: string;
  minimumPayment?: string;
  interestRate?: string;
  loanDurationMonths?: string;
  loanFee?: string;
  loanFeeType?: string;
}

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
] as const;

// Local storage keys
export const STORAGE_KEYS = {
  DEBTS: 'debt-tracker-debts',
  USER_FINANCES: 'debt-tracker-finances',
  PREFERENCES: 'debt-tracker-preferences'
} as const;
