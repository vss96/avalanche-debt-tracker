'use client';

import { useState, useEffect } from 'react';
import { DebtEntry, UserFinances, AvalancheStrategy } from '@/types/debt';
import { loadDebts, loadUserFinances } from '@/utils/localStorage';
import { calculateAvalancheStrategy, calculateDebtSummary } from '@/utils/debtCalculations';
import DebtSummaryCard from '@/components/DebtSummaryCard';
import AvailableFundsInput from '@/components/AvailableFundsInput';
import DebtList from '@/components/DebtList';
import AvalancheDisplay from '@/components/AvalancheDisplay';
import DebtForm from '@/components/DebtForm';
import { loadSampleData } from '@/utils/sampleData';
import { runCalculationTests } from '@/utils/testCalculations';

export default function Home() {
  const [debts, setDebts] = useState<DebtEntry[]>([]);
  const [userFinances, setUserFinances] = useState<UserFinances | null>(null);
  const [avalancheStrategy, setAvalancheStrategy] = useState<AvalancheStrategy | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadedDebts = loadDebts();
    const loadedFinances = loadUserFinances();

    setDebts(loadedDebts);
    setUserFinances(loadedFinances);

    // Calculate avalanche strategy if we have both debts and finances
    if (loadedDebts.length > 0 && loadedFinances) {
      const strategy = calculateAvalancheStrategy(
        loadedDebts,
        loadedFinances.monthlyIncomeAfterExpenses,
        6, // months to show
        loadedFinances.defaultMinimumPaymentPercentage || 2
      );
      setAvalancheStrategy(strategy);
    }
  }, []);

  // Recalculate strategy when debts or finances change
  useEffect(() => {
    if (debts.length > 0 && userFinances) {
      const strategy = calculateAvalancheStrategy(
        debts,
        userFinances.monthlyIncomeAfterExpenses,
        6, // months to show
        userFinances.defaultMinimumPaymentPercentage || 2
      );
      setAvalancheStrategy(strategy);
    } else {
      setAvalancheStrategy(null);
    }
  }, [debts, userFinances]);

  const debtSummary = calculateDebtSummary(debts);

  const handleDebtAdded = (newDebt: DebtEntry) => {
    setDebts(prev => [...prev, newDebt]);
    setShowAddForm(false);
  };

  const handleDebtUpdated = (updatedDebts: DebtEntry[]) => {
    setDebts(updatedDebts);
  };

  const handleFinancesUpdated = (finances: UserFinances) => {
    setUserFinances(finances);
  };

  const handleLoadSampleData = () => {
    loadSampleData();
    // Reload data from localStorage
    const loadedDebts = loadDebts();
    const loadedFinances = loadUserFinances();
    setDebts(loadedDebts);
    setUserFinances(loadedFinances);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Debt Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your debts and optimize your payoff strategy with the avalanche method
              </p>
            </div>
            {debts.length === 0 && !userFinances && (
              <div className="flex gap-2">
                <button
                  onClick={handleLoadSampleData}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={() => runCalculationTests()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Test Calculations
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Debt Management */}
          <div className="xl:col-span-2 space-y-6">
            {/* Debt Summary */}
            <DebtSummaryCard summary={debtSummary} />

            {/* Available Funds Input */}
            <AvailableFundsInput
              userFinances={userFinances}
              onFinancesUpdate={handleFinancesUpdated}
            />

            {/* Add Debt Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Debts
              </h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
              >
                Add Debt
              </button>
            </div>

            {/* Add Debt Form */}
            {showAddForm && (
              <DebtForm
                onSubmit={handleDebtAdded}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {/* Debt List */}
            <DebtList
              debts={debts}
              onDebtsUpdate={handleDebtUpdated}
            />
          </div>

          {/* Right Column - Avalanche Strategy */}
          <div className="space-y-6">
            <AvalancheDisplay
              strategy={avalancheStrategy}
              debts={debts}
              availableFunds={userFinances?.monthlyIncomeAfterExpenses || 0}
              userFinances={userFinances}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
