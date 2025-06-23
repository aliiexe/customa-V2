"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SupplierExpensesChart } from "@/components/reports/supplier-expenses-chart";
import { SupplierProductsTable } from "@/components/reports/supplier-products-table";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierData {
  totalSuppliers: number;
  activePurchaseOrders: number;
  totalExpenses: number;
}

export default function SupplierReports() {
  const [data, setData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/suppliers`);

        if (!response.ok) {
          throw new Error("Failed to fetch supplier data");
        }

        const supplierData = await response.json();
        setData(supplierData);
      } catch (error) {
        console.error("Error fetching supplier data:", error);
        setError("Unable to load supplier data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">
          Supplier Reports
        </h2>
        <Button
          variant="outline"
          className="border-primary hover:bg-primary/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-primary">
                {data?.totalSuppliers || 0}
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
              <div className="text-3xl font-bold text-primary">
                {data?.activePurchaseOrders || 0}
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
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(data?.totalExpenses || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Supplier Expenses</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <SupplierExpensesChart />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Supplier Products Distribution</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <SupplierProductsTable />
        </CardContent>
      </Card>
    </div>
  );
}
