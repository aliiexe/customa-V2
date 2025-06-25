"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpenseData {
  name: string;
  expenses: number;
  products: number;
}

export function SupplierExpensesChart() {
  const [data, setData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reports/suppliers/expenses?limit=5");
        if (response.ok) {
          const expenseData = await response.json();
          setData(expenseData);
        }
      } catch (error) {
        console.error("Error fetching supplier expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      {data.map((supplier, index) => (
        <div
          key={supplier.name}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <h4 className="font-semibold">{supplier.name}</h4>
            <p className="text-sm text-gray-500">
              {supplier.products} products
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">
              ${supplier.expenses.toLocaleString()}
            </p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    (supplier.expenses /
                      Math.max(...data.map((d) => d.expenses))) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
