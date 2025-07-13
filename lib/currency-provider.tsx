"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "MAD";

type CurrencyProviderProps = {
  children: React.ReactNode;
};

type CurrencyProviderState = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency?: Currency) => number;
  exchangeRates: Record<Currency, number>;
  isLoadingRates: boolean;
};

const currencyMap = {
  USD: { symbol: "$", name: "US Dollar", format: "en-US" },
  EUR: { symbol: "€", name: "Euro", format: "de-DE" },
  GBP: { symbol: "£", name: "British Pound", format: "en-GB" },
  CAD: { symbol: "C$", name: "Canadian Dollar", format: "en-CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", format: "en-AU" },
  JPY: { symbol: "¥", name: "Japanese Yen", format: "ja-JP" },
  MAD: { symbol: "MAD", name: "Moroccan Dirham", format: "ar-MA" },
};

const CurrencyProviderContext = createContext<CurrencyProviderState | undefined>(
  undefined
);

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({
    USD: 1,
    EUR: 1,
    GBP: 1,
    CAD: 1,
    AUD: 1,
    JPY: 1,
    MAD: 1,
  });
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Fetch exchange rates from free API
  const fetchExchangeRates = async () => {
    try {
      setIsLoadingRates(true);
      
      // Try our server-side endpoint first (more reliable)
      let response = await fetch('/api/exchange-rates');
      
      if (!response.ok) {
        // Fallback to direct API call
        response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      }
      
      if (response.ok) {
        const data = await response.json();
        const rates = data.rates;
        
        // Convert all rates to USD base (since API returns USD base)
        const usdRates: Record<Currency, number> = {
          USD: 1,
          EUR: rates.EUR || 1,
          GBP: rates.GBP || 1,
          CAD: rates.CAD || 1,
          AUD: rates.AUD || 1,
          JPY: rates.JPY || 1,
          MAD: rates.MAD || 1, // Note: MAD might not be available in free tier
        };
        
        setExchangeRates(usdRates);
      } else {
        console.warn('Failed to fetch exchange rates, using fallback rates');
        // Fallback rates (approximate)
        setExchangeRates({
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          CAD: 1.25,
          AUD: 1.35,
          JPY: 110,
          MAD: 9.5,
        });
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback rates (approximate)
      setExchangeRates({
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        JPY: 110,
        MAD: 9.5,
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    const savedCurrency = (localStorage.getItem("app-currency") || "USD") as Currency;
    setCurrency(savedCurrency);
    
    // Fetch exchange rates on mount
    fetchExchangeRates();
    
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSetCurrency = async (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem("app-currency", newCurrency);

    try {
      await fetch("/api/settings/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurrency }),
      });
    } catch (error) {
      console.error("Failed to save currency to server", error);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: Currency = "USD"): number => {
    if (fromCurrency === currency) return amount;
    
    // Convert from source currency to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    return usdAmount * exchangeRates[currency];
  };

  const formatCurrency = (amount: number): string => {
    const currencyInfo = currencyMap[currency];
    
    // Convert amount if it's in USD (assuming all stored amounts are in USD)
    const convertedAmount = convertCurrency(amount, "USD");
    
    if (currency === "MAD") {
      // Special formatting for Moroccan Dirham
      return `${convertedAmount.toFixed(2)} MAD`;
    }
    
    try {
      return new Intl.NumberFormat(currencyInfo.format, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.symbol}${convertedAmount.toFixed(2)}`;
    }
  };

  return (
    <CurrencyProviderContext.Provider 
      value={{ 
        currency, 
        setCurrency: handleSetCurrency,
        formatCurrency,
        convertCurrency,
        exchangeRates,
        isLoadingRates
      }}
    >
      {children}
    </CurrencyProviderContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext);

  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}; 