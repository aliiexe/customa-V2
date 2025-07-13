"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme-provider";
import { useCurrency } from "@/lib/currency-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, formatCurrency, exchangeRates, isLoadingRates } = useCurrency();

  // Theme options
  const themes = [
    { id: "green", name: "Green", color: "#16A249" },
    { id: "red", name: "Red", color: "#FE4D50" },
    { id: "purple", name: "Purple", color: "#8C4DFE" },
    { id: "blue", name: "Blue", color: "#4DAEFE" },
  ];

  // Currency options
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", example: "1,234.56" },
    { code: "EUR", name: "Euro", symbol: "€", example: "1.234,56" },
    { code: "GBP", name: "British Pound", symbol: "£", example: "1,234.56" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", example: "1,234.56" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", example: "1,234.56" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", example: "123,456" },
    { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", example: "1,234.56 MAD" },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-primary mb-8 flex items-center">
        Settings
      </h1>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the color theme of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Choose a theme color</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() =>
                        setTheme(t.id as "green" | "red" | "purple" | "blue")
                      }
                      className={`flex cursor-pointer flex-col items-center rounded-md border p-4 hover:border-primary transition-all ${
                        theme === t.id ? "border-2 border-primary" : ""
                      }`}
                    >
                      <div
                        className="mb-2 h-10 w-10 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Currency
                {isLoadingRates && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </CardTitle>
              <CardDescription>
                Choose your preferred currency for displaying prices and amounts. 
                {isLoadingRates ? " Loading real-time exchange rates..." : " Exchange rates are updated hourly."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Select your preferred currency</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currencies.map((curr) => (
                    <div
                      key={curr.code}
                      onClick={() => setCurrency(curr.code as any)}
                      className={`flex cursor-pointer flex-col rounded-md border p-4 hover:border-primary transition-all ${
                        currency === curr.code ? "border-2 border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold">{curr.symbol}</span>
                        <span className="text-sm text-gray-500">{curr.code}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{curr.name}</span>
                      <span className="text-xs text-gray-500 mt-1">Example: {curr.example}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <p className="text-lg">
                    Sample amount: <span className="font-semibold text-primary">{formatCurrency(1234.56)}</span>
                  </p>
                  {isLoadingRates ? (
                    <p className="text-xs text-gray-500 mt-2">Loading exchange rates...</p>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-600">Current Exchange Rates (USD base):</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {currencies.map((curr) => (
                          <div key={curr.code} className="flex justify-between">
                            <span>{curr.code}:</span>
                            <span className="font-medium">
                              {exchangeRates[curr.code as Currency]?.toFixed(4) || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">
                Account settings coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">
                Notification settings coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
