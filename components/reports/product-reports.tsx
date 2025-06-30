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
  AlertTriangle,
  Package,
  TrendingUp,
} from "lucide-react";
import { TopSellingProducts } from "@/components/dashboard/top-selling-products";
import { StockLevelsChart } from "@/components/dashboard/stock-levels-chart";
import { ProductInventoryTable } from "@/components/reports/product-inventory-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductData {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  totalCategories: number;
  topCategoriesDistribution?: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export default function ProductReports() {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockLevelSummary, setStockLevelSummary] = useState<{
    inStock: number;
    lowStock: number;
    outOfStock: number;
    total: number;
  }>({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [productsResponse, inventoryResponse] = await Promise.all([
          fetch("/api/reports/products"),
          fetch("/api/reports/products/inventory"),
        ]);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch product data");
        }

        const productData = await productsResponse.json();
        setData(productData);

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();

          // Calculate stock level summary
          const summary = inventoryData.reduce(
            (acc: any, item: any) => {
              if (item.status === "out-of-stock") acc.outOfStock++;
              else if (item.status === "low-stock") acc.lowStock++;
              else acc.inStock++;
              acc.total++;
              return acc;
            },
            { inStock: 0, lowStock: 0, outOfStock: 0, total: 0 }
          );

          setStockLevelSummary(summary);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Unable to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, []);

  const handleExportCSV = async () => {
    try {
      if (!data) {
        console.error("No product data available for export");
        return;
      }

      // Fetch detailed inventory data
      const inventoryResponse = await fetch(
        "/api/reports/products/inventory?limit=1000"
      );
      let inventoryData = [];

      if (inventoryResponse.ok) {
        const response = await inventoryResponse.json();
        inventoryData = response.products || [];
      }

      // Create comprehensive CSV data
      const csvData = [
        // Summary data
        ["Product Analytics Summary"],
        [""],
        ["Metric", "Value"],
        ["Total Products", data.totalProducts.toString()],
        ["In Stock Products", data.inStockCount.toString()],
        ["Low Stock Products", data.lowStockCount.toString()],
        ["Out of Stock Products", data.outOfStockCount.toString()],
        [
          "Total Inventory Value",
          `$${data.totalInventoryValue.toLocaleString()}`,
        ],
        ["Total Categories", data.totalCategories.toString()],
        ["Generated At", new Date().toLocaleString()],
        [""],
        // Detailed inventory data
        ["Detailed Inventory"],
        [""],
        [
          "Product Name",
          "Reference",
          "Category",
          "Supplier",
          "Stock Quantity",
          "Status",
          "Selling Price",
          "Total Value",
        ],
      ];

      // Add inventory details
      inventoryData.forEach((item: any) => {
        csvData.push([
          item.name || "",
          item.reference || "",
          item.category || "",
          item.supplier || "",
          item.inStock?.toString() || "0",
          item.status || "",
          `$${item.sellingPrice?.toFixed(2) || "0.00"}`,
          `$${item.totalValue?.toFixed(2) || "0.00"}`,
        ]);
      });

      const csvContent = csvData
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `product-inventory-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Product report exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Product Analytics
          </h2>
          <p className="text-gray-500">
            Inventory status and product performance metrics
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary hover:bg-primary/10"
          onClick={handleExportCSV}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Inventory
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">
                      {data?.totalProducts || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Active inventory items
                      </span>
                    </div>
                  </div>
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
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-amber-500">
                      {data?.lowStockCount || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-gray-500">
                        Items need restocking
                      </span>
                    </div>
                    <Progress
                      value={
                        ((data?.lowStockCount || 0) /
                          (data?.totalProducts || 1)) *
                        100
                      }
                      className="h-1.5 bg-amber-100"
                    />
                  </div>
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
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-red-500">
                      {data?.outOfStockCount || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-500">
                        Urgent attention needed
                      </span>
                    </div>
                    <Progress
                      value={
                        ((data?.outOfStockCount || 0) /
                          (data?.totalProducts || 1)) *
                        100
                      }
                      className="h-1.5 bg-red-100"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-start">
              <div>
                <CardTitle>Stock Level Summary</CardTitle>
                <CardDescription className="mt-1">
                  Current status of your inventory
                </CardDescription>
              </div>
              {stockLevelSummary.total > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    In Stock: {stockLevelSummary.inStock} (
                    {Math.round(
                      (stockLevelSummary.inStock / stockLevelSummary.total) *
                        100
                    )}
                    %)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                  >
                    Low Stock: {stockLevelSummary.lowStock} (
                    {Math.round(
                      (stockLevelSummary.lowStock / stockLevelSummary.total) *
                        100
                    )}
                    %)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Out of Stock: {stockLevelSummary.outOfStock} (
                    {Math.round(
                      (stockLevelSummary.outOfStock / stockLevelSummary.total) *
                        100
                    )}
                    %)
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="bg-white">
              <StockLevelsChart />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products by sales volume
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
              <TopSellingProducts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="text-center py-12 text-gray-500">
            <p>Product performance analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
