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

        // Map response to match interface
        const spendingData = await response.json();
        const formattedData = spendingData.map((item: any) => ({
          month: item.month,
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
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" orientation="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          formatter={(value) => `$${Number(value).toFixed(2)}`}
          labelStyle={{ color: "#111" }}
          contentStyle={{ background: "white", border: "1px solid #ddd" }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="spending"
          name="Spending ($)"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}