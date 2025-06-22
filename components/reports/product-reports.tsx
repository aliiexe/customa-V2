"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TopSellingProducts } from "@/components/dashboard/top-selling-products";
import { StockLevelsChart } from "@/components/dashboard/stock-levels-chart";
import { ProductInventoryTable } from "@/components/reports/product-inventory-table";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductData {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function ProductReports() {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }

        const productData = await response.json();
        setData(productData);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Unable to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Product Reports</h2>
        <Button variant="outline" className="border-primary hover:bg-primary/10">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-primary">{data?.totalProducts || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-amber-500">{data?.lowStockCount || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-red-500">{data?.outOfStockCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <TopSellingProducts />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <StockLevelsChart />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Product Inventory Details</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <ProductInventoryTable />
        </CardContent>
      </Card>
    </div>
  );
}