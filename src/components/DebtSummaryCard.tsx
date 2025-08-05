'use client';

import { DebtSummary } from '@/types/debt';
import { formatPercentage } from '@/utils/debtCalculations';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DebtSummaryCardProps {
  summary: DebtSummary;
}

export default function DebtSummaryCard({ summary }: DebtSummaryCardProps) {
  const { formatCurrency } = useCurrency();
  if (summary.numberOfDebts === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Debt Overview
        </h2>
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            No debts to display. Add your first debt to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Debt Overview
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debt */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-400 mb-1">Total Debt</p>
              <p className="text-xl font-bold text-red-800 dark:text-red-300">
                {formatCurrency(summary.totalDebt)}
              </p>
            </div>
            <div className="text-red-600 dark:text-red-400 text-2xl">💸</div>
          </div>
        </div>

        {/* Total Minimum Payments */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">Min. Payments</p>
              <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                {formatCurrency(summary.totalMinimumPayments)}
              </p>
            </div>
            <div className="text-yellow-600 dark:text-yellow-400 text-2xl">💳</div>
          </div>
        </div>

        {/* Number of Debts */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Active Debts</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-300">
                {summary.numberOfDebts}
              </p>
            </div>
            <div className="text-blue-600 dark:text-blue-400 text-2xl">📋</div>
          </div>
        </div>

        {/* Interest Rate Range */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Interest Range</p>
              <p className="text-lg font-bold text-purple-800 dark:text-purple-300">
                {summary.lowestInterestRate === summary.highestInterestRate 
                  ? formatPercentage(summary.highestInterestRate)
                  : `${formatPercentage(summary.lowestInterestRate)} - ${formatPercentage(summary.highestInterestRate)}`
                }
              </p>
            </div>
            <div className="text-purple-600 dark:text-purple-400 text-2xl">📈</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Average debt size:</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalDebt / summary.numberOfDebts)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Avg. minimum payment:</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalMinimumPayments / summary.numberOfDebts)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
