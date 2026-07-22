import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // exchange rate relative to 1 USD
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", rate: 1.0, label: "USD ($) - US Dollar" },
  INR: { code: "INR", symbol: "₹", rate: 83.5, label: "INR (₹) - Indian Rupee" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, label: "EUR (€) - Euro" },
  GBP: { code: "GBP", symbol: "£", rate: 0.78, label: "GBP (£) - British Pound" },
  JPY: { code: "JPY", symbol: "¥", rate: 155.0, label: "JPY (¥) - Japanese Yen" },
  CAD: { code: "CAD", symbol: "C$", rate: 1.36, label: "CAD (C$) - Canadian Dollar" },
  AUD: { code: "AUD", symbol: "A$", rate: 1.50, label: "AUD (A$) - Australian Dollar" },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (usdAmount: number, decimals?: number) => string;
  convertAmount: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("trackwise_currency") as CurrencyCode;
    return saved && CURRENCIES[saved] ? saved : "USD";
  });

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.USD;

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem("trackwise_currency", code);
    }
  };

  const convertAmount = (usdAmount: number): number => {
    return (usdAmount || 0) * currencyConfig.rate;
  };

  const formatAmount = (usdAmount: number, decimals: number = 2): string => {
    const converted = convertAmount(usdAmount);
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${currencyConfig.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatAmount,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
