import { DebtEntry } from '@/types/debt';
import { calculateAvalancheStrategy, calculateMonthsToPayoff, calculateTotalInterest, generateDebtId } from './debtCalculations';

// Test the debt calculations
export function runCalculationTests() {
  console.log('🧮 Testing Debt Calculations...');
  
  // Test 1: Basic payoff calculation
  const balance = 5000;
  const payment = 200;
  const apr = 18.0;
  
  const months = calculateMonthsToPayoff(balance, payment, apr);
  const totalInterest = calculateTotalInterest(balance, payment, apr);
  
  console.log(`Test 1 - Basic Payoff:`);
  console.log(`  Balance: $${balance}`);
  console.log(`  Payment: $${payment}/month`);
  console.log(`  APR: ${apr}%`);
  console.log(`  Months to payoff: ${months}`);
  console.log(`  Total interest: $${totalInterest.toFixed(2)}`);
  
  // Test 2: Avalanche strategy with sample debts
  const testDebts: DebtEntry[] = [
    {
      id: generateDebtId(),
      creditorName: 'Credit Card',
      balance: 5000,
      minimumPayment: 0, // Will default to 10%
      interestRate: 24.99,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateDebtId(),
      creditorName: 'Student Loan',
      balance: 15000,
      minimumPayment: 200,
      interestRate: 6.5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const availableFunds = 1000;
  const strategy = calculateAvalancheStrategy(testDebts, availableFunds, 6);
  
  console.log(`\nTest 2 - Avalanche Strategy:`);
  console.log(`  Available funds: $${availableFunds}`);
  console.log(`  Total minimum payments: $${strategy.totalMinimumPayments}`);
  console.log(`  Extra funds: $${strategy.extraFundsAvailable}`);
  console.log(`  Recommendations:`);
  
  strategy.recommendations.forEach((rec, index) => {
    console.log(`    ${index + 1}. ${rec.creditorName}:`);
    console.log(`       Interest Rate: ${rec.interestRate}%`);
    console.log(`       Recommended Payment: $${rec.recommendedPayment}`);
    console.log(`       Is Target: ${rec.isTargetDebt}`);
    console.log(`       Months to payoff: ${rec.monthsToPayoff}`);
    if (rec.monthlyBreakdown && rec.monthlyBreakdown.length > 0) {
      console.log(`       First 3 months breakdown:`);
      rec.monthlyBreakdown.slice(0, 3).forEach(month => {
        console.log(`         Month ${month.month}: Payment $${month.payment.toFixed(2)}, Interest $${month.interestPaid.toFixed(2)}, Principal $${month.principalPaid.toFixed(2)}, Balance $${month.balance.toFixed(2)}`);
      });
    }
  });
  
  console.log('✅ Calculation tests completed!');
  return strategy;
}

// Test minimum payment defaults
export function testMinimumPaymentDefaults() {
  console.log('\n💳 Testing Minimum Payment Defaults...');
  
  const testCases = [
    { balance: 1000, expected: 100 }, // 10% of $1000
    { balance: 500, expected: 50 },   // 10% of $500
    { balance: 200, expected: 25 },   // Minimum $25
    { balance: 100, expected: 25 },   // Minimum $25
  ];
  
  testCases.forEach(({ balance, expected }) => {
    const debt: DebtEntry = {
      id: generateDebtId(),
      creditorName: 'Test Debt',
      balance,
      minimumPayment: 0, // Will be calculated
      interestRate: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const strategy = calculateAvalancheStrategy([debt], 1000);
    const actualMinPayment = strategy.recommendations[0]?.minimumPayment || 0;
    
    console.log(`  Balance: $${balance} → Min Payment: $${actualMinPayment} (expected: $${expected})`);
  });
  
  console.log('✅ Minimum payment tests completed!');
}
