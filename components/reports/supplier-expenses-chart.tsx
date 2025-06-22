"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierExpense {
  name: string;
  expenses: number;
  products: number;
}

export function SupplierExpensesChart() {
  const [data, setData] = useState<SupplierExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/suppliers/expenses?limit=5`);

        if (!response.ok) {
          throw new Error("Failed to fetch supplier expenses data");
        }

        // Format the data
        const expensesData = await response.json();
        const formattedData = expensesData.map((item: any) => ({
          name: item.name,
          expenses: Number(item.expenses),
          products: Number(item.products)
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching supplier expenses data:", error);
        setError("Unable to load supplier expenses data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (name === "expenses") return [`$${Number(value).toFixed(2)}`, "Expenses"];
            return [value, name];
          }}
          labelStyle={{ color: '#111' }}
          contentStyle={{ background: "white", border: "1px solid #ddd" }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="expenses" name="Expenses ($)" fill="#4f46e5" />
        <Bar yAxisId="right" dataKey="products" name="Products" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}