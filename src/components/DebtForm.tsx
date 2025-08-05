'use client';

import { useState } from 'react';
import { DebtEntry, DebtFormData, DebtFormErrors } from '@/types/debt';
import { validateDebtEntry, generateDebtId } from '@/utils/debtCalculations';
import { addDebt, updateDebt } from '@/utils/localStorage';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DebtFormProps {
  debt?: DebtEntry; // If provided, form is in edit mode
  onSubmit: (debt: DebtEntry) => void;
  onCancel: () => void;
}

export default function DebtForm({ debt, onSubmit, onCancel }: DebtFormProps) {
  const { getCurrencySymbol } = useCurrency();
  const isEditMode = !!debt;
  
  const [formData, setFormData] = useState<DebtFormData>({
    creditorName: debt?.creditorName || '',
    balance: debt?.balance?.toString() || '',
    minimumPayment: debt?.minimumPayment?.toString() || '',
    interestRate: debt?.interestRate?.toString() || ''
  });
  
  const [errors, setErrors] = useState<DebtFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof DebtFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const debtData: Partial<DebtEntry> = {
      creditorName: formData.creditorName.trim(),
      balance: parseFloat(formData.balance),
      minimumPayment: parseFloat(formData.minimumPayment),
      interestRate: parseFloat(formData.interestRate)
    };

    const validationErrors = validateDebtEntry(debtData);
    
    if (validationErrors.length > 0) {
      const errorMap: DebtFormErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('Creditor name')) errorMap.creditorName = error;
        if (error.includes('Balance')) errorMap.balance = error;
        if (error.includes('Minimum payment')) errorMap.minimumPayment = error;
        if (error.includes('Interest rate')) errorMap.interestRate = error;
      });
      setErrors(errorMap);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const balance = parseFloat(formData.balance);
      const minimumPayment = formData.minimumPayment
        ? parseFloat(formData.minimumPayment)
        : Math.max(balance * 0.1, 25); // Default to 10% or $25 minimum

      const debtEntry: DebtEntry = {
        id: debt?.id || generateDebtId(),
        creditorName: formData.creditorName.trim(),
        balance,
        minimumPayment,
        interestRate: parseFloat(formData.interestRate),
        createdAt: debt?.createdAt || now,
        updatedAt: now
      };

      if (isEditMode) {
        updateDebt(debtEntry.id, debtEntry);
      } else {
        addDebt(debtEntry);
      }
      
      onSubmit(debtEntry);
    } catch (error) {
      console.error('Error saving debt:', error);
      setErrors({ creditorName: 'Failed to save debt. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {isEditMode ? 'Edit Debt' : 'Add New Debt'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Creditor Name */}
        <div>
          <label htmlFor="creditorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Creditor Name
          </label>
          <input
            type="text"
            id="creditorName"
            value={formData.creditorName}
            onChange={(e) => handleInputChange('creditorName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.creditorName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g., Credit Card, Student Loan"
          />
          {errors.creditorName && (
            <p className="mt-1 text-sm text-red-600">{errors.creditorName}</p>
          )}
        </div>

        {/* Balance */}
        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Balance ({getCurrencySymbol()})
          </label>
          <input
            type="number"
            id="balance"
            step="0.01"
            min="0"
            value={formData.balance}
            onChange={(e) => handleInputChange('balance', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="0.00"
          />
          {errors.balance && (
            <p className="mt-1 text-sm text-red-600">{errors.balance}</p>
          )}
        </div>

        {/* Minimum Payment */}
        <div>
          <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Monthly Payment ({getCurrencySymbol()}) <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="number"
            id="minimumPayment"
            step="0.01"
            min="0"
            value={formData.minimumPayment}
            onChange={(e) => handleInputChange('minimumPayment', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.minimumPayment ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Leave empty for 10% of balance"
          />
          {errors.minimumPayment && (
            <p className="mt-1 text-sm text-red-600">{errors.minimumPayment}</p>
          )}
          {formData.balance && !formData.minimumPayment && (
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Default: {getCurrencySymbol()}{(parseFloat(formData.balance) * 0.1).toFixed(2)} (10% of balance)
            </p>
          )}
        </div>

        {/* Interest Rate */}
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            id="interestRate"
            step="0.01"
            min="0"
            max="100"
            value={formData.interestRate}
            onChange={(e) => handleInputChange('interestRate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.interestRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="0.00"
          />
          {errors.interestRate && (
            <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Debt' : 'Add Debt')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
