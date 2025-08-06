'use client';

import { useState } from 'react';
import { AvalancheRecommendation } from '@/types/debt';
import { useCurrency } from '@/contexts/CurrencyContext';
import { calculateMonthlyBreakdown } from '@/utils/debtCalculations';

interface MonthlyBreakdownProps {
  recommendation: AvalancheRecommendation;
  monthsToShow: number;
}

export default function MonthlyBreakdown({ recommendation, monthsToShow }: MonthlyBreakdownProps) {
  const { formatCurrency } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);

  // Recalculate breakdown when months to show changes
  const breakdown = calculateMonthlyBreakdown(
    recommendation.currentBalance,
    recommendation.recommendedPayment,
    recommendation.interestRate,
    monthsToShow
  );

  const totalInterestInPeriod = breakdown.reduce((sum, month) => sum + month.interestPaid, 0);
  const totalPrincipalInPeriod = breakdown.reduce((sum, month) => sum + month.principalPaid, 0);

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
        >
          {isExpanded ? '▼' : '▶'} Monthly Breakdown
        </button>
        {isExpanded && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {breakdown.length} months
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Summary for the period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
              <p className="text-blue-700 dark:text-blue-400 font-medium">Total Payments</p>
              <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
                {formatCurrency(totalInterestInPeriod + totalPrincipalInPeriod)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
              <p className="text-green-700 dark:text-green-400 font-medium">Principal Paid</p>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">
                {formatCurrency(totalPrincipalInPeriod)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded p-3">
              <p className="text-red-700 dark:text-red-400 font-medium">Interest Paid</p>
              <p className="text-lg font-bold text-red-800 dark:text-red-300">
                {formatCurrency(totalInterestInPeriod)}
              </p>
            </div>
          </div>

          {/* Monthly breakdown table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-2 text-gray-700 dark:text-gray-300">Month</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Payment</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Interest</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Principal</th>
                  <th className="text-right py-2 text-gray-700 dark:text-gray-300">Balance</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((month) => (
                  <tr key={month.month} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 text-gray-900 dark:text-white font-medium">
                      {month.month}
                    </td>
                    <td className="py-2 text-right text-gray-900 dark:text-white">
                      {formatCurrency(month.payment)}
                    </td>
                    <td className="py-2 text-right text-red-600 dark:text-red-400">
                      {formatCurrency(month.interestPaid)}
                    </td>
                    <td className="py-2 text-right text-green-600 dark:text-green-400">
                      {formatCurrency(month.principalPaid)}
                    </td>
                    <td className="py-2 text-right text-gray-900 dark:text-white font-medium">
                      {formatCurrency(month.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {breakdown.length > 0 && breakdown[breakdown.length - 1].balance > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              * Debt will continue beyond {monthsToShow} months. 
              Remaining balance: {formatCurrency(breakdown[breakdown.length - 1].balance)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
