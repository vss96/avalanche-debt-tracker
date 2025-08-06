'use client';

import { useState, useEffect } from 'react';
import { UserFinances, SUPPORTED_CURRENCIES } from '@/types/debt';
import { updateAvailableFunds } from '@/utils/localStorage';
import { useCurrency } from '@/contexts/CurrencyContext';

interface AvailableFundsInputProps {
  userFinances: UserFinances | null;
  onFinancesUpdate: (finances: UserFinances) => void;
}

export default function AvailableFundsInput({ userFinances, onFinancesUpdate }: AvailableFundsInputProps) {
  const { currency, setCurrency, formatCurrency, getCurrencySymbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [minPaymentPercentage, setMinPaymentPercentage] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userFinances) {
      setAmount(userFinances.monthlyIncomeAfterExpenses.toString());
      setMinPaymentPercentage(userFinances.defaultMinimumPaymentPercentage || 2);
    }
  }, [userFinances]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError('Please enter a valid amount (0 or greater)');
      return;
    }
    
    setError('');
    
    try {
      updateAvailableFunds(numericAmount, currency, minPaymentPercentage);
      const updatedFinances: UserFinances = {
        monthlyIncomeAfterExpenses: numericAmount,
        currency: currency,
        defaultMinimumPaymentPercentage: minPaymentPercentage,
        lastUpdated: new Date()
      };
      onFinancesUpdate(updatedFinances);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving finances:', error);
      setError('Failed to save. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    if (userFinances) {
      setAmount(userFinances.monthlyIncomeAfterExpenses.toString());
      setMinPaymentPercentage(userFinances.defaultMinimumPaymentPercentage || 2);
    } else {
      setAmount('');
      setMinPaymentPercentage(2);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Available Funds
        </h2>
        {!isEditing && userFinances && (
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {!userFinances && !isEditing ? (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter your monthly income after rent and bills to get personalized debt payoff recommendations.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Set Available Funds
          </button>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="availableFunds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Income After Rent & Bills ({getCurrencySymbol()})
              </label>
              <input
                type="number"
                id="availableFunds"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Minimum Payment Percentage Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Minimum Payment: {minPaymentPercentage}%
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                1% - 10%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={minPaymentPercentage}
              onChange={(e) => setMinPaymentPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((minPaymentPercentage - 1) / 9) * 100}%, #e5e7eb ${((minPaymentPercentage - 1) / 9) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1%</span>
              <span>5%</span>
              <span>10%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used for debts where you don&apos;t specify a minimum payment. Most credit cards require 1-3% of balance.
            </p>
          </div>

          {error && (
            <div className="sm:col-span-3">
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This is the amount you have available each month for debt payments after covering rent, utilities, groceries, and other essential expenses.
          </p>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">
                  Monthly Available Funds
                </p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                  {formatCurrency(userFinances!.monthlyIncomeAfterExpenses)}
                </p>
              </div>
              <div className="text-green-600 dark:text-green-400">
                💰
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {userFinances!.lastUpdated.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
