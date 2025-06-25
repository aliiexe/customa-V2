"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  Target,
  AlertTriangle,
  Eye,
  ArrowRight
} from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { CategoryDistribution } from "@/components/dashboard/category-distribution"
import { TopSellingProducts } from "@/components/dashboard/top-selling-products"
import { StockLevelsChart } from "@/components/dashboard/stock-levels-chart"
import { CriticalAlertsWidget } from "@/components/dashboard/critical-alerts-widget"
import { QuickActionsWidget } from "@/components/dashboard/quick-actions-widget"
import { RecentActivityWidget } from "@/components/dashboard/recent-activity-widget"
import { ProfitabilityWidget } from "@/components/dashboard/profitability-widget"
import Link from "next/link"

interface DashboardStats {
  // Financial metrics
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  totalProfit: number
  profitMargin: number
  
  // Inventory metrics
  totalProducts: number
  lowStockAlerts: number
  outOfStockCount: number
  totalInventoryValue: number
  
  // Order metrics
  pendingInvoices: number
  pendingInvoicesValue: number
  completedOrdersToday: number
  overdueInvoices: number
  
  // Customer metrics
  totalClients: number
  activeClients: number
  newClientsThisMonth: number
  topClientRevenue: number
  
  // Supplier metrics
  totalSuppliers: number
  unpaidSupplierInvoices: number
  unpaidSupplierAmount: number
  
  // Performance metrics
  avgOrderValue: number
  conversionRate: number
  customerSatisfaction: number
}

interface CriticalAlert {
  id: string
  type: 'stock' | 'payment' | 'order' | 'supplier'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  count?: number
  value?: number
  action?: {
    label: string
    href: string
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alerts, setAlerts] = useState<CriticalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // Last 30 days

  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/dashboard/stats?period=${dateRange}`),
        fetch('/api/dashboard/alerts')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor your business performance and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="outline" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <CriticalAlertsWidget alerts={alerts} onRefresh={fetchDashboardData} />
      )}

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <div className="flex items-center text-xs">
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(stats.revenueGrowth)}
              </span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              {formatCurrency(stats.totalProfit)} total profit
            </p>
          </CardContent>
        </Card>

        {/* Inventory Value Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(stats.totalInventoryValue)}
            </div>
            <p className="text-xs text-gray-600">
              {stats.totalProducts} products in stock
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders Card */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {stats.pendingInvoices}
            </div>
            <p className="text-xs text-gray-600">
              {formatCurrency(stats.pendingInvoicesValue)} value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-lg font-semibold">{stats.activeClients}</p>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-lg font-semibold">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-lg font-semibold text-orange-600">{stats.lowStockAlerts}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-lg font-semibold">{stats.totalSuppliers}</p>
              </div>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders Today</p>
                <p className="text-lg font-semibold text-green-600">{stats.completedOrdersToday}</p>
              </div>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-lg font-semibold text-red-600">{stats.overdueInvoices}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <p className="text-sm text-gray-600">Monthly performance overview</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/reports">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Products Performance */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <p className="text-sm text-gray-600">Best performers this period</p>
              </CardHeader>
              <CardContent>
                <TopSellingProducts />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Levels Overview</CardTitle>
                <p className="text-sm text-gray-600">Current inventory status</p>
              </CardHeader>
              <CardContent>
                <StockLevelsChart />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActionsWidget />

          {/* Recent Activity */}
          <RecentActivityWidget />

          {/* Profitability Widget */}
          <ProfitabilityWidget stats={stats} />

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <p className="text-sm text-gray-600">Product categories breakdown</p>
            </CardHeader>
            <CardContent>
              <CategoryDistribution />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}