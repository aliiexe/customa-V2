"use client";

import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#4f46e5", // indigo
  "#f43f5e", // rose
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
];

// Update interface to match API response structure
interface CategoryData {
  name: string;
  value: number; // Using 'value' instead of 'count' to match API response
}

export function CategoryDistribution() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch("/api/dashboard/category-distribution");
        if (response.ok) {
          const categoryData = await response.json();
          setData(categoryData);
        } else {
          setError("Failed to load category data");
        }
      } catch (error) {
        console.error("Error fetching category distribution:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
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
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}`, "Products"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
