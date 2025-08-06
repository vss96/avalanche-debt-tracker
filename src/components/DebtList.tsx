'use client';

import { useState } from 'react';
import { DebtEntry, DEBT_TYPES } from '@/types/debt';
import { deleteDebt, loadDebts } from '@/utils/localStorage';
import { formatPercentage } from '@/utils/debtCalculations';
import { useCurrency } from '@/contexts/CurrencyContext';
import DebtForm from './DebtForm';

interface DebtListProps {
  debts: DebtEntry[];
  onDebtsUpdate: (debts: DebtEntry[]) => void;
}

export default function DebtList({ debts, onDebtsUpdate }: DebtListProps) {
  const { formatCurrency } = useCurrency();
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const handleEdit = (debtId: string) => {
    setEditingDebtId(debtId);
  };

  const handleDelete = (debtId: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      deleteDebt(debtId);
      const updatedDebts = loadDebts();
      onDebtsUpdate(updatedDebts);
    }
  };

  const handleEditSubmit = () => {
    // The DebtForm already saved the debt to localStorage via updateDebt()
    // We just need to refresh the list and close the form
    const updatedDebts = loadDebts();
    onDebtsUpdate(updatedDebts);
    setEditingDebtId(null);
  };

  const handleEditCancel = () => {
    setEditingDebtId(null);
  };

  if (debts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <div className="mx-auto h-12 w-12 mb-4 text-gray-400">💳</div>
          <h3 className="text-lg font-medium mb-2">No debts added yet</h3>
          <p>Add your first debt to get started with tracking and optimization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <div key={debt.id}>
          {editingDebtId === debt.id ? (
            <DebtForm
              debt={debt}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {DEBT_TYPES.find(type => type.value === debt.debtType)?.icon || '💳'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {debt.creditorName}
                    </h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                      {DEBT_TYPES.find(type => type.value === debt.debtType)?.label || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Added {debt.createdAt.toLocaleDateString()}
                    {debt.debtType === 'loan' && debt.loanDurationMonths && (
                      <span className="ml-2">• {debt.loanDurationMonths} month term</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(debt.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 ${debt.debtType === 'loan' && debt.loanFee ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(debt.balance)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Payment</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(debt.minimumPayment)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage(debt.interestRate)}
                  </p>
                </div>

                {/* Loan Fee (if applicable) */}
                {debt.debtType === 'loan' && debt.loanFee && debt.loanFee > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">
                      {debt.loanFeeType === 'monthly' ? 'Monthly Fee' : 'Upfront Fee'}
                    </p>
                    <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                      {formatCurrency(debt.loanFee)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Interest Rate Visual Indicator */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Interest Rate</span>
                  <span>{formatPercentage(debt.interestRate)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      debt.interestRate > 20 ? 'bg-red-500' :
                      debt.interestRate > 10 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(debt.interestRate * 2, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {debt.interestRate > 20 ? 'High interest rate - prioritize this debt' :
                   debt.interestRate > 10 ? 'Moderate interest rate' :
                   'Low interest rate'}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
