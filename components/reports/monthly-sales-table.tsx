"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlySalesData {
  month: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  growth: number;
}

interface MonthlySalesTableProps {
  year: number;
}

export function MonthlySalesTable({ year }: MonthlySalesTableProps) {
  const [data, setData] = useState<MonthlySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/sales/monthly?year=${year}`);

        if (!response.ok) {
          throw new Error("Failed to fetch monthly sales data");
        }

        const monthlySalesData = await response.json();
        setData(monthlySalesData);
      } catch (error) {
        console.error("Error fetching monthly sales data:", error);
        setError("Unable to load monthly sales data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Avg. Order Value</TableHead>
          <TableHead className="text-right">Growth</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.month}>
            <TableCell>{row.month}</TableCell>
            <TableCell className="text-right">
              ${row.revenue.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">{row.orders}</TableCell>
            <TableCell className="text-right">
              ${row.averageOrderValue.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={
                  row.growth >= 0 ? "text-green-600" : "text-red-600"
                }
              >
                {row.growth.toFixed(2)}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}