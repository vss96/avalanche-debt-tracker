'use client';

import { useState } from 'react';
import { AvalancheStrategy, DebtEntry } from '@/types/debt';
import { formatPercentage, calculateAvalancheStrategy } from '@/utils/debtCalculations';
import { useCurrency } from '@/contexts/CurrencyContext';
import MonthlyBreakdown from './MonthlyBreakdown';

interface AvalancheDisplayProps {
  strategy: AvalancheStrategy | null;
  debts?: DebtEntry[];
  availableFunds?: number;
  userFinances?: any;
}

export default function AvalancheDisplay({ strategy, debts, availableFunds, userFinances }: AvalancheDisplayProps) {
  const { formatCurrency } = useCurrency();
  const [monthsToShow, setMonthsToShow] = useState(6);

  // Ensure we have valid arrays and numbers
  const safeDebts = debts || [];
  const safeAvailableFunds = availableFunds || 0;
  const defaultPercentage = userFinances?.defaultMinimumPaymentPercentage || 2;

  // Recalculate strategy when months to show changes
  const currentStrategy = (safeDebts.length > 0 && safeAvailableFunds > 0)
    ? calculateAvalancheStrategy(safeDebts, safeAvailableFunds, monthsToShow, defaultPercentage)
    : strategy;
  if (!currentStrategy) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Avalanche Strategy
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            Add debts and set your available funds to see your personalized debt payoff strategy.
          </p>
        </div>
      </div>
    );
  }

  const { recommendations, totalAvailableFunds, totalMinimumPayments, extraFundsAvailable } = currentStrategy;

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Avalanche Strategy
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Available Funds:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalAvailableFunds)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Minimum Payments:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalMinimumPayments)}
            </span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 dark:text-gray-400">Extra for Debt:</span>
            <span className={`font-bold ${extraFundsAvailable > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(extraFundsAvailable)}
            </span>
          </div>
        </div>

        {extraFundsAvailable <= 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Your available funds only cover minimum payments. Consider increasing income or reducing expenses to accelerate debt payoff.
            </p>
          </div>
        )}
      </div>

      {/* Payment Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended Payments
          </h3>
        </div>

        {/* Months Preview Slider */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview Timeline: {monthsToShow} months
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Drag to adjust (1-12 months)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={monthsToShow}
            onChange={(e) => setMonthsToShow(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((monthsToShow - 1) / 11) * 100}%, #e5e7eb ${((monthsToShow - 1) / 11) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 month</span>
            <span>6 months</span>
            <span>12 months</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.debtId}
              className={`p-4 rounded-lg border-2 ${
                rec.isTargetDebt 
                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
                  : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {rec.creditorName}
                    {rec.isTargetDebt && (
                      <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                        FOCUS HERE
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPercentage(rec.interestRate)} APR
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority #{index + 1}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(rec.currentBalance)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Recommended Payment</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(rec.recommendedPayment)}
                  </p>
                </div>
              </div>
              
              {rec.monthsToPayoff && rec.monthsToPayoff !== Infinity && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Payoff time: <span className="font-semibold">{rec.monthsToPayoff} months</span>
                      </p>
                    </div>
                    {rec.totalInterestSaved && rec.totalInterestSaved > 0 && (
                      <div>
                        <p className="text-green-600 dark:text-green-400">
                          Interest saved: <span className="font-semibold">{formatCurrency(rec.totalInterestSaved)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {rec.isTargetDebt && extraFundsAvailable > 0 && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Put all extra funds ({formatCurrency(extraFundsAvailable)}) toward this debt to save the most on interest.
                  </p>
                </div>
              )}

              {/* Monthly Breakdown */}
              <MonthlyBreakdown recommendation={rec} />
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          How the Avalanche Method Works
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>• Pay minimum amounts on all debts</p>
          <p>• Put any extra money toward the debt with the highest interest rate</p>
          <p>• Once that debt is paid off, move to the next highest interest rate</p>
          <p>• This method saves you the most money on interest over time</p>
        </div>
      </div>
    </div>
  );
}
