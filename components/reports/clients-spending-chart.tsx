"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface SpendingData {
  month: string;
  spending: number;
  orders: number;
}

export function ClientsSpendingChart() {
  const [data, setData] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/clients/spending?months=6`);

        if (!response.ok) {
          throw new Error("Failed to fetch spending data");
        }

        const spendingData = await response.json();
        console.log("Spending data:", spendingData); // Debug log

        // Format the data for the chart
        const formattedData = spendingData.map((item: any) => ({
          month: new Date(item.month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          spending: Number(item.spending),
          orders: Number(item.orders),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching spending data:", error);
        setError("Unable to load spending data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No spending data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="spending"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [
              name === "spending" ? `$${Number(value).toLocaleString()}` : value,
              name === "spending" ? "Spending" : "Orders",
            ]}
          />
          <Legend />
          <Line
            yAxisId="spending"
            type="monotone"
            dataKey="spending"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Spending"
            dot={{ fill: "#3b82f6" }}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#10b981"
            strokeWidth={2}
            name="Orders"
            dot={{ fill: "#10b981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}