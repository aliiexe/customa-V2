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
import { useUser } from "@clerk/nextjs";
import React from "react";
import { useCurrency } from "@/lib/currency-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isLoaded, user } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    async function fetchDbUser() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) {
          setError("Not authorized or user not found.");
          setDbUser(null);
        } else {
          setDbUser(await res.json());
        }
      } catch (e) {
        setError("Failed to fetch user info.");
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchDbUser();
  }, [isLoaded]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!dbUser) return;
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await fetch("/api/users/" + dbUser.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbUser),
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccess(true);
    } catch (e) {
      setError("Failed to update user info.");
    } finally {
      setSaving(false);
    }
  }
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
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : dbUser ? (
                <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={dbUser.firstname}
                      onChange={e => setDbUser({ ...dbUser, firstname: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={dbUser.lastname}
                      onChange={e => setDbUser({ ...dbUser, lastname: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={dbUser.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={dbUser.phone}
                      onChange={e => setDbUser({ ...dbUser, phone: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={dbUser.address}
                      onChange={e => setDbUser({ ...dbUser, address: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={dbUser.city}
                      onChange={e => setDbUser({ ...dbUser, city: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded mt-2"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Update"}
                  </button>
                  {success && <div className="text-green-600 mt-2">Updated!</div>}
                </form>
              ) : null}
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
