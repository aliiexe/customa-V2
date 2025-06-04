"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export function RevenueChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch("/api/dashboard/revenue-chart");
        if (response.ok) {
          const revenueData = await response.json();
          setData(revenueData);
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        Loading...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
        <Legend />
        <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
        <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
