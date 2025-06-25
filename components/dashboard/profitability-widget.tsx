"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, DollarSign, Percent } from "lucide-react"

interface ProfitabilityWidgetProps {
  stats: {
    totalProfit: number
    profitMargin: number
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
  }
}

export function ProfitabilityWidget({ stats }: ProfitabilityWidgetProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

  const getProfitMarginStatus = (margin: number) => {
    if (margin >= 30) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' }
    if (margin >= 20) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    if (margin >= 10) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    return { label: 'Poor', color: 'bg-red-100 text-red-800 border-red-200' }
  }

  const marginStatus = getProfitMarginStatus(stats.profitMargin)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Profitability Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profit Margin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profit Margin</span>
            <Badge className={marginStatus.color}>
              {marginStatus.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-500" />
            <span className="text-2xl font-bold">{stats.profitMargin.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(stats.profitMargin, 100)}%` }}
            />
          </div>
        </div>

        {/* Total Profit */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Total Profit</span>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(stats.totalProfit)}
            </span>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Revenue Growth</span>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xl font-bold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Key Insights */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-2">Key Insights</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Monthly revenue: {formatCurrency(stats.monthlyRevenue)}</p>
            <p>• Total revenue: {formatCurrency(stats.totalRevenue)}</p>
            <p>• Profit per dollar: ${(stats.totalProfit / stats.totalRevenue).toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}