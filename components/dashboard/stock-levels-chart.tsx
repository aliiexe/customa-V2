"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface StockLevel {
  name: string;
  stock: number;
}

export function StockLevelsChart() {
  const [data, setData] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const response = await fetch("/api/dashboard/stock-levels");
        if (response.ok) {
          const stockData = await response.json();
          setData(stockData);
        } else {
          setError("Failed to load stock data");
        }
      } catch (error) {
        console.error("Error fetching stock levels:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchStockLevels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] text-red-500">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        No stock data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip formatter={(value) => [`${value} units`, "In Stock"]} />
        <Bar dataKey="stock">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.stock < 10 ? "#ef4444" : "#22c55e"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
