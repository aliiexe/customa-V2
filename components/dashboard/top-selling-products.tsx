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
} from "recharts";

interface ProductSales {
  name: string;
  sales: number;
  totalRevenue: number;
  currentStock: number;
}

export function TopSellingProducts() {
  const [data, setData] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch("/api/dashboard/top-selling-products");
        if (response.ok) {
          const productsData = await response.json();
          setData(productsData);
        } else {
          setError("Failed to load top products data");
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
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
        No sales data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip
          formatter={(value, name) => {
            if (name === "sales") return [`${value} units`, "Sales"];
            if (name === "totalRevenue")
              return [`$${Number(value).toFixed(2)}`, "Revenue"];
            return [value, name];
          }}
        />
        <Bar dataKey="sales" fill="#4f46e5" name="Sales" />
      </BarChart>
    </ResponsiveContainer>
  );
}
