import { DebtEntry } from '@/types/debt';
import { generateDebtId } from './debtCalculations';

export const sampleDebts: DebtEntry[] = [
  {
    id: generateDebtId(),
    creditorName: 'Chase Visa Credit Card',
    debtType: 'credit_card',
    balance: 5000,
    minimumPayment: 150,
    interestRate: 24.99,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: generateDebtId(),
    creditorName: 'Federal Student Loan',
    debtType: 'loan',
    balance: 15000,
    minimumPayment: 0, // Will be calculated based on duration
    interestRate: 6.5,
    loanDurationMonths: 24, // 2 years
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: generateDebtId(),
    creditorName: 'Honda Auto Loan',
    debtType: 'loan',
    balance: 12000,
    minimumPayment: 0, // Will be calculated
    interestRate: 4.2,
    loanDurationMonths: 18, // 1.5 years
    loanFee: 15,
    loanFeeType: 'monthly',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: generateDebtId(),
    creditorName: 'SoFi Personal Loan',
    debtType: 'loan',
    balance: 3000,
    minimumPayment: 0, // Will be calculated
    interestRate: 12.5,
    loanDurationMonths: 12, // 1 year
    loanFee: 100,
    loanFeeType: 'upfront',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

export function loadSampleData() {
  if (typeof window === 'undefined') return;
  
  // Only load sample data if no existing data
  const existingDebts = localStorage.getItem('debt-tracker-debts');
  if (!existingDebts) {
    localStorage.setItem('debt-tracker-debts', JSON.stringify(sampleDebts));
  }
  
  const existingFinances = localStorage.getItem('debt-tracker-finances');
  if (!existingFinances) {
    const sampleFinances = {
      monthlyIncomeAfterExpenses: 1000,
      currency: 'USD',
      defaultMinimumPaymentPercentage: 2,
      lastUpdated: new Date()
    };
    localStorage.setItem('debt-tracker-finances', JSON.stringify(sampleFinances));
  }
}
