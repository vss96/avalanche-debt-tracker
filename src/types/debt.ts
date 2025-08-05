export interface DebtEntry {
  id: string;
  creditorName: string;
  balance: number;
  minimumPayment: number;
  interestRate: number; // Annual percentage rate
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFinances {
  monthlyIncomeAfterExpenses: number;
  currency: string; // ISO currency code (USD, EUR, GBP, etc.)
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
  currentBalance: number;
  minimumPayment: number;
  interestRate: number;
  recommendedPayment: number;
  isTargetDebt: boolean; // The debt to focus extra payments on
  monthsToPayoff?: number;
  totalInterestSaved?: number;
  monthlyBreakdown?: MonthlyBreakdown[];
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
  balance: string;
  minimumPayment: string;
  interestRate: string;
}

export interface DebtFormErrors {
  creditorName?: string;
  balance?: string;
  minimumPayment?: string;
  interestRate?: string;
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
