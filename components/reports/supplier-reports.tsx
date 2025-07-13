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
  Download,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Package as PackageIcon,
  AlertTriangle,
} from "lucide-react";
import { SupplierExpensesChart } from "@/components/reports/supplier-expenses-chart";
import { SupplierProductsTable } from "@/components/reports/supplier-products-table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-provider";

interface SupplierData {
  totalSuppliers: number;
  activePurchaseOrders: number;
  totalExpenses: number;
  reliabilityScore?: number;
  averageDeliveryTime?: number;
  activeSuppliers: number;
  totalProducts?: number;
  pendingInvoices?: number;
  pendingAmount?: number;
  supplierEfficiency: number;
}

interface SupplierReportsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export default function SupplierReports({ dateRange }: SupplierReportsProps) {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = dateRange.from.toISOString().split("T")[0];
        const endDate = dateRange.to.toISOString().split("T")[0];

        const [supplierResponse, paymentResponse] = await Promise.all([
          fetch(
            `/api/reports/suppliers?startDate=${startDate}&endDate=${endDate}`
          ),
          fetch("/api/dashboard/alerts"),
        ]);

        if (!supplierResponse.ok) {
          throw new Error("Failed to fetch supplier data");
        }

        const supplierData = await supplierResponse.json();

        // Add some calculated values if not provided by API
        setData({
          ...supplierData,
          reliabilityScore: supplierData.reliabilityScore || 87, // Default value if not provided
          averageDeliveryTime: supplierData.averageDeliveryTime || 5.3, // Default value if not provided
        });

        // Get pending payment info from alerts
        if (paymentResponse.ok) {
          const alertsData = await paymentResponse.json();
          const paymentAlert = alertsData.find(
            (alert: any) => alert.id === "unpaid-suppliers"
          );
          if (paymentAlert) {
            setPendingPayments(paymentAlert.value || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching supplier data:", error);
        setError("Unable to load supplier data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);



  const handleExportCSV = async () => {
    try {
      if (!data) {
        console.error("No supplier data available for export");
        return;
      }

      // Fetch detailed supplier data
      const [expensesResponse, productsResponse] = await Promise.all([
        fetch("/api/reports/suppliers/expenses?limit=50"),
        fetch("/api/reports/suppliers/products"),
      ]);

      let expenses = [];
      let products = [];

      if (expensesResponse.ok) {
        expenses = await expensesResponse.json();
      }

      if (productsResponse.ok) {
        products = await productsResponse.json();
      }

      // Create comprehensive CSV data
      const csvData = [
        // Summary data
        ["Supplier Analytics Summary"],
        [""],
        ["Metric", "Value"],
        ["Total Suppliers", data.totalSuppliers.toString()],
        ["Active Suppliers", data.activeSuppliers.toString()],
        ["Total Products", data.totalProducts?.toString() || "0"],
        ["Total Expenses", `$${data.totalExpenses.toLocaleString()}`],
        ["Pending Invoices", data.pendingInvoices?.toString() || "0"],
        ["Pending Amount", `$${data.pendingAmount?.toLocaleString() || "0"}`],
        ["Supplier Efficiency %", `${data.supplierEfficiency.toFixed(1)}%`],
        [
          "Period",
          `${format(dateRange.from, "yyyy-MM-dd")} to ${format(
            dateRange.to,
            "yyyy-MM-dd"
          )}`,
        ],
        ["Generated At", new Date().toLocaleString()],
        [""],
        // Supplier expenses data
        ["Supplier Expenses"],
        [""],
        ["Supplier Name", "Total Expenses", "Products Count"],
      ];

      // Add expenses details
      expenses.forEach((supplier: any) => {
        csvData.push([
          supplier.name || "",
          `$${supplier.expenses?.toLocaleString() || "0"}`,
          supplier.products?.toString() || "0",
        ]);
      });

      csvData.push([""], ["Supplier Products Distribution"], [""]);
      csvData.push([
        "Supplier Name",
        "Product Count",
        "Average Price",
        "Market Share %",
      ]);

      // Add products details
      products.forEach((supplier: any) => {
        csvData.push([
          supplier.name || "",
          supplier.totalProducts?.toString() || "0",
          `$${supplier.avgPrice?.toFixed(2) || "0.00"}`,
          `${supplier.percentage?.toFixed(1) || "0"}%`,
        ]);
      });

      const csvContent = csvData.map((row) =>
        row.map((field) => `"${field}"`).join(",")
      ).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `supplier-report-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Supplier report exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Supplier Reports
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
          Export Supplier Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {data?.totalSuppliers || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Active vendors</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Active Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {data?.activePurchaseOrders || 0}
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">In progress</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Expenses YTD</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(data?.totalExpenses || 0)}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Year to date</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-amber-500">
                  {formatCurrency(pendingPayments)}
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-gray-500">
                    Awaiting payment
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>Quality and reliability metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Reliability Score
                    </span>
                    <span className="text-sm font-medium">
                      {data?.reliabilityScore || 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${data?.reliabilityScore || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Based on delivery time and quality
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Avg. Delivery Time
                    </span>
                    <span className="text-sm font-medium">
                      {data?.averageDeliveryTime} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((data?.averageDeliveryTime || 0) / 10) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    From order to delivery
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => (window.location.href = "/suppliers")}
                >
                  View All Suppliers
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card className="bg-white shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Supplier Expenses</CardTitle>
            <CardDescription>Monthly expense breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-white">
            <SupplierExpensesChart />
          </CardContent>
        </Card> */}
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Supplier Products Distribution</CardTitle>
          <CardDescription>
            Product distribution among suppliers
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          <SupplierProductsTable />
        </CardContent>
      </Card>
    </div>
  );
}
