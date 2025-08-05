import { DebtEntry, AvalancheStrategy, AvalancheRecommendation, DebtSummary, MonthlyBreakdown } from '@/types/debt';

/**
 * Ensure debt has minimum payment (default to 10% of balance if not set)
 */
function ensureMinimumPayment(debt: DebtEntry): DebtEntry {
  const minimumPayment = debt.minimumPayment || Math.max(debt.balance * 0.1, 25); // 10% or $25 minimum
  return {
    ...debt,
    minimumPayment
  };
}

/**
 * Calculate the avalanche strategy for debt payoff
 * The avalanche method prioritizes paying off debts with the highest interest rates first
 */
export function calculateAvalancheStrategy(
  debts: DebtEntry[],
  availableFunds: number,
  monthsToShow: number = 6
): AvalancheStrategy {
  if (debts.length === 0) {
    return {
      totalAvailableFunds: availableFunds,
      totalMinimumPayments: 0,
      extraFundsAvailable: availableFunds,
      recommendations: [],
      totalMonthsToDebtFree: 0,
      totalInterestSaved: 0,
      lastCalculated: new Date()
    };
  }

  // Ensure all debts have minimum payments (default to 10% if not set)
  const debtsWithMinimums = debts.map(ensureMinimumPayment);

  // Sort debts by interest rate (highest first) for avalanche strategy
  const sortedDebts = [...debtsWithMinimums].sort((a, b) => b.interestRate - a.interestRate);
  
  const totalMinimumPayments = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraFunds = Math.max(0, availableFunds - totalMinimumPayments);
  
  const recommendations: AvalancheRecommendation[] = sortedDebts.map((debt, index) => {
    const isTargetDebt = index === 0 && extraFunds > 0; // Highest interest rate debt gets extra payment
    const recommendedPayment = debt.minimumPayment + (isTargetDebt ? extraFunds : 0);

    // Calculate interest savings compared to minimum payment only
    const monthsWithRecommended = calculateMonthsToPayoff(debt.balance, recommendedPayment, debt.interestRate);

    const interestWithMinimum = calculateTotalInterest(debt.balance, debt.minimumPayment, debt.interestRate);
    const interestWithRecommended = calculateTotalInterest(debt.balance, recommendedPayment, debt.interestRate);
    const interestSaved = Math.max(0, interestWithMinimum - interestWithRecommended);

    return {
      debtId: debt.id,
      creditorName: debt.creditorName,
      currentBalance: debt.balance,
      minimumPayment: debt.minimumPayment,
      interestRate: debt.interestRate,
      recommendedPayment,
      isTargetDebt,
      monthsToPayoff: monthsWithRecommended,
      totalInterestSaved: interestSaved,
      monthlyBreakdown: calculateMonthlyBreakdown(debt.balance, recommendedPayment, debt.interestRate, monthsToShow)
    };
  });

  const totalMonthsToDebtFree = calculateTotalPayoffTime(recommendations);
  
  return {
    totalAvailableFunds: availableFunds,
    totalMinimumPayments,
    extraFundsAvailable: extraFunds,
    recommendations,
    totalMonthsToDebtFree,
    totalInterestSaved: 0, // Simplified for now
    lastCalculated: new Date()
  };
}

/**
 * Calculate how many months it takes to pay off a debt using proper APR calculations
 */
