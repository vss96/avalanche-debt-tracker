import { DebtEntry } from '@/types/debt';
import { generateDebtId } from './debtCalculations';

export const sampleDebts: DebtEntry[] = [
  {
    id: generateDebtId(),
    creditorName: 'Credit Card (High Interest)',
    balance: 5000,
    minimumPayment: 150,
    interestRate: 24.99,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: generateDebtId(),
    creditorName: 'Student Loan',
    balance: 15000,
    minimumPayment: 200,
    interestRate: 6.5,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: generateDebtId(),
    creditorName: 'Car Loan',
    balance: 12000,
    minimumPayment: 350,
    interestRate: 4.2,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: generateDebtId(),
    creditorName: 'Personal Loan',
    balance: 3000,
    minimumPayment: 100,
    interestRate: 12.5,
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
      lastUpdated: new Date()
    };
    localStorage.setItem('debt-tracker-finances', JSON.stringify(sampleFinances));
  }
}
