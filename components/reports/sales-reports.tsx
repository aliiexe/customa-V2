"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
} from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { MonthlySalesTable } from "@/components/reports/monthly-sales-table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth?: number;
}

interface SalesReportsProps {
  dateRange: { from: Date; to: Date };
}

export default function SalesReports({ dateRange }: SalesReportsProps) {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleExportCSV = async () => {
    try {
      if (!salesData) {
        console.error("No sales data available for export");
        return;
      }

      const startDate = dateRange.from.toISOString().split("T")[0];
      const endDate = dateRange.to.toISOString().split("T")[0];

      // Create CSV data
      const csvData = [
        ["Metric", "Value"],
        ["Total Revenue", `$${salesData.totalRevenue.toLocaleString()}`],
        ["Total Orders", salesData.totalOrders.toString()],
        ["Average Order Value", `$${salesData.avgOrderValue.toFixed(2)}`],
        ["Revenue Growth %", `${salesData.revenueGrowth?.toFixed(1) || 0}%`],
        ["Period", `${startDate} to ${endDate}`],
        ["Generated At", new Date().toLocaleString()],
      ];

      const csvContent = csvData
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `sales-report-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Sales report exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Sales Performance
          </h2>
          <p className="text-gray-500">
            {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary hover:bg-primary/10"
          onClick={handleExportCSV}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2">
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
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {salesData.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 inline" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 inline" />
                    )}
                    {salesData.revenueGrowth >= 0 ? "+" : ""}
                    {salesData.revenueGrowth.toFixed(1)}%
                  </span>
                )}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <DollarSign className="h-8 w-8 text-primary/20" />
            <p className="text-gray-500 text-sm">During selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
            {loading ? (
              <Skeleton className="h-10 w-2/3" />
            ) : (
              <CardTitle className="text-3xl font-bold text-primary">
                {salesData?.totalOrders || 0}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <ShoppingCart className="h-8 w-8 text-primary/20" />
            <p className="text-gray-500 text-sm">During selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Average Order Value</CardDescription>
            {loading ? (
              <Skeleton className="h-10 w-2/3" />
            ) : (
              <CardTitle className="text-3xl font-bold text-primary">
                {formatCurrency(salesData?.avgOrderValue || 0)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-8 w-8 text-primary/20" />
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
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
          <MonthlySalesTable year={dateRange.from.getFullYear()} />
        </CardContent>
      </Card>
    </div>
  );
}