export function calculateMonthsToPayoff(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number {
  if (monthlyPayment <= 0 || balance <= 0) return 0;

  // Convert APR to monthly interest rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // If payment is less than or equal to monthly interest, debt will never be paid off
  const monthlyInterest = balance * monthlyInterestRate;
  if (monthlyPayment <= monthlyInterest) {
    return Infinity;
  }

  // Use the standard loan payoff formula: n = -log(1 - (r * P) / A) / log(1 + r)
  // Where: n = number of payments, r = monthly interest rate, P = principal, A = payment amount
  const numerator = Math.log(1 - (monthlyInterestRate * balance) / monthlyPayment);
  const denominator = Math.log(1 + monthlyInterestRate);

  // Handle edge case where interest rate is 0
  if (monthlyInterestRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const months = -numerator / denominator;
  return Math.ceil(months);
}

/**
 * Calculate total interest paid over the life of a debt
 */
export function calculateTotalInterest(
  balance: number,
  monthlyPayment: number,
  annualInterestRate: number
): number {
  const months = calculateMonthsToPayoff(balance, monthlyPayment, annualInterestRate);
  if (months === Infinity || months === 0) return 0;

  const totalPaid = monthlyPayment * months;
  return Math.max(0, totalPaid - balance);
}

/**
 * Calculate monthly breakdown showing balance reduction over time
 */
export function calculateMonthlyBreakdown(
  initialBalance: number,
  monthlyPayment: number,
  annualInterestRate: number,
  monthsToShow: number
): MonthlyBreakdown[] {
  const breakdown: MonthlyBreakdown[] = [];
  let currentBalance = initialBalance;
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  for (let month = 1; month <= monthsToShow && currentBalance > 0; month++) {
    const interestPaid = currentBalance * monthlyInterestRate;
    const principalPaid = Math.min(monthlyPayment - interestPaid, currentBalance);
    const actualPayment = interestPaid + principalPaid;

    breakdown.push({
      month,
      balance: Math.max(0, currentBalance - principalPaid),
      payment: actualPayment,
      interestPaid,
      principalPaid
    });

    currentBalance = Math.max(0, currentBalance - principalPaid);
  }

  return breakdown;
}

/**
 * Calculate total time to become debt-free using avalanche strategy
 */
function calculateTotalPayoffTime(recommendations: AvalancheRecommendation[]): number {
  // Simplified calculation - in reality, this would simulate month-by-month payments
  // as debts get paid off and extra funds get redirected to the next highest interest debt
  const targetDebt = recommendations.find(r => r.isTargetDebt);
  if (!targetDebt || targetDebt.monthsToPayoff === Infinity) {
    return Infinity;
  }
  
  // For now, return the time to pay off the target debt
  // A more sophisticated implementation would simulate the cascade effect
  return targetDebt.monthsToPayoff || 0;
}

/**
 * Calculate debt summary statistics
 */
export function calculateDebtSummary(debts: DebtEntry[]): DebtSummary {
  if (debts.length === 0) {
    return {
      totalDebt: 0,
      totalMinimumPayments: 0,
      highestInterestRate: 0,
      lowestInterestRate: 0,
      numberOfDebts: 0
    };
  }

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const interestRates = debts.map(debt => debt.interestRate);
  
  return {
    totalDebt,
    totalMinimumPayments,
    highestInterestRate: Math.max(...interestRates),
    lowestInterestRate: Math.min(...interestRates),
    numberOfDebts: debts.length
  };
}

/**
 * Validate debt entry data
 */
export function validateDebtEntry(debt: Partial<DebtEntry>): string[] {
  const errors: string[] = [];
  
  if (!debt.creditorName || debt.creditorName.trim().length === 0) {
    errors.push('Creditor name is required');
  }
  
  if (debt.balance === undefined || debt.balance <= 0) {
    errors.push('Balance must be greater than 0');
  }
  
  // Minimum payment is optional - will default to 10% of balance
  if (debt.minimumPayment !== undefined && debt.minimumPayment <= 0) {
    errors.push('Minimum payment must be greater than 0 if provided');
  }
  
  if (debt.interestRate === undefined || debt.interestRate < 0 || debt.interestRate > 100) {
    errors.push('Interest rate must be between 0 and 100');
  }
  
  const effectiveMinPayment = debt.minimumPayment || (debt.balance ? debt.balance * 0.1 : 0);
  if (debt.balance && effectiveMinPayment > debt.balance) {
    errors.push('Minimum payment cannot be greater than the balance');
  }
  
  return errors;
}

/**
 * Generate a unique ID for debt entries
 */
export function generateDebtId(): string {
  return `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format currency for display with adaptable currency
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  // Get the user's locale, fallback to en-US
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    // Fallback to USD if currency code is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
