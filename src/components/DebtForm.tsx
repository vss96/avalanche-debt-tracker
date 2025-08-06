'use client';

import { useState, useEffect } from 'react';
import { DebtEntry, DebtFormData, DebtFormErrors, DEBT_TYPES } from '@/types/debt';
import { validateDebtEntry, generateDebtId } from '@/utils/debtCalculations';
import { addDebt, updateDebt, loadUserFinances } from '@/utils/localStorage';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DebtFormProps {
  debt?: DebtEntry; // If provided, form is in edit mode
  onSubmit: (debt: DebtEntry) => void;
  onCancel: () => void;
}

export default function DebtForm({ debt, onSubmit, onCancel }: DebtFormProps) {
  const { getCurrencySymbol } = useCurrency();
  const isEditMode = !!debt;

  // Get user's preferred minimum payment percentage
  const userFinances = loadUserFinances();
  const defaultPercentage = userFinances?.defaultMinimumPaymentPercentage || 2;
  
  const [formData, setFormData] = useState<DebtFormData>({
    creditorName: debt?.creditorName || '',
    debtType: debt?.debtType || 'credit_card',
    balance: debt?.balance?.toString() || '',
    minimumPayment: debt?.minimumPayment?.toString() || '',
    interestRate: debt?.interestRate?.toString() || '',
    loanDurationMonths: debt?.loanDurationMonths?.toString() || '',
    loanFee: debt?.loanFee?.toString() || '',
    loanFeeType: debt?.loanFeeType || 'monthly'
  });
  
  const [errors, setErrors] = useState<DebtFormErrors>({});

  // Clear loan-specific fields when switching from loan to credit card
  useEffect(() => {
    if (formData.debtType === 'credit_card') {
      setFormData(prev => ({
        ...prev,
        loanDurationMonths: '',
        loanFee: '',
        loanFeeType: 'monthly'
      }));
    }
  }, [formData.debtType]);
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
      debtType: formData.debtType,
      balance: parseFloat(formData.balance),
      minimumPayment: formData.minimumPayment ? parseFloat(formData.minimumPayment) : undefined,
      interestRate: parseFloat(formData.interestRate),
      loanDurationMonths: formData.debtType === 'loan' && formData.loanDurationMonths ? parseInt(formData.loanDurationMonths) : undefined,
      loanFee: formData.debtType === 'loan' && formData.loanFee ? parseFloat(formData.loanFee) : undefined,
      loanFeeType: formData.debtType === 'loan' && formData.loanFee ? formData.loanFeeType : undefined
    };

    const validationErrors = validateDebtEntry(debtData);
    
    if (validationErrors.length > 0) {
      const errorMap: DebtFormErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('Creditor name')) errorMap.creditorName = error;
        if (error.includes('Balance')) errorMap.balance = error;
        if (error.includes('Minimum payment')) errorMap.minimumPayment = error;
        if (error.includes('Interest rate')) errorMap.interestRate = error;
        if (error.includes('Debt type')) errorMap.debtType = error;
        if (error.includes('Loan duration')) errorMap.loanDurationMonths = error;
        if (error.includes('Loan fee')) errorMap.loanFee = error;
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

      // Get user's preferred minimum payment percentage
      const userFinances = loadUserFinances();
      const defaultPercentage = userFinances?.defaultMinimumPaymentPercentage || 2;

      const minimumPayment = formData.minimumPayment
        ? parseFloat(formData.minimumPayment)
        : Math.max(balance * (defaultPercentage / 100), 25); // Use user's percentage or $25 minimum

      const debtEntry: DebtEntry = {
        id: debt?.id || generateDebtId(),
        creditorName: formData.creditorName.trim(),
        debtType: formData.debtType,
        balance,
        minimumPayment,
        interestRate: parseFloat(formData.interestRate),
        // Only include loan fields if it's actually a loan
        loanDurationMonths: formData.debtType === 'loan' && formData.loanDurationMonths ? parseInt(formData.loanDurationMonths) : undefined,
        loanFee: formData.debtType === 'loan' && formData.loanFee ? parseFloat(formData.loanFee) : undefined,
        loanFeeType: formData.debtType === 'loan' && formData.loanFee ? formData.loanFeeType : undefined,
        createdAt: debt?.createdAt || now,
        updatedAt: now
      };

      if (isEditMode) {
        // For updates, only pass the fields that can change (exclude id, createdAt)
        const updates = {
          creditorName: debtEntry.creditorName,
          debtType: debtEntry.debtType,
          balance: debtEntry.balance,
          minimumPayment: debtEntry.minimumPayment,
          interestRate: debtEntry.interestRate,
          loanDurationMonths: debtEntry.loanDurationMonths,
          loanFee: debtEntry.loanFee,
          loanFeeType: debtEntry.loanFeeType,
          updatedAt: debtEntry.updatedAt
        };
        updateDebt(debtEntry.id, updates);
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
        {/* Debt Type */}
        <div>
          <label htmlFor="debtType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Debt Type
          </label>
          <select
            id="debtType"
            value={formData.debtType}
            onChange={(e) => handleInputChange('debtType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {DEBT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          {errors.debtType && (
            <p className="mt-1 text-sm text-red-600">{errors.debtType}</p>
          )}
        </div>

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
            placeholder={formData.debtType === 'credit_card' ? 'e.g., Chase Visa, Capital One' : 'e.g., Wells Fargo Auto Loan, SoFi Personal Loan'}
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
            placeholder="Leave empty for default percentage"
          />
          {errors.minimumPayment && (
            <p className="mt-1 text-sm text-red-600">{errors.minimumPayment}</p>
          )}
          {formData.balance && !formData.minimumPayment && (
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Default: {getCurrencySymbol()}{(parseFloat(formData.balance) * (defaultPercentage / 100)).toFixed(2)} ({defaultPercentage}% of balance)
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

        {/* Loan-specific fields */}
        {formData.debtType === 'loan' && (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              🏦 Loan Details
            </h4>

            {/* Loan Duration */}
            <div>
              <label htmlFor="loanDurationMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loan Duration (months)
              </label>
              <input
                type="number"
                id="loanDurationMonths"
                min="1"
                max="24"
                value={formData.loanDurationMonths}
                onChange={(e) => handleInputChange('loanDurationMonths', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.loanDurationMonths ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 12 for 1 year, 24 for 2 years"
              />
              {errors.loanDurationMonths && (
                <p className="mt-1 text-sm text-red-600">{errors.loanDurationMonths}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Original loan term in months (max 24 months = 2 years)
              </p>
            </div>

            {/* Loan Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="loanFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Fee ({getCurrencySymbol()}) <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  id="loanFee"
                  step="0.01"
                  min="0"
                  value={formData.loanFee}
                  onChange={(e) => handleInputChange('loanFee', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.loanFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0.00"
                />
                {errors.loanFee && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanFee}</p>
                )}
              </div>

              <div>
                <label htmlFor="loanFeeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fee Type
                </label>
                <select
                  id="loanFeeType"
                  value={formData.loanFeeType}
                  onChange={(e) => handleInputChange('loanFeeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!formData.loanFee}
                >
                  <option value="monthly">Monthly Fee</option>
                  <option value="upfront">Upfront Fee</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.loanFeeType === 'monthly' ? 'Added to each payment' : 'Added to loan balance'}
                </p>
              </div>
            </div>
          </div>
        )}

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
