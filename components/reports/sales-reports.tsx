"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { MonthlySalesTable } from "@/components/reports/monthly-sales-table";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
}

export default function SalesReports() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1st of current year
    to: new Date(),
  });

  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const startDate = dateRange.from.toISOString().split("T")[0];
        const endDate = dateRange.to.toISOString().split("T")[0];

        const response = await fetch(
          `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sales data");
        }

        const data = await response.json();
        setSalesData(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError("Unable to load sales data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [dateRange]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4 bg-secondary/50 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold text-primary flex items-center">
          Sales Performance
        </h2>
        <DateRangePicker
          dateRange={dateRange}
          onUpdate={handleDateRangeChange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2 bg-white">
            <CardDescription>Total Revenue</CardDescription>
            {loading ? (
              <Skeleton className="h-10 w-2/3" />
            ) : (
              <CardTitle className="text-3xl font-bold text-primary">
                {formatCurrency(salesData?.totalRevenue || 0)}
                {salesData?.revenueGrowth !== undefined && (
                  <span
                    className={`text-sm ml-2 ${
                      salesData.revenueGrowth >= 0
                        ? "text-primary"
                        : "text-red-600"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4 inline" />{" "}
                    {salesData.revenueGrowth >= 0 ? "+" : ""}
                    {salesData.revenueGrowth.toFixed(1)}%
                  </span>
                )}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="bg-white">
            <DollarSign className="h-8 w-8 text-primary/20 absolute bottom-4 right-4" />
            <p className="text-gray-500 text-sm">During selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2 bg-white">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">
              243
              <span className="text-sm text-primary ml-2">
                <ArrowUpRight className="h-4 w-4 inline" /> +8%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <ShoppingCart className="h-8 w-8 text-primary/20 absolute bottom-4 right-4" />
            <p className="text-gray-500 text-sm">During selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2 bg-white">
            <CardDescription>Average Order Value</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">
              $528.52
              <span className="text-sm text-primary ml-2">
                <TrendingUp className="h-4 w-4 inline" /> +4%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <TrendingUp className="h-8 w-8 text-primary/20 absolute bottom-4 right-4" />
            <p className="text-gray-500 text-sm">During selected period</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-primary">Revenue Over Time</CardTitle>
          <CardDescription>
            Monthly revenue trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <RevenueChart />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-primary">
            Monthly Sales Breakdown
          </CardTitle>
          <CardDescription>
            Detailed monthly sales data with growth indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <MonthlySalesTable year={dateRange.from.getFullYear()} />
        </CardContent>
      </Card>
    </div>
  );
}
