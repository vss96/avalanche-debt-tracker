'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SUPPORTED_CURRENCIES } from '@/types/debt';
import { loadUserFinances } from '@/utils/localStorage';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    // Load currency from user finances or detect from browser
    const userFinances = loadUserFinances();
    if (userFinances?.currency) {
      setCurrencyState(userFinances.currency);
    } else {
      // Try to detect currency from browser locale
      try {
        const locale = navigator.language;
        const detectedCurrency = detectCurrencyFromLocale(locale);
        setCurrencyState(detectedCurrency);
      } catch {
        setCurrencyState('USD');
      }
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
  };

  const formatCurrency = (amount: number): string => {
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback to USD if currency code is not supported
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
  };

  const getCurrencySymbol = (): string => {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    return currencyInfo?.symbol || '$';
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Helper function to detect currency from locale
function detectCurrencyFromLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'ja-JP': 'JPY',
  };

  // Check exact match first
  if (localeMap[locale]) {
    return localeMap[locale];
  }

  // Check language prefix
  const language = locale.split('-')[0];
  const languageMap: Record<string, string> = {
    'en': 'USD',
    'fr': 'EUR',
    'de': 'EUR',
    'es': 'EUR',
    'it': 'EUR',
    'ja': 'JPY',
  };

  return languageMap[language] || 'USD';
}
