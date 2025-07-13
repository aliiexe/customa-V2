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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/lib/currency-provider";

interface MonthlySalesData {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

interface MonthlySalesTableProps {
  year: number;
}

export function MonthlySalesTable({ year }: MonthlySalesTableProps) {
  const { formatCurrency } = useCurrency();
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
          <TableHead className="text-right">Growth</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.month}>
            <TableCell className="font-medium">{item.month}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(item.revenue)}
            </TableCell>
            <TableCell className="text-right">{item.orders}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                {item.growth > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+{item.growth}%</span>
                  </>
                ) : item.growth < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600">{item.growth}%</span>
                  </>
                ) : (
                  <span>0%</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
