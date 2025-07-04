"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRoles } from "@/hooks/use-user-roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, DollarSign, Package, ShoppingCart } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { CategoryDistribution } from "@/components/dashboard/category-distribution";
import { TopSellingProducts } from "@/components/dashboard/top-selling-products";
import { StockLevelsChart } from "@/components/dashboard/stock-levels-chart";

interface DashboardStats {
  totalProducts: number;
  lowStockAlerts: number;
  pendingInvoices: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { roles, loading: rolesLoading } = useUserRoles();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockAlerts: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (rolesLoading) return; // Wait for roles to load

    // Check user roles and redirect accordingly
    const userRoleNames = roles.map(r => r.roleName.toLowerCase());
    const isAdminOrManager = userRoleNames.includes("admin") || userRoleNames.includes("manager");
    const isSales = userRoleNames.includes("sales");

    if (isSales) {
      // Sales users should go to products page
      router.replace("/products");
    } else if (isAdminOrManager) {
      // Admin/Manager users can go to dashboard
      router.replace("/dashboard");
    } else {
      // Default fallback - if no specific role, go to products
      router.replace("/products");
    }
  }, [router, roles, rolesLoading]);

  if (rolesLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Loading...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-primary">Active products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockAlerts}</div>
            <p className="text-xs text-primary">
              Products with quantity &lt; 10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-primary">Unpaid client invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(stats.totalRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-primary">From paid invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistribution />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSellingProducts />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Stock Levels Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <StockLevelsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
