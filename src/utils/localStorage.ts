import { DebtEntry, UserFinances, STORAGE_KEYS } from '@/types/debt';

/**
 * Utility functions for managing localStorage data
 */

// Generic localStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    const parsed = JSON.parse(item);
    return parsed;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
}

// Debt-specific storage functions
export function loadDebts(): DebtEntry[] {
  const debts = getFromStorage<DebtEntry[]>(STORAGE_KEYS.DEBTS, []);
  
  // Convert date strings back to Date objects and ensure debtType exists
  return debts.map(debt => ({
    ...debt,
    debtType: debt.debtType || 'credit_card', // Default to credit card if not set
    createdAt: new Date(debt.createdAt),
    updatedAt: new Date(debt.updatedAt)
  }));
}

export function saveDebts(debts: DebtEntry[]): void {
  saveToStorage(STORAGE_KEYS.DEBTS, debts);
}

export function addDebt(debt: DebtEntry): void {
  const existingDebts = loadDebts();
  const updatedDebts = [...existingDebts, debt];
  saveDebts(updatedDebts);
}

export function updateDebt(debtId: string, updates: Partial<DebtEntry>): void {
  const debts = loadDebts();
  const debtIndex = debts.findIndex(debt => debt.id === debtId);
  
  if (debtIndex === -1) {
    throw new Error(`Debt with ID ${debtId} not found`);
  }
  
  debts[debtIndex] = {
    ...debts[debtIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  saveDebts(debts);
}

export function deleteDebt(debtId: string): void {
  const debts = loadDebts();
  const filteredDebts = debts.filter(debt => debt.id !== debtId);
  saveDebts(filteredDebts);
}

// User finances storage functions
export function loadUserFinances(): UserFinances | null {
  const finances = getFromStorage<UserFinances | null>(STORAGE_KEYS.USER_FINANCES, null);
  
  if (!finances) return null;
  
  // Convert date string back to Date object and ensure defaults exist
  return {
    ...finances,
    currency: finances.currency || 'USD', // Default to USD if not set
    defaultMinimumPaymentPercentage: finances.defaultMinimumPaymentPercentage || 2, // Default to 2%
    lastUpdated: new Date(finances.lastUpdated)
  };
}

export function saveUserFinances(finances: UserFinances): void {
  saveToStorage(STORAGE_KEYS.USER_FINANCES, finances);
}

export function updateAvailableFunds(amount: number, currency: string = 'USD', defaultMinPaymentPercentage: number = 2): void {
  const finances: UserFinances = {
    monthlyIncomeAfterExpenses: amount,
    currency: currency,
    defaultMinimumPaymentPercentage: defaultMinPaymentPercentage,
    lastUpdated: new Date()
  };
  saveUserFinances(finances);
}

// Data migration and cleanup
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export function exportData(): string {
  const data = {
    debts: loadDebts(),
    userFinances: loadUserFinances(),
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.debts && Array.isArray(data.debts)) {
      saveDebts(data.debts);
    }
    
    if (data.userFinances) {
      saveUserFinances(data.userFinances);
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON data' 
    };
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
